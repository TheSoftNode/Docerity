import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  FileTextIcon,
  InboxIcon,
  MailIcon,
  StarIcon,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { requireStaff } from "@/lib/auth/dal";
import { database, email as emailConfig, storage } from "@/lib/config/env";
import { countEnquiriesByStatus } from "@/lib/repositories/enquiry.repository";
import { countReviewsByStatus } from "@/lib/repositories/review.repository";
import { countPostsByStatus } from "@/lib/repositories/post.repository";
import { countSubscribersByStatus } from "@/lib/repositories/subscriber.repository";
import { AdminNoDatabase, AdminPageHeader } from "@/components/admin/admin-page-header";

export const metadata: Metadata = { title: "Overview" };

/** A number worth clicking on, with what is waiting called out. */
function StatCard({
  href,
  label,
  value,
  waiting,
  waitingLabel,
  Icon,
}: {
  href: string;
  label: string;
  value: number;
  waiting?: number;
  waitingLabel?: string;
  Icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group/stat rounded-xl border border-border bg-card px-4 py-4 transition-colors hover:border-primary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <Icon
          aria-hidden
          className="size-4 text-muted-foreground transition-colors group-hover/stat:text-primary"
        />
      </div>

      <p className="mt-2 font-heading text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </p>

      {waiting && waiting > 0 ? (
        <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-400">
          {waiting} {waitingLabel}
        </p>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground">nothing waiting</p>
      )}
    </Link>
  );
}

/**
 * Whether each service is actually wired up.
 *
 * On the overview because the failure modes are quiet: with no SMTP credentials
 * the contact form still accepts an enquiry and stores it, and the notification
 * simply never arrives. Without this panel the first sign of that is somebody
 * asking why you never replied.
 */
function ServiceRow({ ready, name, detail }: { ready: boolean; name: string; detail: string }) {
  return (
    <li className="flex items-start gap-2.5">
      {ready ? (
        <CheckCircle2Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-teal" />
      ) : (
        <AlertTriangleIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-amber-500" />
      )}
      <div className="min-w-0">
        <p className="text-sm text-foreground">
          {name}
          <span className="sr-only">{ready ? ": configured" : ": not configured"}</span>
        </p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
    </li>
  );
}

export default async function AdminOverviewPage() {
  const user = /* Staff only: a contributor has no business in here, and typing the URL
     sends them to the one page they can use rather than showing an error. */
  await requireStaff("/admin");

  const services = (
    <ul className="mt-4 space-y-3">
      <ServiceRow
        ready={database.isConfigured}
        name="MongoDB"
        detail={
          database.isConfigured
            ? "Enquiries, reviews, posts and subscribers are being stored."
            : "MONGODB_URI is unset. The contact form returns 503 and nothing is saved."
        }
      />
      <ServiceRow
        ready={emailConfig.isConfigured}
        name="Gmail SMTP"
        detail={
          emailConfig.isConfigured
            ? `Notifications go to ${emailConfig.owner}.`
            : "SMTP_USER and SMTP_PASSWORD are unset. Enquiries are stored but no email is sent."
        }
      />
      <ServiceRow
        ready={storage.isConfigured}
        name="Cloudinary"
        detail={
          storage.isConfigured
            ? "Attachments and review photos upload directly to the cloud."
            : "CLOUDINARY_* is unset. Forms still submit, without files."
        }
      />
    </ul>
  );

  if (!database.isConfigured) {
    return (
      <>
        <AdminPageHeader title={`Hello, ${user.name.split(" ")[0]}`} />
        <div className="mt-6 space-y-6">
          <AdminNoDatabase what="Enquiries, reviews, posts and subscribers" />
          <div className="rounded-xl border border-border bg-card px-4 py-4">
            <h2 className="font-heading text-sm font-semibold text-foreground">Services</h2>
            {services}
          </div>
        </div>
      </>
    );
  }

  /*
    Four independent counts in parallel. `Promise.all` rather than sequential
    awaits: they do not depend on each other, and four serial round trips to
    Atlas is four times the latency for the same page.
  */
  const [enquiries, reviews, posts, subscribers] = await Promise.all([
    countEnquiriesByStatus(),
    countReviewsByStatus(),
    countPostsByStatus(),
    countSubscribersByStatus(),
  ]);

  const needsAttention = enquiries.new + reviews.pending;

  return (
    <>
      <AdminPageHeader
        /* No time-of-day greeting: this renders on the server, so "Morning"
           would be the server's morning and read as wrong half the time. */
        title={`Hello, ${user.name.split(" ")[0]}`}
        description={
          needsAttention > 0
            ? `${needsAttention} ${needsAttention === 1 ? "thing" : "things"} waiting on you.`
            : "Nothing waiting. The queues are clear."
        }
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          href="/admin/enquiries?status=new"
          label="Enquiries"
          value={enquiries.total}
          waiting={enquiries.new}
          waitingLabel="unread"
          Icon={InboxIcon}
        />
        <StatCard
          href="/admin/reviews?status=pending"
          label="Reviews"
          value={reviews.approved}
          waiting={reviews.pending}
          waitingLabel="awaiting approval"
          Icon={StarIcon}
        />
        <StatCard
          href="/admin/posts?status=draft"
          label="Published posts"
          value={posts.published}
          waiting={posts.draft}
          waitingLabel="in draft"
          Icon={FileTextIcon}
        />
        <StatCard
          href="/admin/subscribers"
          label="Subscribers"
          value={subscribers.subscribed}
          Icon={MailIcon}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card px-4 py-4 sm:px-5">
          <h2 className="font-heading text-sm font-semibold text-foreground">Services</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            What is connected in this environment.
          </p>
          {services}
        </div>

        <div className="rounded-xl border border-border bg-card px-4 py-4 sm:px-5">
          <h2 className="font-heading text-sm font-semibold text-foreground">
            Where the blog is reading from
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Posts come from the database, and fall back to the eight built into
            the code when there are none.
          </p>

          <p
            className={cn(
              "mt-4 rounded-lg px-3 py-2.5 text-sm",
              posts.published > 0
                ? "bg-brand-teal/10 text-brand-teal"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            )}
          >
            {posts.published > 0
              ? `Serving ${posts.published} ${posts.published === 1 ? "post" : "posts"} from the database.`
              : "Serving the built-in posts. Import them from Writing to edit them here."}
          </p>

          <Link
            href="/admin/posts"
            className="mt-3 inline-block text-xs text-primary transition-colors hover:underline"
          >
            Go to Writing
          </Link>
        </div>
      </div>
    </>
  );
}
