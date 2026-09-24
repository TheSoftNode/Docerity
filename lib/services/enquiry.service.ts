import {
  FILE_LIMITS,
  validateEnquiry,
  type EnquiryInput,
} from "@/lib/contact/schema";
import { RateLimitError, ValidationError } from "@/lib/core/errors";
import { createLogger, type Logger } from "@/lib/core/logger";
import { sendMail } from "@/lib/email/mailer";
import {
  renderEnquiryAcknowledgement,
  renderEnquiryNotification,
  type EnquiryAttachmentView,
} from "@/lib/email/templates/enquiry";
import { email as emailConfig, storage as storageConfig } from "@/lib/config/env";
import {
  describeAsset,
  resourceTypeFor,
  signedUrlFor,
  type ResourceType,
} from "@/lib/storage/cloudinary";
import type { EnquiryAttachment } from "@/lib/db/models/enquiry.model";
import * as repo from "@/lib/repositories/enquiry.repository";

const baseLogger = createLogger("enquiry");

/** What the browser claims it uploaded. Treated as a claim, not as fact. */
export type ClaimedAttachment = {
  originalName: string;
  publicId: string;
  resourceType: string;
  format: string;
  bytes: number;
  contentType: string;
};

export type SubmitEnquiryInput = EnquiryInput & {
  attachments: ClaimedAttachment[];
  submittedFromIp: string;
  userAgent: string;
};

/* Five per hour from one address. Enough that a genuine sender following up
   is never blocked, low enough that a stuck retry loop stops mattering. */
const RATE_LIMIT = { max: 5, windowMinutes: 60 };

/*
  Time budget for the two emails, sized to fit inside the contact route's
  `maxDuration` of 30s with room for the database writes that follow each send.
  A healthy Gmail send takes 1–3s, so this only ever bites when something is
  wrong — which is exactly when being killed mid-attempt would lose the
  delivery record.
*/
const DELIVERY_BUDGET = { notificationMs: 14_000, acknowledgementMs: 10_000 };

/**
 * Confirms each claimed attachment against Cloudinary.
 *
 * The browser uploads directly, so nothing about an attachment has passed
 * through this server. A caller could post a `public_id` belonging to someone
 * else's asset, or understate a file's size to slip past the limits. Asking
 * Cloudinary what it actually holds is the only way to record a fact rather
 * than a claim.
 *
 * A file that cannot be confirmed is kept but flagged, not silently dropped —
 * losing a client's PRD without telling anyone is the worse failure.
 */
async function verifyAttachments(
  claimed: ClaimedAttachment[],
  logger: Logger
): Promise<EnquiryAttachment[]> {
  if (claimed.length === 0) return [];

  return Promise.all(
    claimed.map(async (file): Promise<EnquiryAttachment> => {
      const resourceType: ResourceType =
        file.resourceType === "image" || file.resourceType === "raw"
          ? file.resourceType
          : resourceTypeFor(file.contentType);

      const base = {
        originalName: file.originalName,
        publicId: file.publicId,
        resourceType,
        format: file.format,
        contentType: file.contentType,
      };

      if (!storageConfig.isConfigured) {
        return { ...base, bytes: file.bytes, verified: false };
      }

      const asset = await describeAsset({ publicId: file.publicId, resourceType });

      if (!asset) {
        logger.warn("attachment could not be verified", { publicId: file.publicId });
        return { ...base, bytes: file.bytes, verified: false };
      }

      /* Cloudinary's byte count wins over the browser's. */
      return {
        ...base,
        bytes: asset.bytes,
        format: asset.format || file.format,
        verified: true,
      };
    })
  );
}

/** Re-checks verified sizes against the limits, now that they are trustworthy. */
function assertWithinLimits(attachments: EnquiryAttachment[]) {
  const total = attachments.reduce((sum, file) => sum + file.bytes, 0);

  if (total > FILE_LIMITS.maxBytesTotal) {
    throw new ValidationError("Those attachments are larger than the limit.", {
      fields: { files: "Those attachments are larger than the limit allows." },
      context: { totalBytes: total },
    });
  }

  const oversized = attachments.find((file) => file.bytes > FILE_LIMITS.maxBytesPerFile);
  if (oversized) {
    throw new ValidationError(`${oversized.originalName} is larger than the per-file limit.`, {
      fields: { files: `${oversized.originalName} is larger than the per-file limit.` },
    });
  }
}

export type SubmitResult = {
  reference: string;
  /** Runs the two emails. Call it from `after()` so SMTP never blocks the reply. */
  deliver: () => Promise<void>;
};

export async function submitEnquiry(
  input: SubmitEnquiryInput,
  options: { logger?: Logger } = {}
): Promise<SubmitResult> {
  const logger = options.logger ?? baseLogger;

  /* The same validator the browser ran. The client check is a convenience;
     this one is the authority. */
  const fields = validateEnquiry(input, input.attachments.map((file) => ({
    name: file.originalName,
    size: file.bytes,
    type: file.contentType,
  })));

  if (Object.keys(fields).length > 0) {
    throw new ValidationError("Some details need correcting.", { fields });
  }

  /* Counted in MongoDB rather than in memory: each serverless instance has
     its own memory and would each allow the full quota. */
  const recent = await repo.countRecentFromIp(input.submittedFromIp, RATE_LIMIT.windowMinutes);
  if (input.submittedFromIp !== "unknown" && recent >= RATE_LIMIT.max) {
    throw new RateLimitError(
      "That's several enquiries in a row — please give it an hour, or email me directly.",
      RATE_LIMIT.windowMinutes * 60,
      { context: { ip: input.submittedFromIp, recent } }
    );
  }

  const attachments = await verifyAttachments(input.attachments, logger);
  assertWithinLimits(attachments);

  const enquiry = await repo.createEnquiry({
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    company: input.company.trim(),
    role: input.role,
    projectType: input.projectType,
    budget: input.budget,
    timeline: input.timeline,
    message: input.message.trim(),
    attachments,
    submittedFromIp: input.submittedFromIp,
    userAgent: input.userAgent.slice(0, 400),
  });

  logger.info("enquiry stored", {
    reference: enquiry.reference,
    attachments: attachments.length,
    unverified: attachments.filter((file) => !file.verified).length,
  });

  return {
    reference: enquiry.reference,
    deliver: () => deliverEnquiryEmails(enquiry._id, enquiry.reference, input, attachments, logger),
  };
}

/**
 * Sends the notification and the acknowledgement.
 *
 * Separated from `submitEnquiry` so the route can run it after the response
 * has been flushed. Gmail's SMTP handshake alone costs a second or two, and
 * making the sender wait for it buys them nothing: the enquiry is already
 * durable by the time this starts.
 */
async function deliverEnquiryEmails(
  id: unknown,
  reference: string,
  input: SubmitEnquiryInput,
  attachments: EnquiryAttachment[],
  logger: Logger
): Promise<void> {
  const views: EnquiryAttachmentView[] = attachments.map((file) => ({
    name: file.originalName,
    bytes: file.bytes,
    url: file.verified && storageConfig.isConfigured
      ? safeSignedUrl(file.publicId, file.resourceType as ResourceType, logger)
      : "",
  }));

  const data = {
    reference,
    name: input.name,
    email: input.email,
    company: input.company,
    role: input.role,
    projectType: input.projectType,
    budget: input.budget,
    timeline: input.timeline,
    message: input.message,
    attachments: views,
  };

  const notification = renderEnquiryNotification(data);
  const acknowledgement = renderEnquiryAcknowledgement(data);

  /*
    Both sends share the route's time budget, split so the notification — the
    one that reaches a person — gets the larger share and is attempted first.
    `after` runs inside the route's maxDuration, so an unbounded retry budget
    would let the platform kill the function before either outcome is written.
  */
  const budgetStartedAt = Date.now();
  const notificationDeadline = budgetStartedAt + DELIVERY_BUDGET.notificationMs;
  const acknowledgementDeadline =
    budgetStartedAt + DELIVERY_BUDGET.notificationMs + DELIVERY_BUDGET.acknowledgementMs;

  /* Sequential: Gmail throttles concurrent connections from one account. */
  const notificationResult = await sendMail(
    {
      to: emailConfig.owner,
      subject: `New enquiry — ${input.name}${input.company ? ` (${input.company})` : ""}`,
      html: notification.html,
      text: notification.text,
      /* So hitting reply in the mail client answers the sender. */
      replyTo: input.email,
    },
    { deadline: notificationDeadline }
  );

  await repo.recordNotification(id, {
    delivered: notificationResult.ok,
    messageId: notificationResult.ok ? notificationResult.messageId : "",
    error: notificationResult.ok ? "" : notificationResult.error,
    attempts: notificationResult.ok ? 1 : notificationResult.attempts,
  });

  const acknowledgementResult = await sendMail(
    {
      to: input.email,
      subject: "Thanks — your enquiry reached Docerity",
      html: acknowledgement.html,
      text: acknowledgement.text,
      replyTo: emailConfig.owner,
    },
    { deadline: acknowledgementDeadline }
  );

  await repo.recordAcknowledgement(id, {
    delivered: acknowledgementResult.ok,
    messageId: acknowledgementResult.ok ? acknowledgementResult.messageId : "",
    error: acknowledgementResult.ok ? "" : acknowledgementResult.error,
  });

  if (!notificationResult.ok) {
    /* Loud, because this is the one that reaches a human. The enquiry is
       safe in MongoDB either way, but nobody knows to go and look. */
    logger.error("enquiry notification undelivered", undefined, {
      reference,
      reason: notificationResult.error,
    });
  }
}

function safeSignedUrl(publicId: string, resourceType: ResourceType, logger: Logger): string {
  try {
    return signedUrlFor({ publicId, resourceType });
  } catch (error) {
    /* A missing signing key must not cost the whole notification. */
    logger.warn("could not sign attachment url", {
      publicId,
      reason: error instanceof Error ? error.message : "unknown",
    });
    return "";
  }
}
