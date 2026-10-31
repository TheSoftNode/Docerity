import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, FileTextIcon, InboxIcon, MailIcon, StarIcon, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { requireStaff } from "@/lib/auth/dal";
import { database, email as emailConfig, storage } from "@/lib/config/env";
import { projectTypes } from "@/lib/contact/schema";
import { countEnquiriesByStatus, listEnquiries } from "@/lib/repositories/enquiry.repository";
import { countReviewsByStatus, listForModeration } from "@/lib/repositories/review.repository";
import { countPostsByStatus } from "@/lib/repositories/post.repository";
import { countSubscribersByStatus } from "@/lib/repositories/subscriber.repository";
import { AdminNoDatabase, AdminPageHeader } from "@/components/admin/admin-page-header";
import { newestWaiting, timeAgo, type WaitingItem } from "@/components/admin/admin-content";

export const metadata: Metadata = { title: "Overview" };

/** One of the four counts across the top: the total large, and what is waiting under it. */
function StatCard({
  href,
  label,
  value,
  note,
  hot,
  Icon,
}: {
  href: string;
  label: string;
  value: number;
  note: string;
  /** Something is waiting, so the note is the one coloured line on the card. */
  hot: boolean;
  Icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group/stat rounded-[20px] border border-border bg-card p-[22px] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_18px_40px_-28px_rgb(8_16_46/0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
    >
      <span className="flex items-center justify-between text-sm font-semibold text-muted-foreground">
        {label}
        <Icon aria-hidden className="size-[18px] text-primary" />
      </span>
      <span className="mt-3.5 block font-heading text-[46px] leading-none font-extrabold tracking-[-0.04em] tabular-nums text-foreground">
        {value}
      </span>
      <span className={cn("mt-2 block text-sm", hot ? "font-semibold text-[#b4401f] dark:text-[#ff9a80]" : "text-muted-foreground")}>{note}</span>
    </Link>
  );
}

/** One service the site depends on, said in plain words: working, or what is missing. */
function ServiceRow({ ready, name, detail }: { ready: boolean; name: string; detail: string }) {
  return (
    <li className="flex gap-3 border-t border-border py-3.5 first:border-t-0 first:pt-0 last:pb-0">
      <span aria-hidden className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", ready ? "bg-brand-teal" : "bg-amber-500")} />
      <div className="min-w-0">
        <p className="text-[15px] font-semibold text-foreground">
          {name}
          <span className="sr-only">{ready ? ": working" : ": not set up"}</span>
        </p>
        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{detail}</p>
      </div>
    </li>
  );
}

function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section aria-label={title} className={cn("rounded-[20px] border border-border bg-card p-6", className)}>
      <h2 className="font-heading text-[22px] font-bold tracking-[-0.02em] text-foreground">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/**
 * The admin's front page: what is waiting, the four counts that matter, the
 * newest things to deal with, each a click away, and whether the services the
 * site depends on are working.
 */
export default async function AdminOverviewPage() {
  /* Staff only: typing the URL sends a contributor to the one page they can use. */
  const user = await requireStaff("/admin");
  const first = user.name.split(" ")[0];

  const services = (
    <ul>
      <ServiceRow
        ready={database.isConfigured}
        name="Database"
        detail={
          database.isConfigured
            ? "Enquiries, reviews, posts and subscribers are being stored."
            : "MONGODB_URI is not set. The contact form answers 503 and nothing is saved."
        }
      />
      <ServiceRow
        ready={emailConfig.isConfigured}
        name="Email"
        detail={
          emailConfig.isConfigured
            ? `Notifications go to ${emailConfig.owner}.`
            : "SMTP_USER and SMTP_PASSWORD are not set. Enquiries are stored but no email is sent."
        }
      />
      <ServiceRow
        ready={storage.isConfigured}
        name="File storage"
        detail={
          storage.isConfigured
            ? "Attachments and review photos upload to the cloud."
            : "CLOUDINARY_* is not set. Forms still send, without files."
        }
      />
    </ul>
  );

  if (!database.isConfigured) {
    return (
      <>
        <AdminPageHeader title={`Hello, ${first}`} />
        <div className="space-y-4">
          <AdminNoDatabase what="Enquiries, reviews, posts and subscribers" />
          <Panel title="Services">{services}</Panel>
        </div>
      </>
    );
  }

  /* Independent reads, in parallel: serial round trips to Atlas would be several times the wait. */
  const [enquiries, reviews, posts, subscribers, unread, pending] = await Promise.all([
    countEnquiriesByStatus(),
    countReviewsByStatus(),
    countPostsByStatus(),
    countSubscribersByStatus(),
    listEnquiries({ status: "new", limit: 6 }),
    listForModeration("pending"),
  ]);

  const typeLabel = (value: string) => projectTypes.find((type) => type.value === value)?.label ?? "Enquiry";
  const waiting = newestWaiting([
    ...unread.items.map(
      (enquiry): WaitingItem => ({
        kind: "enquiry",
        id: String(enquiry._id),
        title: `New enquiry from ${enquiry.name}`,
        detail: typeLabel(enquiry.projectType),
        href: `/admin/enquiries/${String(enquiry._id)}`,
        at: new Date(enquiry.createdAt),
      })
    ),
    ...pending.slice(0, 6).map(
      (review): WaitingItem => ({
        kind: "review",
        id: String(review._id),
        title: `Review from ${review.fullName}`,
        detail: `${"★".repeat(review.rating)}${"☆".repeat(Math.max(0, 5 - review.rating))}`,
        href: "/admin/reviews?status=pending",
        at: new Date(review.createdAt),
      })
    ),
  ]);

  const needsAttention = enquiries.new + reviews.pending;

  return (
    <>
      <AdminPageHeader
        /* No "good morning": the server's clock is not the reader's, so a greeting by time reads wrong half the time. */
        title={`Hello, ${first}`}
        description={
          needsAttention > 0
            ? `${needsAttention} ${needsAttention === 1 ? "thing" : "things"} waiting on you.`
            : "Nothing waiting. The queues are clear."
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          href="/admin/enquiries?status=new"
          label="Enquiries"
          value={enquiries.total}
          note={enquiries.new > 0 ? `${enquiries.new} unread` : "All read"}
          hot={enquiries.new > 0}
          Icon={InboxIcon}
        />
        <StatCard
          href="/admin/reviews?status=pending"
          label="Reviews"
          value={reviews.approved}
          note={reviews.pending > 0 ? `${reviews.pending} awaiting approval` : "None waiting"}
          hot={reviews.pending > 0}
          Icon={StarIcon}
        />
        <StatCard
          href="/admin/posts?status=draft"
          label="Published posts"
          value={posts.published}
          note={posts.draft > 0 ? `${posts.draft} in draft` : "Nothing in draft"}
          hot={false}
          Icon={FileTextIcon}
        />
        <StatCard href="/admin/subscribers" label="Subscribers" value={subscribers.subscribed} note="On the newsletter" hot={false} Icon={MailIcon} />
      </div>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel title="Waiting on you">
          {waiting.length > 0 ? (
            <ul>
              {waiting.map((item) => (
                <li key={`${item.kind}-${item.id}`} className="border-t border-border first:border-t-0">
                  <Link
                    href={item.href}
                    className="group/row -mx-2 flex items-center justify-between gap-4 rounded-xl px-2 py-3.5 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-foreground"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-medium text-foreground">{item.title}</span>
                      <span className="mt-0.5 block text-[13px] text-muted-foreground">
                        {item.detail} · {timeAgo(item.at)}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary">
                      {item.kind === "enquiry" ? "Open" : "Review"}
                      <ArrowRightIcon aria-hidden className="size-4 transition-transform group-hover/row:translate-x-0.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Nothing new. Unread enquiries and reviews waiting for approval will show here.
            </p>
          )}
        </Panel>

        <div className="grid gap-4">
          <Panel title="Services">{services}</Panel>

          <Panel title="The blog">
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              {posts.published > 0
                ? `Serving ${posts.published} ${posts.published === 1 ? "post" : "posts"} from the database.`
                : "Serving the posts built into the code. Import them from Writing to edit them here."}
            </p>
            <Link href="/admin/posts" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              Go to Writing <ArrowRightIcon aria-hidden className="size-4" />
            </Link>
          </Panel>
        </div>
      </div>
    </>
  );
}
