import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { requireStaff } from "@/lib/auth/dal";
import { database, storage } from "@/lib/config/env";
import {
  countReviewsByStatus,
  listForModeration,
} from "@/lib/repositories/review.repository";
import { cloudinaryImageUrl } from "@/lib/storage/public-url";
import {
  AdminEmptyState,
  AdminNoDatabase,
  AdminPageHeader,
} from "@/components/admin/admin-page-header";
import { ReviewRow, type ModeratedReview } from "@/components/admin/review-row";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Reviews" };

const TABS = [
  { value: "pending", label: "Waiting" },
  { value: "approved", label: "Published" },
  { value: "rejected", label: "Rejected" },
] as const;

type Tab = (typeof TABS)[number]["value"];

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  /* The guard, next to the query rather than in the layout. Staff only: a
     contributor has no business here, and typing the URL sends them to the one
     page they can use rather than showing an error. */
  await requireStaff("/admin/reviews");

  const { status } = await searchParams;
  const tab: Tab = TABS.some((option) => option.value === status)
    ? (status as Tab)
    : "pending";

  if (!database.isConfigured) {
    return (
      <>
        <AdminPageHeader
          title="Reviews"
          description="Nothing appears on the site until you approve it here."
        />
        <div className="mt-6">
          <AdminNoDatabase what="Reviews" />
        </div>
      </>
    );
  }

  const [counts, rows] = await Promise.all([
    countReviewsByStatus(),
    listForModeration(tab),
  ]);

  /* Mapped to a plain object before it crosses into the client component.
     A lean Mongoose result carries ObjectIds and Dates, which are not
     serialisable across that boundary, and `submittedFromIp` has no business
     in a client bundle. */
  const reviews: ModeratedReview[] = rows.map((row) => ({
    id: String(row._id),
    fullName: row.fullName,
    title: row.title,
    body: row.body,
    rating: row.rating,
    status: row.status as ModeratedReview["status"],
    contactEmail: row.contactEmail ?? "",
    photoUrl:
      row.photoPublicId && storage.isConfigured
        ? cloudinaryImageUrl(row.photoPublicId, { width: 96, height: 96 })
        : "",
    links: (row.links ?? []).map((link) => ({ title: link.title, url: link.url })),
    submittedAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
  }));

  return (
    <>
      <AdminPageHeader
        title="Reviews"
        description="Nothing appears on the site until you approve it here."
      >
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/reviews" target="_blank" />}
        >
          <ExternalLinkIcon />
          Public page
        </Button>
      </AdminPageHeader>

      {/* Links, not buttons: the tab is in the URL, so a particular queue can
          be bookmarked and the back button behaves. */}
      <nav aria-label="Filter by status" className="mt-5 flex flex-wrap gap-2">
        {TABS.map((option) => {
          const count = counts[option.value];
          const active = option.value === tab;
          return (
            <Link
              key={option.value}
              href={`/admin/reviews?status=${option.value}`}
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
        {reviews.length === 0 ? (
          <AdminEmptyState
            title={
              tab === "pending"
                ? "Nothing waiting"
                : tab === "approved"
                  ? "Nothing published yet"
                  : "Nothing rejected"
            }
            description={
              tab === "pending"
                ? "New reviews land here for you to read before they go anywhere near the site."
                : tab === "approved"
                  ? "Approved reviews show on the reviews page and in the homepage rotation."
                  : "Rejected reviews stay here rather than being deleted, so a decision can be reversed."
            }
          >
            {tab === "pending" ? (
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href="/reviews#leave-a-review" target="_blank" />}
              >
                See the form people use
              </Button>
            ) : null}
          </AdminEmptyState>
        ) : (
          reviews.map((review) => <ReviewRow key={review.id} review={review} />)
        )}
      </div>
    </>
  );
}
