"use client";

import { useState, useTransition } from "react";
import {
  AlertTriangleIcon,
  DownloadIcon,
  LoaderCircleIcon,
  MailIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/contact/schema";
import {
  getAttachmentUrl,
  updateEnquiryStatus,
  type EnquiryStatus,
} from "@/app/admin/enquiries/actions";

export type EnquiryView = {
  id: string;
  reference: string;
  name: string;
  email: string;
  company: string;
  role: string;
  projectType: string;
  budget: string;
  timeline: string;
  message: string;
  status: EnquiryStatus;
  receivedAt: string;
  attachments: {
    publicId: string;
    name: string;
    bytes: number;
    verified: boolean;
  }[];
  delivery: {
    notified: boolean;
    acknowledged: boolean;
    error: string;
  };
};

const STATUSES: { value: EnquiryStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "archived", label: "Archived" },
  { value: "spam", label: "Spam" },
];

/** One attachment. The URL is signed on click, not on render. */
function Attachment({
  enquiryId,
  attachment,
}: {
  enquiryId: string;
  attachment: EnquiryView["attachments"][number];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function download() {
    setError(null);
    startTransition(async () => {
      const result = await getAttachmentUrl(enquiryId, attachment.publicId);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      /*
        `noopener` on a programmatic `window.open` for the same reason as on a
        link: without it the opened tab keeps a handle on this one.
      */
      window.open(result.url, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/50 px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm text-foreground">{attachment.name}</p>
        <p className="font-mono text-[0.6875rem] text-muted-foreground">
          {formatBytes(attachment.bytes)}
          {!attachment.verified ? " · unverified" : ""}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {!attachment.verified ? (
          <span
            title="Cloudinary could not confirm this file when the enquiry arrived."
            className="text-amber-500"
          >
            <AlertTriangleIcon className="size-4" />
          </span>
        ) : null}
        <Button variant="outline" size="sm" disabled={pending} onClick={download}>
          {pending ? <LoaderCircleIcon className="animate-spin" /> : <DownloadIcon />}
          Open
        </Button>
      </div>

      {error ? (
        <p role="alert" className="w-full text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </li>
  );
}

function EnquiryDetail({ enquiry }: { enquiry: EnquiryView }) {
  const [status, setStatus] = useState(enquiry.status);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function change(next: EnquiryStatus) {
    /* Set locally first so the row responds immediately, then reverted if the
       server disagrees. The action is the authority; this is only the wait. */
    const previous = status;
    setStatus(next);
    setError(null);

    startTransition(async () => {
      const result = await updateEnquiryStatus(enquiry.id, next);
      if (!result.ok) {
        setStatus(previous);
        setError(result.message);
      }
    });
  }

  const details: [string, string][] = [
    ["Company", enquiry.company],
    ["Role", enquiry.role],
    ["About", enquiry.projectType],
    ["Budget", enquiry.budget],
    ["Timeline", enquiry.timeline],
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-heading text-lg font-semibold text-foreground">
              {enquiry.name}
            </h2>
            <a
              href={`mailto:${enquiry.email}?subject=Re:%20your%20enquiry%20(${enquiry.reference})`}
              className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-primary transition-colors hover:underline"
            >
              <MailIcon className="size-3.5" />
              {enquiry.email}
            </a>
          </div>

          <div className="text-right">
            <p className="font-mono text-xs text-muted-foreground">{enquiry.reference}</p>
            <time
              dateTime={enquiry.receivedAt}
              className="text-xs text-muted-foreground"
            >
              {new Date(enquiry.receivedAt).toLocaleString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </div>
        </div>

        <dl className="mt-4 grid gap-x-6 gap-y-2 border-t border-border/70 pt-4 sm:grid-cols-2">
          {details
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3 text-sm">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right text-foreground">{value}</dd>
              </div>
            ))}
        </dl>
      </div>

      <div className="rounded-xl border border-border bg-card px-4 py-4 sm:px-5">
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
          Message
        </p>
        {/* `whitespace-pre-wrap` keeps the paragraph breaks they typed. React
            escapes the text, so this cannot carry markup into the page. */}
        <p className="mt-2 text-sm leading-[1.75] whitespace-pre-wrap text-foreground">
          {enquiry.message}
        </p>
      </div>

      {enquiry.attachments.length > 0 ? (
        <div className="rounded-xl border border-border bg-card px-4 py-4 sm:px-5">
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
            Attachments
          </p>
          <ul className="mt-3 space-y-2">
            {enquiry.attachments.map((attachment) => (
              <Attachment
                key={attachment.publicId}
                enquiryId={enquiry.id}
                attachment={attachment}
              />
            ))}
          </ul>
          <p className="mt-3 text-[0.6875rem] text-muted-foreground">
            Links are signed when you open one and expire after fifteen minutes.
          </p>
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-card px-4 py-4 sm:px-5">
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
          Status
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {STATUSES.map((option) => (
            <Button
              key={option.value}
              variant={status === option.value ? "default" : "outline"}
              size="sm"
              disabled={pending}
              onClick={() => change(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {error ? (
          <p role="alert" className="mt-3 text-xs text-destructive">
            {error}
          </p>
        ) : null}

        {/*
          Whether the emails actually went out. Recorded on the document when
          the enquiry arrived, and worth showing: a delivery failure is
          invisible otherwise, and "I never got your email" is exactly the
          thing you want to be able to check.
        */}
        <dl className="mt-4 space-y-1.5 border-t border-border/70 pt-3 text-xs">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Notification to you</dt>
            <dd
              className={cn(
                enquiry.delivery.notified ? "text-brand-teal" : "text-amber-500"
              )}
            >
              {enquiry.delivery.notified ? "delivered" : "not delivered"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Acknowledgement to them</dt>
            <dd
              className={cn(
                enquiry.delivery.acknowledged ? "text-brand-teal" : "text-amber-500"
              )}
            >
              {enquiry.delivery.acknowledged ? "delivered" : "not delivered"}
            </dd>
          </div>
          {enquiry.delivery.error ? (
            <p className="pt-1 font-mono text-[0.6875rem] text-muted-foreground">
              {enquiry.delivery.error}
            </p>
          ) : null}
        </dl>
      </div>
    </div>
  );
}

export { EnquiryDetail };
