import { RateLimitError, ValidationError } from "@/lib/core/errors";
import { createLogger, type Logger } from "@/lib/core/logger";
import { sendMail } from "@/lib/email/mailer";
import { renderReviewNotification } from "@/lib/email/templates/review";
import { email as emailConfig, storage as storageConfig, runtime } from "@/lib/config/env";
import { cleanLinks, validateReview, type ReviewInput } from "@/lib/reviews/schema";
import { describeAsset } from "@/lib/storage/cloudinary";
import * as repo from "@/lib/repositories/review.repository";

/**
 * Submitting a review, and the rules around it.
 *
 * Everything here exists because the portfolio's version was
 * `Review.create(req.body)` on an open POST with no gate of any kind, so the
 * live site rendered whatever anybody sent it.
 */

const baseLogger = createLogger("review");

/*
  Three per day from one address. A review is a once-ever act for a given
  person, so this is generous; it exists to stop a script, not a client who
  changed their mind and resubmitted.
*/
const RATE_LIMIT = { max: 3, windowMinutes: 24 * 60 };

/* Gmail's handshake is 1-3s; this only bites when something is wrong. */
const NOTIFICATION_BUDGET_MS = 12_000;

export type SubmitReviewInput = ReviewInput & {
  /** A Cloudinary public_id the browser claims it uploaded, or "". */
  photoPublicId: string;
  submittedFromIp: string;
};

export type SubmitReviewResult = {
  /** Runs the owner notification. Call from `after()` so SMTP never blocks. */
  deliver: () => Promise<void>;
};

export async function submitReview(
  input: SubmitReviewInput,
  options: { logger?: Logger } = {}
): Promise<SubmitReviewResult> {
  const logger = options.logger ?? baseLogger;

  /* The same validator the browser ran. That one is a convenience; this is the
     authority, because the browser can be skipped entirely. */
  const fields = validateReview(input);
  if (Object.keys(fields).length > 0) {
    throw new ValidationError("Some details need correcting.", { fields });
  }

  /* Counted in MongoDB, not in memory: each serverless instance has its own
     memory and would each allow the full quota independently. */
  if (input.submittedFromIp !== "unknown") {
    const recent = await repo.countRecentFromIp(
      input.submittedFromIp,
      RATE_LIMIT.windowMinutes
    );
    if (recent >= RATE_LIMIT.max) {
      throw new RateLimitError(
        "That's a few reviews from here already. Email me instead and I'll add it myself.",
        RATE_LIMIT.windowMinutes * 60,
        { context: { ip: input.submittedFromIp, recent } }
      );
    }
  }

  const photoPublicId = await verifyPhoto(input.photoPublicId, logger);
  const links = cleanLinks(input.links);

  const review = await repo.createReview({
    fullName: input.fullName.trim(),
    title: input.title.trim(),
    body: input.body.trim(),
    rating: input.rating,
    photoPublicId,
    links,
    contactEmail: input.contactEmail.trim().toLowerCase(),
    submittedFromIp: input.submittedFromIp,
  });

  logger.info("review stored pending moderation", {
    id: String(review._id),
    rating: input.rating,
    hasPhoto: Boolean(photoPublicId),
  });

  return {
    deliver: () =>
      notifyOwner(
        {
          id: String(review._id),
          fullName: input.fullName.trim(),
          title: input.title.trim(),
          body: input.body.trim(),
          rating: input.rating,
          contactEmail: input.contactEmail.trim().toLowerCase(),
          links,
        },
        logger
      ),
  };
}

/**
 * Confirms the photo exists and is really an image.
 *
 * The browser uploads straight to Cloudinary, so the `public_id` arriving here
 * has not been seen by this server. An unverifiable one is dropped rather than
 * stored: unlike an enquiry attachment, where losing a client's document is the
 * worse failure, a missing avatar costs nothing and the UI already falls back
 * to initials.
 */
async function verifyPhoto(publicId: string, logger: Logger): Promise<string> {
  if (!publicId) return "";
  if (!storageConfig.isConfigured) return "";

  /* The delivery type has to match the upload, or Cloudinary reports a real
     asset as missing and the photo is dropped for no reason. */
  const asset = await describeAsset({
    publicId,
    resourceType: "image",
    deliveryType: "upload",
  });

  if (!asset) {
    logger.warn("review photo could not be verified, dropping it", { publicId });
    return "";
  }

  return publicId;
}

async function notifyOwner(
  review: {
    id: string;
    fullName: string;
    title: string;
    body: string;
    rating: number;
    contactEmail: string;
    links: { title: string; url: string }[];
  },
  logger: Logger
): Promise<void> {
  const rendered = renderReviewNotification({
    ...review,
    moderationUrl: `${runtime.siteUrl}/admin/reviews`,
  });

  const result = await sendMail(
    {
      to: emailConfig.owner,
      subject: `New review from ${review.fullName} (${review.rating}/5), awaiting approval`,
      html: rendered.html,
      text: rendered.text,
      /* Replying goes to the reviewer, which is how you verify one is real. */
      replyTo: review.contactEmail,
    },
    { deadline: Date.now() + NOTIFICATION_BUDGET_MS }
  );

  if (!result.ok) {
    /*
      Logged and dropped. The review is already stored and visible in the
      moderation queue, so a failed notification delays finding it rather than
      losing it, and there is nothing useful to tell the submitter.
    */
    logger.warn("review notification was not delivered", { reason: result.error });
  }
}
