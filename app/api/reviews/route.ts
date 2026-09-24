import { after } from "next/server";

import { withRoute } from "@/lib/http/handler";
import { success } from "@/lib/http/responses";
import { ValidationError } from "@/lib/core/errors";
import { REVIEW_LIMITS, type ReviewLinkInput } from "@/lib/reviews/schema";
import { submitReview } from "@/lib/services/review.service";

/*
  Where a customer's review arrives.

  The portfolio's equivalent was `Review.create(req.body)` on an open POST, so
  whatever anyone sent appeared on the live site straight away. Three things
  differ here: nothing is public until it is approved (the status is set by the
  repository, not taken from the body), submissions are counted per IP, and the
  photo is confirmed against Cloudinary rather than trusted.
*/

export const runtime = "nodejs";
export const maxDuration = 30;

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function parseLinks(value: unknown): ReviewLinkInput[] {
  if (!Array.isArray(value)) return [];

  if (value.length > REVIEW_LIMITS.maxLinks) {
    throw new ValidationError("Too many links.", {
      fields: { links: `Up to ${REVIEW_LIMITS.maxLinks} links.` },
    });
  }

  return value.flatMap((entry): ReviewLinkInput[] => {
    if (typeof entry !== "object" || entry === null) return [];
    const record = entry as Record<string, unknown>;
    return [{ title: text(record.title).slice(0, 80), url: text(record.url).slice(0, 500) }];
  });
}

export const POST = withRoute("api.reviews", async (request, { logger, ip }) => {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body) throw new ValidationError("That submission couldn't be read.");

  /* Same honeypot as the enquiry form: a field people never see, which bots
     fill in anyway. Answered as though it worked so the bot learns nothing. */
  if (text(body.website).trim().length > 0) {
    logger.info("honeypot triggered", { ip });
    return success({ received: true });
  }

  const result = await submitReview(
    {
      fullName: text(body.fullName),
      title: text(body.title),
      body: text(body.body),
      /* A string from a radio input, a number from JSON. `Number()` on a
         non-numeric string gives NaN, which the validator rejects rather than
         coercing to 0 and storing a rating nobody chose. */
      rating: Number(body.rating),
      contactEmail: text(body.contactEmail),
      links: parseLinks(body.links),
      photoPublicId: text(body.photoPublicId),
      submittedFromIp: ip,
    },
    { logger }
  );

  /* The owner's notification runs after the response is flushed; the review is
     already stored, and the submitter has nothing to gain from waiting. */
  after(async () => {
    try {
      await result.deliver();
    } catch (error) {
      logger.error("review notification failed after response", error);
    }
  });

  return success({ received: true }, { status: 201 });
});
