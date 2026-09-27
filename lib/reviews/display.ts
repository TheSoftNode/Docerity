import "server-only";

import { database, storage } from "@/lib/config/env";
import { createLogger } from "@/lib/core/logger";
import { listPublished } from "@/lib/repositories/review.repository";
import type { ReviewKind } from "@/lib/reviews/schema";
import { cloudinaryImageUrl } from "@/lib/storage/public-url";

/**
 * Approved reviews, shaped for rendering.
 *
 * A Data Transfer Object rather than the lean document. `contactEmail`,
 * `submittedFromIp` and `status` exist on a review and none of them belong in a
 * page that anybody can read. `listPublished` already projects them away; this
 * makes that a type rather than a habit, so adding a field to the schema cannot
 * quietly publish it.
 */

const logger = createLogger("reviews.display");

/**
 * How many approved reviews a testimonial section needs before it appears.
 *
 * Every other section on this site falls back to static content when the
 * database is unreachable. The testimonial sections deliberately do not: a
 * fallback here would mean inventing people, which is what they all used to do
 * ("Client Name, Title, Company"). One quote also reads as the only one anyone
 * ever left, so the floor is two.
 */
export const TESTIMONIAL_MINIMUM = 2;

export type PublicReview = {
  id: string;
  fullName: string;
  title: string;
  body: string;
  rating: number;
  kind: ReviewKind;
  /** A delivery URL, or "" when there is no photo. Never a public_id. */
  photoUrl: string;
  links: { title: string; url: string }[];
  publishedAt: string;
};

/**
 * Returns an empty list rather than throwing when there is no database.
 *
 * The page that calls this renders a form whether or not any reviews exist, and
 * an unreachable Atlas must not take the form down with it: somebody trying to
 * leave a review would see an error page instead.
 */
export async function getPublicReviews(
  limit = 24,
  kind?: ReviewKind
): Promise<PublicReview[]> {
  if (!database.isConfigured) return [];

  try {
    const reviews = await listPublished(limit, kind);

    return reviews.map((review) => ({
      id: String(review._id),
      fullName: review.fullName,
      title: review.title,
      body: review.body,
      rating: review.rating,
      kind: (review.kind ?? "client") as ReviewKind,
      photoUrl:
        review.photoPublicId && storage.isConfigured
          ? cloudinaryImageUrl(review.photoPublicId, { width: 192, height: 192 })
          : "",
      links: (review.links ?? []).map((link) => ({ title: link.title, url: link.url })),
      publishedAt: review.createdAt?.toISOString() ?? "",
    }));
  } catch (error) {
    logger.error("could not load published reviews", error);
    return [];
  }
}
