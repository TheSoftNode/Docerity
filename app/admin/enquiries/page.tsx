import type { Metadata } from "next";
import Link from "next/link";
import { PaperclipIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { requireUser } from "@/lib/auth/dal";
import { database } from "@/lib/config/env";
import {
  countEnquiriesByStatus,
  listEnquiries,
} from "@/lib/repositories/enquiry.repository";
import { budgets, projectTypes, roles, timelines } from "@/lib/contact/schema";
import {
  AdminEmptyState,
  AdminNoDatabase,
  AdminPageHeader,
} from "@/components/admin/admin-page-header";

export const metadata: Metadata = { title: "Enquiries" };

const TABS = [
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "archived", label: "Archived" },
  { value: "spam", label: "Spam" },
] as const;

type Tab = (typeof TABS)[number]["value"];

/** Stored values are machine-readable; the list should read as the form did. */
function labelFor(options: readonly { value: string; label: string }[], value: string) {
  if (!value) return "";
  return options.find((option) => option.value === value)?.label ?? value;
}

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireUser("/admin/enquiries");

  const { status } = await searchParams;
  const tab: Tab = TABS.some((option) => option.value === status)
    ? (status as Tab)
    : "new";

  if (!database.isConfigured) {
    return (
      <>
        <AdminPageHeader
          title="Enquiries"
          description="Everything sent through the contact form."
        />
        <div className="mt-6">
          <AdminNoDatabase what="Enquiries" />
        </div>
      </>
    );
  }

  const [counts, { items }] = await Promise.all([
    countEnquiriesByStatus(),
    listEnquiries({ status: tab, limit: 50 }),
  ]);

  return (
    <>
      <AdminPageHeader
        title="Enquiries"
        description="Everything sent through the contact form, with its delivery record."
      />

      <nav aria-label="Filter by status" className="mt-5 flex flex-wrap gap-2">
        {TABS.map((option) => {
          const active = option.value === tab;
          return (
            <Link
              key={option.value}
              href={`/admin/enquiries?status=${option.value}`}
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
                {counts[option.value]}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 space-y-2">
        {items.length === 0 ? (
          <AdminEmptyState
            title={tab === "new" ? "Nothing new" : `Nothing ${tab}`}
            description={
              tab === "new"
                ? "Enquiries from the contact form land here, with their attachments and whether the emails actually went out."
                : "Nothing has that status at the moment."
            }
          />
        ) : (
          items.map((enquiry) => {
            const attachments = enquiry.attachments?.length ?? 0;
            return (
              <Link
                key={String(enquiry._id)}
                href={`/admin/enquiries/${String(enquiry._id)}`}
                className="block rounded-xl border border-border bg-card px-4 py-3.5 transition-colors hover:border-primary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:px-5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <div className="flex min-w-0 items-baseline gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {enquiry.name}
                    </p>
                    {enquiry.company ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {enquiry.company}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-3">
                    {attachments > 0 ? (
                      <span
                        className="inline-flex items-center gap-1 font-mono text-[0.6875rem] text-muted-foreground"
                        aria-label={`${attachments} attachments`}
                      >
                        <PaperclipIcon aria-hidden className="size-3" />
                        {attachments}
                      </span>
                    ) : null}
                    <time
                      dateTime={enquiry.createdAt?.toISOString()}
                      className="font-mono text-[0.6875rem] text-muted-foreground"
                    >
                      {enquiry.createdAt?.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </time>
                  </div>
                </div>

                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {enquiry.message}
                </p>

                <div className="mt-2 flex flex-wrap gap-x-3 font-mono text-[0.625rem] uppercase tracking-wide text-muted-foreground">
                  <span>{labelFor(projectTypes, enquiry.projectType)}</span>
                  {enquiry.budget ? <span>{labelFor(budgets, enquiry.budget)}</span> : null}
                  {enquiry.timeline ? (
                    <span>{labelFor(timelines, enquiry.timeline)}</span>
                  ) : null}
                  {enquiry.role ? <span>{labelFor(roles, enquiry.role)}</span> : null}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </>
  );
}
