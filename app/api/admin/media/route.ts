import { getCurrentUser } from "@/lib/auth/dal";
import { withRoute } from "@/lib/http/handler";
import { failure, success } from "@/lib/http/responses";
import { storage } from "@/lib/config/env";
import { listAssets } from "@/lib/storage/cloudinary";

/*
  What has already been uploaded, for the picker in the editors.

  Signed in only, and read-only. The folders are fixed here rather than taken
  from the query: a caller-supplied prefix would let anyone signed in list any
  folder in the account, including the enquiry attachments, which are private
  correspondence and are stored with `authenticated` delivery precisely so they
  cannot be browsed.
*/

export const runtime = "nodejs";

const FOLDERS = {
  posts: () => storage.postFolder,
  work: () => storage.workFolder,
} as const;

export const GET = withRoute("api.admin.media", async (request) => {
  const user = await getCurrentUser();
  const requestId = request.headers.get("x-request-id") ?? "unknown";

  if (!user) {
    return failure(401, "unauthorized", "Please sign in again.", { requestId });
  }

  const { searchParams } = new URL(request.url);
  const which = searchParams.get("folder") ?? "posts";
  const folder = FOLDERS[which as keyof typeof FOLDERS];

  if (!folder) {
    return failure(400, "bad_request", "That is not a folder.", { requestId });
  }

  const kind = searchParams.get("type") === "video" ? "video" : "image";

  /* An empty list rather than a 503 with no storage: the picker shows its
     empty state, and the upload button beside it is hidden for the same
     reason, so nothing in the UI promises something that cannot work. */
  const assets = await listAssets({ folder: folder(), resourceType: kind, limit: 200 });

  return success({ assets });
});
