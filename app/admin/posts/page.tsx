import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { requireUser } from "@/lib/auth/dal";
import { database } from "@/lib/config/env";
import { countPostsByStatus, listAllPosts } from "@/lib/repositories/post.repository";
import {
  AdminEmptyState,
  AdminNoDatabase,
  AdminPageHeader,
} from "@/components/admin/admin-page-header";
import { PostRow, type PostSummary } from "@/components/admin/post-row";
import { ImportPostsButton } from "@/components/admin/import-posts-button";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Writing" };

const FILTERS = [
  { value: "all", label: "Everything" },
  { value: "draft", label: "Drafts" },
  { value: "published", label: "Live" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireUser("/admin/posts");

  const { status } = await searchParams;
  const filter: Filter = FILTERS.some((option) => option.value === status)
    ? (status as Filter)
    : "all";

  if (!database.isConfigured) {
    return (
      <>
        <AdminPageHeader
          title="Writing"
          description="Explainers and articles. Drafts stay private until you publish them."
        />
        <div className="mt-6">
          <AdminNoDatabase what="Posts" />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            The blog is still serving the eight posts built into the code, so the
            public site is unaffected.
          </p>
        </div>
      </>
    );
  }

  const [counts, rows] = await Promise.all([countPostsByStatus(), listAllPosts()]);

  const posts: PostSummary[] = rows
    .filter((row) => filter === "all" || row.status === filter)
    .map((row) => ({
      id: String(row._id),
      type: row.type as PostSummary["type"],
      slug: row.slug,
      title: row.title,
      hook: row.hook,
      status: row.status as PostSummary["status"],
      tags: row.tags ?? [],
      readTime: row.readTime ?? "",
      /* An explainer's icon on this list is the concept's, since that is what
         the index page leads with for it. */
      iconName: row.type === "explainer" ? (row.concept?.iconName ?? "") : (row.iconName ?? ""),
      publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
      updatedAt: row.updatedAt.toISOString(),
      sections: row.body?.length ?? 0,
    }));

  return (
    <>
      <AdminPageHeader
        title="Writing"
        description="Explainers and articles. Drafts stay private until you publish them."
      >
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/admin/posts/new?type=explainer" />}
        >
          <PlusIcon />
          New explainer
        </Button>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/admin/posts/new?type=article" />}
        >
          New article
        </Button>
      </AdminPageHeader>

      <nav aria-label="Filter by status" className="mt-5 flex flex-wrap gap-2">
        {FILTERS.map((option) => {
          const count =
            option.value === "all" ? counts.total : counts[option.value];
          const active = option.value === filter;
          return (
            <Link
              key={option.value}
              href={`/admin/posts?status=${option.value}`}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                active
                  ? "bg-foreground/[0.08] text-foreground"
                  : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
              )}
            >
              {option.label}
              <span className="font-mono text-[0.6875rem] tabular-nums text-muted-foreground">
                {count}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 space-y-3">
        {posts.length === 0 ? (
          counts.total === 0 ? (
            <AdminEmptyState
              title="Nothing written here yet"
              description="The blog is currently serving the eight posts built into the code. Import them to edit them here, or start something new."
            >
              <ImportPostsButton />
            </AdminEmptyState>
          ) : (
            <AdminEmptyState
              title={filter === "draft" ? "No drafts" : "Nothing published"}
              description={
                filter === "draft"
                  ? "Everything you have written is live."
                  : "There are drafts waiting, but nothing is published yet."
              }
            />
          )
        ) : (
          posts.map((post) => <PostRow key={post.id} post={post} />)
        )}
      </div>
    </>
  );
}
