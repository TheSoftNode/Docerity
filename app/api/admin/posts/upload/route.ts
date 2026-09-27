import { getCurrentUser } from "@/lib/auth/dal";
import { withRoute } from "@/lib/http/handler";
import { failure, success } from "@/lib/http/responses";
import { storage } from "@/lib/config/env";
import { signMediaUpload } from "@/lib/storage/media-upload";

/*
  A signature for an image or a clip inside a post's body.

  Anyone signed in, including a contributor, unlike the work equivalent. A
  contributor can write a post and cannot publish one, so the worst a bad
  upload does is sit in a draft an editor has to approve before anybody sees
  it. Requiring staff here would mean an editor re-uploading every screenshot
  a mentee wrote about, which is the kind of friction that ends with people
  pasting links to images on someone else's server.

  Its own Cloudinary folder, apart from the work one, so nothing a contributor
  uploads can land where the work page reads from.
*/

export const runtime = "nodejs";

export const POST = withRoute("api.admin.posts.upload", async (request) => {
  const user = await getCurrentUser();
  const requestId = request.headers.get("x-request-id") ?? "unknown";

  if (!user) {
    return failure(401, "unauthorized", "Please sign in again.", { requestId });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  return success(signMediaUpload(body, storage.postFolder));
});
