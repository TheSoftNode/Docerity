import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth/dal";
import { can } from "@/lib/auth/permissions";
import { findPostById } from "@/lib/repositories/post.repository";
import { PostEditor } from "@/components/admin/post-editor";
import type { PostInput } from "@/lib/content/post-schema";

export const metadata: Metadata = { title: "Edit post" };

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser(`/admin/posts/${id}`);

  /*
    A malformed id is a 404, not a 500.

    `findPostById` passes the segment straight to `findById`, and Mongoose
    throws a CastError on anything that is not 24 hex characters. Someone
    trimming a URL should get "not found" rather than an error page.
  */
  if (!/^[0-9a-fA-F]{24}$/.test(id)) notFound();

  const post = await findPostById(id);
  if (!post) notFound();

  /*
    A contributor may only open their own work, and a published post is beyond
    even that: otherwise "cannot publish" would be decorative, since anybody
    could submit something harmless, wait for approval, and rewrite the body in
    place afterwards.

    `notFound` rather than a 403, because a 403 confirms the id exists and turns
    this route into a way of probing for valid ones.
  */
  if (!can.seeAllPosts(user.role) && String(post.authorId ?? "") !== user.id) notFound();
  if (!can.publishPosts(user.role) && post.status === "published") notFound();

  /* Mapped to the editor's input shape: Dates become strings, and the nullable
     document fields become the defaults the form expects. */
  const initial: PostInput = {
    type: post.type as PostInput["type"],
    slug: post.slug,
    title: post.title,
    hook: post.hook,
    readTime: post.readTime ?? "",
    tags: post.tags ?? [],
    status: post.status as PostInput["status"],
    publishedAt: post.publishedAt ? post.publishedAt.toISOString().slice(0, 10) : "",
    body: (post.body ?? []).map((section) => ({
      heading: section.heading,
      paragraphs: section.paragraphs ?? [""],
      sidenote: section.sidenote ?? "",
      media: section.media
        ? {
            type: section.media.type as "image" | "video",
            alt: section.media.alt ?? "",
            caption: section.media.caption ?? "",
          }
        : null,
    })),
    concept: post.concept
      ? {
          label: post.concept.label,
          caption: post.concept.caption,
          iconName: post.concept.iconName,
        }
      : null,
    analogy: post.analogy
      ? {
          label: post.analogy.label,
          caption: post.analogy.caption,
          iconName: post.analogy.iconName,
        }
      : null,
    topic: post.topic ?? "",
    iconName: post.iconName ?? "",
  };

  /* An existing post with no sections would leave the editor with nothing to
     type into. Only reachable for a document written outside the editor. */
  if (initial.body.length === 0) {
    initial.body = [{ heading: "", paragraphs: [""], sidenote: "", media: null }];
  }

  return <PostEditor initial={initial} postId={id} role={user.role} />;
}
