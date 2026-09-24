"use server";

import { revalidatePath } from "next/cache";

import { requireUserOrThrow } from "@/lib/auth/dal";
import { createLogger } from "@/lib/core/logger";
import { isAppError } from "@/lib/core/errors";
import { storage } from "@/lib/config/env";
import { destroyAsset } from "@/lib/storage/cloudinary";
import {
  deleteReview,
  findReviewById,
  setStatus,
} from "@/lib/repositories/review.repository";

/**
 * Moderation.
 *
 * Every action re-checks the session with `requireUserOrThrow`. Rendering the
 * moderation page behind a guard is not enough: a Server Action is a POST
 * endpoint against the page's URL, and anyone who can send that POST reaches
 * this code without the page ever rendering.
 */

const logger = createLogger("admin.reviews");

export type ActionResult = { ok: true } | { ok: false; message: string };

/** One wrapper so each action is the rule it enforces and nothing else. */
async function guarded(
  what: string,
  run: (actor: { id: string; email: string }) => Promise<void>
): Promise<ActionResult> {
  try {
    const user = await requireUserOrThrow();
    await run(user);
    return { ok: true };
  } catch (error) {
    if (isAppError(error)) return { ok: false, message: error.publicMessage };
    logger.error(`${what} failed`, error);
    return { ok: false, message: "That did not work. Please try again." };
  }
}

/**
 * Both public surfaces are revalidated, not just this one.
 *
 * An approved review appears on `/reviews` and in the homepage testimonial
 * rotation, and both are cached with a `revalidate` window. Invalidating only
 * one would leave the other showing yesterday's set for up to five minutes,
 * which reads as the approval not having worked.
 */
function revalidatePublicReviews() {
  revalidatePath("/reviews");
  revalidatePath("/");
}

export async function approveReview(id: string): Promise<ActionResult> {
  return guarded("approve", async (actor) => {
    await setStatus(id, "approved");
    revalidatePublicReviews();
    revalidatePath("/admin/reviews");
    logger.info("review approved", { id, by: actor.email });
  });
}

export async function rejectReview(id: string): Promise<ActionResult> {
  return guarded("reject", async (actor) => {
    await setStatus(id, "rejected");
    /* Revalidated on reject too: this may be un-approving something already
       live, in which case the public page has to lose it. */
    revalidatePublicReviews();
    revalidatePath("/admin/reviews");
    logger.info("review rejected", { id, by: actor.email });
  });
}

export async function removeReview(id: string): Promise<ActionResult> {
  return guarded("delete", async (actor) => {
    /*
      The photo is destroyed before the document, because the document is the
      only record of which asset belonged to this review. Deleting the row
      first would orphan the file in Cloudinary with nothing left pointing at
      it, and those count against the account's storage forever.
    */
    const review = await findReviewById(id);

    if (review?.photoPublicId && storage.isConfigured) {
      await destroyAsset({
        publicId: review.photoPublicId,
        resourceType: "image",
        deliveryType: "upload",
      });
    }

    await deleteReview(id);
    revalidatePublicReviews();
    revalidatePath("/admin/reviews");
    logger.info("review deleted", { id, by: actor.email });
  });
}
