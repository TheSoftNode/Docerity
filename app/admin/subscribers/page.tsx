import type { Metadata } from "next";
import Link from "next/link";
import { DownloadIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { requireStaff } from "@/lib/auth/dal";
import { database } from "@/lib/config/env";
import {
  countSubscribersByStatus,
  listSubscribers,
} from "@/lib/repositories/subscriber.repository";
import {
  AdminEmptyState,
  AdminNoDatabase,
  AdminPageHeader,
} from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { SubscriberActions } from "@/components/admin/subscriber-actions";

export const metadata: Metadata = { title: "Subscribers" };

/*
  The accent hairline the overview counts carry, so a number reads as a number
  everywhere in the tool rather than only on one page. Indexed by position,
  which is enough: these strips are two or three cards that never reorder.
*/
const STRIP_EDGES = [
  "before:bg-[linear-gradient(to_right,var(--brand-primary),transparent)]",
  "before:bg-[linear-gradient(to_right,var(--brand-violet),transparent)]",
  "before:bg-[linear-gradient(to_right,var(--brand-teal),transparent)]",
] as const;

export default async function AdminSubscribersPage() {
  /* Staff only: a contributor has no business in here, and typing the URL
     sends them to the one page they can use rather than showing an error. */
  await requireStaff("/admin/subscribers");

  if (!database.isConfigured) {
    return (
      <>
        <AdminPageHeader title="Subscribers" description="The explainer mailing list." />
        <div className="mt-6">
          <AdminNoDatabase what="Subscribers" />
        </div>
      </>
    );
  }

  const [counts, subscribers] = await Promise.all([
    countSubscribersByStatus(),
    listSubscribers(200),
  ]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Mailing list"
        title="Subscribers"
        description="The explainer mailing list. Export it to send from anywhere that is not Gmail."
      >
        {counts.subscribed > 0 ? (
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            /* A plain link to a route handler, not an action. A CSV is a
               download, and a Server Action returns a value rather than a file
               with a Content-Disposition header. */
            render={<Link href="/api/admin/subscribers/export" />}
          >
            <DownloadIcon />
            Export CSV
          </Button>
        ) : null}
      </AdminPageHeader>

      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          ["Subscribed", counts.subscribed],
          ["Unsubscribed", counts.unsubscribed],
          ["Total ever", counts.total],
        ].map(([label, value], index) => (
          <div
            key={String(label)}
            className={cn(
              "relative overflow-hidden rounded-xl border border-border bg-card px-4 py-3 before:absolute before:inset-x-0 before:top-0 before:h-px before:content-['']",
              STRIP_EDGES[index % STRIP_EDGES.length]
            )}
          >
            <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
              {label}
            </dt>
            <dd className="mt-1 font-heading text-xl font-semibold tabular-nums text-foreground">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-6">
        {subscribers.length === 0 ? (
          <AdminEmptyState
            title="Nobody subscribed yet"
            description="The form at the bottom of the blog adds people here. Gmail is not a newsletter transport, so export the list when you are ready to send."
          />
        ) : (
          /* A real table, because this is tabular data and a screen reader
             needs the column headers to read a row usefully. */
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">
                Mailing list subscribers, newest first
              </caption>
              <thead>
                <tr className="border-b border-border bg-card/60 text-left">
                  <th scope="col" className="px-4 py-2.5 font-medium text-muted-foreground">
                    Email
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium text-muted-foreground">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-medium text-muted-foreground">
                    Source
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                    Joined
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium text-muted-foreground">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((subscriber) => (
                  <tr
                    key={String(subscriber._id)}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="px-4 py-2.5 text-foreground">{subscriber.email}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 font-mono text-[0.625rem] uppercase",
                          subscriber.status === "subscribed"
                            ? "bg-brand-teal/15 text-brand-teal"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {subscriber.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {subscriber.source}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">
                      {subscriber.createdAt?.toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-right">
                      <SubscriberActions
                        email={subscriber.email}
                        status={
                          subscriber.status === "subscribed" ? "subscribed" : "unsubscribed"
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {counts.total > subscribers.length ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Showing the most recent {subscribers.length} of {counts.total}. The CSV
            export has everybody.
          </p>
        ) : null}
      </div>
    </>
  );
}
