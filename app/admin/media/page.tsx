import type { Metadata } from "next";

import { requireStaff } from "@/lib/auth/dal";
import { storage } from "@/lib/config/env";
import { createLogger } from "@/lib/core/logger";
import { listAssets, type StoredAsset } from "@/lib/storage/cloudinary";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MediaGrid } from "@/components/admin/media-grid";

export const metadata: Metadata = { title: "Media" };

const logger = createLogger("admin.media");

/**
 * Everything uploaded, in one place.
 *
 * Read-only on purpose. Deleting from here would be deleting a file that some
 * page may still point at, and the failure is silent: a broken image on a
 * public page, days later, with nothing to connect it to the click that caused
 * it. Working out what still references an asset means walking every project,
 * post and content block, which is worth building when somebody actually needs
 * to reclaim space and is not worth guessing at now.
 */
export default async function AdminMediaPage() {
  await requireStaff("/admin/media");

  let images: StoredAsset[] = [];
  let videos: StoredAsset[] = [];
  let failed = false;

  if (storage.isConfigured) {
    try {
      [images, videos] = await Promise.all([
        listAssets({ folder: storage.postFolder, resourceType: "image", limit: 200 }),
        listAssets({ folder: storage.postFolder, resourceType: "video", limit: 100 }),
      ]);

      /* Project screenshots live in their own folder, and somebody looking for
         "that picture I uploaded" does not care which. */
      const [workImages, workVideos] = await Promise.all([
        listAssets({ folder: storage.workFolder, resourceType: "image", limit: 200 }),
        listAssets({ folder: storage.workFolder, resourceType: "video", limit: 100 }),
      ]);

      images = [...images, ...workImages];
      videos = [...videos, ...workVideos];
    } catch (error) {
      logger.error("could not list stored media", error);
      failed = true;
    }
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Uploads"
        title="Media"
        description="Everything uploaded through the editors, across projects and posts."
      />

      {!storage.isConfigured ? (
        <p className="mt-4 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Storage is not configured, so nothing can be uploaded yet. The images
          already on the site are files in the repository and are unaffected.
        </p>
      ) : failed ? (
        <p className="mt-4 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          The list could not be loaded. The files themselves are fine: this page
          asks Cloudinary what exists, and only that request failed.
        </p>
      ) : (
        <MediaGrid images={images} videos={videos} />
      )}
    </>
  );
}
