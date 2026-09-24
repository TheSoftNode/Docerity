import { withRoute } from "@/lib/http/handler";
import { success } from "@/lib/http/responses";
import { ValidationError } from "@/lib/core/errors";
import { storage } from "@/lib/config/env";
import { createUploadSignature, resourceTypeFor } from "@/lib/storage/cloudinary";
import { ACCEPTED_FILE_TYPES, FILE_LIMITS, formatBytes } from "@/lib/contact/schema";

/*
  Issues a short-lived, scoped signature so the browser can upload one
  attachment directly to Cloudinary.

  Why the file never passes through here: a serverless function receives the
  whole request body in memory and Vercel caps that at 4.5MB, so a 10MB PRD
  could not arrive no matter what the form promised. The alternative the
  portfolio backend uses — multer writing to local disk — is worse on a
  platform with an ephemeral filesystem, because those files are deleted on the
  next deploy. That is why attachment links in already-sent portfolio contact
  emails now 404.

  Why signed rather than an unsigned preset: an unsigned preset name lives in
  the browser bundle, and anyone who reads it can upload anything to the
  account. A signature is generated here from the API secret, which never
  reaches the client, and is bound to a folder and a timestamp.
*/

export const runtime = "nodejs";

export const POST = withRoute("api.contact.upload", async (request) => {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  const contentType = typeof body?.contentType === "string" ? body.contentType : "";
  const bytes = typeof body?.bytes === "number" ? body.bytes : 0;

  /*
    Checked before a signature is issued rather than after the upload. Once a
    signature exists the file goes straight to Cloudinary, so this is the last
    point at which an unwanted type can be refused without paying to store it.
  */
  if (!ACCEPTED_FILE_TYPES.includes(contentType as (typeof ACCEPTED_FILE_TYPES)[number])) {
    throw new ValidationError("That file type isn't supported.", {
      fields: { files: "That file type isn't supported." },
      context: { contentType },
    });
  }

  if (bytes <= 0 || bytes > FILE_LIMITS.maxBytesPerFile) {
    throw new ValidationError("That file is too large.", {
      fields: {
        files: `Each file has to be under ${formatBytes(FILE_LIMITS.maxBytesPerFile)}.`,
      },
      context: { bytes },
    });
  }

  /* Throws ServiceUnavailableError when Cloudinary isn't configured, which the
     form reports against the attachments field and still lets the enquiry
     through without files. */
  const signature = createUploadSignature({
    folder: storage.enquiryFolder,
    resourceType: resourceTypeFor(contentType),
  });

  return success(signature);
});
