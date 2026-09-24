import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/dal";
import { database } from "@/lib/config/env";
import { emptyPost, type PostType } from "@/lib/content/post-schema";
import { PostEditor } from "@/components/admin/post-editor";
import { AdminNoDatabase, AdminPageHeader } from "@/components/admin/admin-page-header";

export const metadata: Metadata = { title: "New post" };

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  await requireUser("/admin/posts/new");

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

  return <PostEditor initial={emptyPost(kind)} />;
}
