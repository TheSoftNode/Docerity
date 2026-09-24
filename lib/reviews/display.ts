import "server-only";

import { database, storage } from "@/lib/config/env";
import { createLogger } from "@/lib/core/logger";
import { listPublished } from "@/lib/repositories/review.repository";
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

export type PublicReview = {
  id: string;
  fullName: string;
  title: string;
  body: string;
  rating: number;
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
export async function getPublicReviews(limit = 24): Promise<PublicReview[]> {
  if (!database.isConfigured) return [];

  try {
    const reviews = await listPublished(limit);

    return reviews.map((review) => ({
      id: String(review._id),
      fullName: review.fullName,
      title: review.title,
      body: review.body,
      rating: review.rating,
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
