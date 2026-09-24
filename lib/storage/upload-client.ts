/**
 * Browser-side direct upload to Cloudinary.
 *
 * Runs in the browser, so it never imports the Cloudinary SDK; that pulls in
 * Node built-ins and the API secret must never be near client code. It asks
 * this app for a signature, then posts the file to Cloudinary itself.
 */

export type UploadedAttachment = {
  originalName: string;
  publicId: string;
  resourceType: string;
  format: string;
  bytes: number;
  contentType: string;
};

type SignatureResponse = {
  ok: boolean;
  data?: {
    cloudName: string;
    apiKey: string;
    signature: string;
    timestamp: number;
    folder: string;
    resourceType: string;
    uploadUrl: string;
    type: string;
  };
  error?: { message: string };
};

export class UploadError extends Error {}

export async function uploadAttachment(
  file: File,
  options: { signal?: AbortSignal } = {}
): Promise<UploadedAttachment> {
  /* Step one: ask our server to sign this specific upload. It re-checks the
     type and size here, which is the last point before the bytes leave. */
  const signatureResponse = await fetch("/api/contact/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type, bytes: file.size }),
    signal: options.signal,
  });

  const payload = (await signatureResponse.json().catch(() => null)) as SignatureResponse | null;

  if (!signatureResponse.ok || !payload?.ok || !payload.data) {
    throw new UploadError(payload?.error?.message ?? "Could not prepare the upload.");
  }

  const signed = payload.data;

  /*
    Step two: post to Cloudinary.

    Every field Cloudinary signs must appear here and must match what the
    server signed: timestamp, folder and type. Adding another signed
    parameter, or omitting one, produces "Invalid Signature", which is why
    these are read from the response rather than hard-coded on both sides.
  */
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signed.apiKey);
  form.append("timestamp", String(signed.timestamp));
  form.append("signature", signed.signature);
  form.append("folder", signed.folder);
  form.append("type", signed.type);

  const uploadResponse = await fetch(signed.uploadUrl, {
    method: "POST",
    body: form,
    signal: options.signal,
  });

  if (!uploadResponse.ok) {
    const detail = (await uploadResponse.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null;
    throw new UploadError(
      detail?.error?.message ?? `Upload failed (${uploadResponse.status}).`
    );
  }

  const result = (await uploadResponse.json()) as {
    public_id: string;
    bytes: number;
    format?: string;
    resource_type: string;
  };

  return {
    /* Cloudinary's public_id is generated; the display name is ours to keep. */
    originalName: file.name,
    publicId: result.public_id,
    resourceType: result.resource_type,
    format: result.format ?? "",
    bytes: result.bytes,
    contentType: file.type,
  };
}
