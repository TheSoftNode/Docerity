import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { ACCEPTED_FILE_TYPES, FILE_LIMITS } from "@/lib/contact/schema";

/*
  Issues short-lived, scoped tokens so the browser can upload attachments
  directly to Blob storage.

  Why not keep posting files through the enquiry route? Two reasons.

  A serverless function receives the entire request body in memory and Vercel
  caps that at 4.5MB, so a 10MB PRD could never arrive no matter what the form
  claimed. And the portfolio backend's alternative — multer writing to local
  disk — is worse on a platform with an ephemeral filesystem: those files are
  deleted on the next deploy, which is why the attachment links in already-sent
  portfolio contact emails now 404.

  The trade-off is that the file never passes through our code, so the
  constraints have to be declared up front in the token. `allowedContentTypes`
  and `maximumSizeInBytes` are enforced by Blob itself. A client that skips our
  form and calls the API directly still cannot store a 2GB executable.
*/

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    /*
      Surfaced as a clear message rather than a generic 500: without this the
      failure reads as "upload broke" when the real cause is an unset variable.
      The form treats it as an attachment-only failure and still lets the
      enquiry through without files.
    */
    return NextResponse.json(
      {
        error:
          "File uploads are not configured on this deployment. Send your enquiry without attachments and I'll follow up by email.",
      },
      { status: 503 }
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [...ACCEPTED_FILE_TYPES],
        maximumSizeInBytes: FILE_LIMITS.maxBytesPerFile,
        /* Two visitors both attaching "prd.pdf" must not collide, and the
           random suffix also stops anyone guessing another enquiry's URL. */
        addRandomSuffix: true,
        /* Tokens are for one submission, not a standing upload grant. */
        validUntil: Date.now() + 60 * 60 * 1000,
      }),
      /*
        No `onUploadCompleted`: the enquiry route records the attachment
        metadata when the form is submitted, so there is nothing to reconcile
        here. It would also never fire in local development, since Vercel
        cannot call back to localhost.
      */
    });

    return NextResponse.json(result);
  } catch (reason) {
    const message =
      reason instanceof Error ? reason.message : "Could not prepare the upload.";
    console.error("[contact/upload]", reason);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
