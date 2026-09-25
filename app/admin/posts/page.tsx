import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { requireUser } from "@/lib/auth/dal";
import { can } from "@/lib/auth/permissions";
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
  { value: "submitted", label: "Submitted" },
  { value: "published", label: "Live" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  /* Not `requireStaff`: this is the one admin page a contributor is meant to
     use. What they can see within it is scoped below. */
  const user = await requireUser("/admin/posts");
  const mayPublish = can.publishPosts(user.role);
  const seesEverything = can.seeAllPosts(user.role);

  const { status } = await searchParams;
  const filter: Filter = FILTERS.some((option) => option.value === status)
    ? (status as Filter)
    : "all";

  if (!database.isConfigured) {
    return (
      <>
        <AdminPageHeader
          title="Writing"
          description="Explainers and articles. Drafts stay private until they are published."
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

  /*
    The author filter is the access rule, not a convenience.

    A contributor's queries carry their own id, so another writer's draft is
    never fetched rather than merely hidden from the list. The editor applies
    the same rule again when a post is opened by id.
  */
  const scope = seesEverything ? undefined : user.id;

  const [counts, rows] = await Promise.all([
    countPostsByStatus(scope),
    listAllPosts(scope),
  ]);

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
      /* Only shown to staff. A contributor's list is all their own, so a byline
         on every row would be noise. */
      authorName: seesEverything ? (row.author?.name ?? "") : "",
    }));

  return (
    <>
      <AdminPageHeader
        title="Writing"
        description={
          mayPublish
            ? "Explainers and articles. Drafts stay private until you publish them."
            : "Your explainers and articles. Submit one and it reaches Theophilus to read before it goes live."
        }
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
          const count = option.value === "all" ? counts.total : counts[option.value];
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
                  : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
                /* The queue is highlighted for staff when something is waiting,
                   because it is the one tab here with somebody on the other end
                   of it. */
                option.value === "submitted" && mayPublish && counts.submitted > 0 && !active
                  ? "text-primary"
                  : ""
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
              title={mayPublish ? "Nothing written here yet" : "Nothing written yet"}
              description={
                mayPublish
                  ? "The blog is currently serving the eight posts built into the code. Import them to edit them here, or start something new."
                  : "Start an explainer and save it as a draft. Nothing is visible to anybody else until you submit it."
              }
            >
              {mayPublish ? <ImportPostsButton /> : null}
            </AdminEmptyState>
          ) : (
            <AdminEmptyState
              title={
                filter === "draft"
                  ? "No drafts"
                  : filter === "submitted"
                    ? "Nothing waiting"
                    : "Nothing published"
              }
              description={
                filter === "draft"
                  ? "Everything here has been submitted or published."
                  : filter === "submitted"
                    ? mayPublish
                      ? "Posts a contributor has finished land here for you to read before they go live."
                      : "Nothing of yours is waiting on a decision."
                    : "There are drafts waiting, but nothing is published yet."
              }
            />
          )
        ) : (
          posts.map((post) => <PostRow key={post.id} post={post} role={user.role} />)
        )}
      </div>
    </>
  );
}
