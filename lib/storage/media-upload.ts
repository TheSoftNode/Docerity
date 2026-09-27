import "server-only";

import { ValidationError } from "@/lib/core/errors";
import { createUploadSignature } from "@/lib/storage/cloudinary";

/**
 * The rules every site-media upload follows, in one place.
 *
 * Two routes ask for these signatures: project screenshots and the images and
 * clips inside a post's body. They differ in who is allowed to ask and which
 * Cloudinary folder the file lands in, and in nothing else. Keeping the type
 * list and the size ceilings here means a format accepted on one and refused
 * on the other can only happen deliberately.
 */

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/avif"] as const;

/*
  Video, for a demo clip.

  MP4 and WebM cover every browser between them, and QuickTime is what a Mac
  screen recording produces, so refusing it would mean asking somebody to
  convert a file Cloudinary transcodes anyway.
*/
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"] as const;

/* Screenshots are wide and detailed, so the ceiling is higher than a review
   photo's 5MB. Anything past this is an unresized export. */
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

/*
  Video gets far more room, because a screen recording is large before
  Cloudinary has transcoded it and the whole point is not making somebody
  compress it by hand first. 200MB is Cloudinary's own free-tier ceiling for a
  single asset, so a larger file would be refused after the upload rather than
  before it.
*/
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

export const MEDIA_UPLOAD_LIMITS = {
  imageTypes: IMAGE_TYPES,
  videoTypes: VIDEO_TYPES,
  maxImageBytes: MAX_IMAGE_BYTES,
  maxVideoBytes: MAX_VIDEO_BYTES,
} as const;

/**
 * Checks what the browser says it is about to upload, and signs it.
 *
 * `upload` delivery rather than `authenticated`: these are rendered on public
 * pages, so an expiring signed URL would start answering 401 and could not be
 * cached by a CDN in the meantime.
 *
 * Throws `ValidationError` for anything refused, which the route handler turns
 * into a 422 with the message against the field.
 */
export function signMediaUpload(body: Record<string, unknown> | null, folder: string) {
  const contentType = typeof body?.contentType === "string" ? body.contentType : "";
  const bytes = typeof body?.bytes === "number" ? body.bytes : 0;

  const isImage = IMAGE_TYPES.includes(contentType as (typeof IMAGE_TYPES)[number]);
  const isVideo = VIDEO_TYPES.includes(contentType as (typeof VIDEO_TYPES)[number]);

  if (!isImage && !isVideo) {
    throw new ValidationError(
      "That has to be an image (PNG, JPEG, WebP, AVIF) or a video (MP4, WebM, MOV).",
      {
        fields: { media: "An image or a video, please." },
        context: { contentType },
      }
    );
  }

  const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;

  if (bytes <= 0 || bytes > limit) {
    throw new ValidationError(
      isVideo ? "That video is too large." : "That image is too large.",
      {
        fields: {
          media: isVideo
            ? "Keep it under 200MB. A minute of screen capture is usually far less."
            : "Keep it under 15MB. A screenshot should be far smaller.",
        },
        context: { bytes },
      }
    );
  }

  /* Cloudinary keeps images and video in separate namespaces, so the resource
     type has to be decided here and sent back for the browser to post to the
     matching endpoint. */
  return createUploadSignature({
    folder,
    resourceType: isVideo ? "video" : "image",
    deliveryType: "upload",
  });
}
