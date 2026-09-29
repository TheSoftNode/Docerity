"use server";

import { revalidatePath } from "next/cache";

import { requireStaffOrThrow } from "@/lib/auth/dal";
import { isAppError } from "@/lib/core/errors";
import { createLogger } from "@/lib/core/logger";
import { destroyAsset } from "@/lib/storage/cloudinary";
import { findMediaUsage, type MediaUse } from "@/lib/repositories/media-usage.repository";

/**
 * Deleting an uploaded file.
 *
 * Staff only, and checked here rather than only in the page: this is a POST
 * endpoint against the page's URL and is reachable without the page ever being
 * rendered.
 *
 * The delete is refused while anything still points at the file. That is the
 * whole reason this page was read-only before — a deleted file that a project
 * still references is a broken image on a public page, discovered days later
 * with nothing connecting it to the click. Passing `force` is how somebody
 * says they understand that, and the answer names what will break first.
 */

const logger = createLogger("admin.media");

export type MediaResult =
  | { ok: true }
  | { ok: false; message: string; usedBy?: MediaUse[] };

export async function checkMediaUsage(
  publicId: string
): Promise<{ ok: true; usedBy: MediaUse[] } | { ok: false; message: string }> {
  try {
    await requireStaffOrThrow();
    return { ok: true, usedBy: await findMediaUsage(publicId) };
  } catch (error) {
    if (isAppError(error)) return { ok: false, message: error.publicMessage };
    logger.error("could not check media usage", error, { publicId });
    return { ok: false, message: "Could not check where this is used." };
  }
}

export async function deleteMedia(
  publicId: string,
  resourceType: "image" | "video",
  force = false
): Promise<MediaResult> {
  try {
    const user = await requireStaffOrThrow();

    if (!publicId) return { ok: false, message: "No file was named." };

    const usedBy = await findMediaUsage(publicId);

    if (usedBy.length > 0 && !force) {
      return {
        ok: false,
        message: `Still used in ${usedBy.length} ${usedBy.length === 1 ? "place" : "places"}.`,
        usedBy,
      };
    }

    const destroyed = await destroyAsset({
      publicId,
      resourceType,
      /* `upload`, not the default `authenticated`: everything in the media
         library is public delivery, and destroying the wrong delivery type
         silently reports success while leaving the file in place. */
      deliveryType: "upload",
    });

    if (!destroyed) {
      return { ok: false, message: "Cloudinary did not confirm the delete. Nothing changed." };
    }

    revalidatePath("/admin/media");
    logger.info("media deleted", { publicId, forced: force, by: user.email });

    return { ok: true };
  } catch (error) {
    if (isAppError(error)) return { ok: false, message: error.publicMessage };
    logger.error("could not delete media", error, { publicId });
    return { ok: false, message: "That could not be deleted. Please try again." };
  }
}
