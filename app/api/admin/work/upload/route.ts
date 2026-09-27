import { getCurrentUser } from "@/lib/auth/dal";
import { isStaff } from "@/lib/auth/permissions";
import { withRoute } from "@/lib/http/handler";
import { failure, success } from "@/lib/http/responses";
import { storage } from "@/lib/config/env";
import { signMediaUpload } from "@/lib/storage/media-upload";

/*
  A signature for one project screenshot or demo clip.

  Staff only, and checked here rather than by the proxy: `/api/admin/*` is
  outside the proxy's matcher because a 302 to an HTML login page is useless to
  a fetch. A contributor writing an explainer has no business uploading to the
  work section, and has `/api/admin/posts/upload` for their own body images.

  What counts as an acceptable file lives in `lib/storage/media-upload.ts`,
  shared with that route so the two cannot drift apart.
*/

export const runtime = "nodejs";

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

  return success(signMediaUpload(body, storage.workFolder));
});
