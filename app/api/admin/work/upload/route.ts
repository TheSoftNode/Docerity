import { getCurrentUser } from "@/lib/auth/dal";
import { isStaff } from "@/lib/auth/permissions";
import { withRoute } from "@/lib/http/handler";
import { failure, success } from "@/lib/http/responses";
import { ValidationError } from "@/lib/core/errors";
import { storage } from "@/lib/config/env";
import { createUploadSignature } from "@/lib/storage/cloudinary";

/*
  A signature for one project screenshot.

  Staff only, and checked here rather than by the proxy: `/api/admin/*` is
  outside the proxy's matcher because a 302 to an HTML login page is useless to
  a fetch. A contributor writing an explainer has no business uploading to the
  work section.

  `upload` delivery rather than `authenticated`: these are rendered on the
  public work page, so an expiring signed URL would start answering 401 and
  could not be cached by a CDN in the meantime.
*/

export const runtime = "nodejs";

const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/avif"] as const;

/* Screenshots are wide and detailed, so the ceiling is higher than a review
   photo's 5MB. Anything past this is an unresized export. */
const MAX_BYTES = 15 * 1024 * 1024;

export const POST = withRoute("api.admin.work.upload", async (request) => {
  const user = await getCurrentUser();
  const requestId = request.headers.get("x-request-id") ?? "unknown";

  if (!user) {
    return failure(401, "unauthorized", "Please sign in again.", { requestId });
  }
  if (!isStaff(user.role)) {
    return failure(403, "forbidden", "Only editors can change the work section.", {
      requestId,
    });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const contentType = typeof body?.contentType === "string" ? body.contentType : "";
  const bytes = typeof body?.bytes === "number" ? body.bytes : 0;

  if (!ACCEPTED.includes(contentType as (typeof ACCEPTED)[number])) {
    throw new ValidationError("That has to be a PNG, JPEG, WebP or AVIF image.", {
      fields: { media: "PNG, JPEG, WebP or AVIF, please." },
      context: { contentType },
    });
  }

  if (bytes <= 0 || bytes > MAX_BYTES) {
    throw new ValidationError("That image is too large.", {
      fields: { media: "Keep it under 15MB. A screenshot should be far smaller." },
      context: { bytes },
    });
  }

  return success(
    createUploadSignature({
      folder: storage.workFolder,
      resourceType: "image",
      deliveryType: "upload",
    })
  );
});
