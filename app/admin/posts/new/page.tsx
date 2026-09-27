import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/dal";
import { database, storage } from "@/lib/config/env";
import { emptyPost, type PostType } from "@/lib/content/post-schema";
import { PostEditor } from "@/components/admin/post-editor";
import { AdminNoDatabase, AdminPageHeader } from "@/components/admin/admin-page-header";

export const metadata: Metadata = { title: "New post" };

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const user = await requireUser("/admin/posts/new");

  const { type } = await searchParams;
  /* The kind comes from the link that got here, and is switchable in the
     editor's rail afterwards. Anything unrecognised opens an explainer, which
     is the more common of the two. */
  const kind: PostType = type === "article" ? "article" : "explainer";

  if (!database.isConfigured) {
    return (
      <>
        <AdminPageHeader title="New post" />
        <div className="mt-6">
          <AdminNoDatabase what="Posts" />
        </div>
      </>
    );
  }

  /* Empty when Cloudinary is not configured, which is what hides the upload
     button in the body editor: there would be nowhere for the file to go. */
  const cloudName = storage.isConfigured ? storage.credentials.cloudName : "";

  return <PostEditor initial={emptyPost(kind)} role={user.role} cloudName={cloudName} />;
}
