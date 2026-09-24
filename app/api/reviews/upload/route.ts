import { withRoute } from "@/lib/http/handler";
import { success } from "@/lib/http/responses";
import { ValidationError } from "@/lib/core/errors";
import { storage } from "@/lib/config/env";
import { createUploadSignature } from "@/lib/storage/cloudinary";
import { ACCEPTED_PHOTO_TYPES, REVIEW_LIMITS } from "@/lib/reviews/schema";

/*
  A signature for one review photo.

  Separate from the enquiry's upload route rather than shared, because the two
  differ in every parameter that matters: the folder, the accepted types (images
  only here) and the size ceiling (5MB against 20MB). Folding them together
  would mean one endpoint that accepts a PDF for a headshot.
*/

export const runtime = "nodejs";

export const POST = withRoute("api.reviews.upload", async (request) => {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  const contentType = typeof body?.contentType === "string" ? body.contentType : "";
  const bytes = typeof body?.bytes === "number" ? body.bytes : 0;

  /* Checked before a signature exists. Once one is issued the file goes
     straight to Cloudinary, so this is the last point at which an unwanted
     type can be refused without paying to store it. */
  if (!ACCEPTED_PHOTO_TYPES.includes(contentType as (typeof ACCEPTED_PHOTO_TYPES)[number])) {
    throw new ValidationError("That has to be a PNG, JPEG or WebP image.", {
      fields: { photo: "PNG, JPEG or WebP, please." },
      context: { contentType },
    });
  }

  if (bytes <= 0 || bytes > REVIEW_LIMITS.maxPhotoBytes) {
    throw new ValidationError("That image is too large.", {
      fields: { photo: "Keep it under 5MB." },
      context: { bytes },
    });
  }

  /* `upload`, not `authenticated`: this photo is rendered on a page anybody
     can read, so an expiring signed URL would start returning 401 and could
     not be cached by a CDN in the meantime. */
  const signature = createUploadSignature({
    folder: storage.reviewFolder,
    resourceType: "image",
    deliveryType: "upload",
  });

  return success(signature);
});
