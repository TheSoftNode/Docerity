import { after } from "next/server";

import { withRoute } from "@/lib/http/handler";
import { success } from "@/lib/http/responses";
import { submitEnquiry, type ClaimedAttachment } from "@/lib/services/enquiry.service";
import { FILE_LIMITS } from "@/lib/contact/schema";
import { ValidationError } from "@/lib/core/errors";

/*
  Enquiries arrive as JSON. Attachments were uploaded by the browser straight
  to Cloudinary beforehand (see `./upload/route.ts`) and only their identifiers
  are posted here, so the body stays a few hundred bytes regardless of how
  large the files are; the 4.5MB serverless body cap never comes into play.

  The handler itself is thin on purpose: parse, delegate, respond. The rules
  live in the service, where they can be exercised without a web server.
*/

export const runtime = "nodejs";
export const maxDuration = 30;

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function parseAttachments(value: unknown): ClaimedAttachment[] {
  if (!Array.isArray(value)) return [];

  if (value.length > FILE_LIMITS.maxFiles) {
    throw new ValidationError("Too many attachments.", {
      fields: { files: `Up to ${FILE_LIMITS.maxFiles} files, please.` },
    });
  }

  return value.flatMap((entry): ClaimedAttachment[] => {
    if (typeof entry !== "object" || entry === null) return [];
    const record = entry as Record<string, unknown>;

    const publicId = text(record.publicId);
    const originalName = text(record.originalName);
    if (!publicId || !originalName) return [];

    return [
      {
        publicId,
        originalName,
        resourceType: text(record.resourceType),
        format: text(record.format),
        contentType: text(record.contentType),
        bytes: typeof record.bytes === "number" && record.bytes >= 0 ? record.bytes : 0,
      },
    ];
  });
}

export const POST = withRoute("api.contact", async (request, { logger, ip }) => {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body) {
    throw new ValidationError("That submission couldn't be read.");
  }

  /* Bots fill in every field they find; people never see this one. Answered
     as though it worked, so the bot learns nothing from the attempt. */
  if (text(body.website).trim().length > 0) {
    logger.info("honeypot triggered", { ip });
    return success({ reference: null });
  }

  const result = await submitEnquiry(
    {
      name: text(body.name),
      email: text(body.email),
      company: text(body.company),
      role: text(body.role),
      projectType: text(body.projectType),
      budget: text(body.budget),
      timeline: text(body.timeline),
      message: text(body.message),
      attachments: parseAttachments(body.attachments),
      submittedFromIp: ip,
      userAgent: request.headers.get("user-agent") ?? "",
    },
    { logger }
  );

  /*
    Email runs after the response is flushed.

    Gmail's SMTP handshake plus two sends is a second or two at best, and the
    sender gains nothing by waiting for it; the enquiry is already durable in
    MongoDB, and delivery outcomes are recorded on that document rather than
    reported back through this response.
  */
  after(async () => {
    try {
      await result.deliver();
    } catch (error) {
      /* `after` failures are invisible otherwise: the response has already
         gone, so an unhandled rejection here would vanish. */
      logger.error("post-response delivery failed", error, {
        reference: result.reference,
      });
    }
  });

  return success({ reference: result.reference });
});
