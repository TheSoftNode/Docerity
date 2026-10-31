import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, CheckIcon, PaperclipIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { requireAccount } from "@/lib/account/session";
import { findEnquiryForEmail } from "@/lib/repositories/enquiry.repository";
import { budgets, projectTypes, timelines } from "@/lib/contact/schema";
import { PortalCard, formatDate } from "@/components/account/portal-ui";

export const metadata: Metadata = { title: "Request" };
export const dynamic = "force-dynamic";

/* The path a request takes, as the person who sent it sees it. */
const STEPS = [
  { key: "new", label: "Received", detail: "It's in, and in the queue to be read." },
  { key: "read", label: "Being looked at", detail: "Someone on the team is reading it." },
  { key: "replied", label: "We've replied", detail: "Check your email for our answer." },
] as const;

/** How far along the path a status is; a closed request has been through all of it. */
function reached(status: string): number {
  if (status === "archived") return STEPS.length;
  const index = STEPS.findIndex((step) => step.key === status);
  return index < 0 ? 0 : index;
}

const label = (options: readonly { value: string; label: string }[], value: string) => options.find((option) => option.value === value)?.label ?? "";

/**
 * One request the person sent: where it stands on its way through the team,
 * and what they sent. Found by its reference and their address together.
 */
export default async function RequestPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const account = await requireAccount(`/account/requests/${reference}`);
  if (!account.verified || !/^[A-Z0-9-]{4,40}$/i.test(reference)) notFound();

  const request = await findEnquiryForEmail(reference, account.email);
  if (!request) notFound();

  const at = reached(request.status);
  const closed = request.status === "archived";
  const details = [
    ["Budget", label(budgets, request.budget ?? "")],
    ["When", label(timelines, request.timeline ?? "")],
    ["Where you'd start", request.stage ?? ""],
    ["Your code", request.codeLink ?? ""],
  ].filter(([, value]) => value);

  return (
    <>
      <Link href="/account" className="inline-flex items-center gap-2 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeftIcon className="size-4" />
        Your account
      </Link>
      <p className="mt-5 text-sm text-muted-foreground">
        Reference <span className="font-mono font-semibold tracking-[0.06em] text-foreground">{request.reference}</span> · sent {formatDate(request.createdAt)}
      </p>
      <h1 className="mt-2 pb-8 font-heading text-[clamp(34px,4vw,52px)] leading-none font-extrabold tracking-[-0.04em] text-foreground">
        {label(projectTypes, request.projectType) || "Request"}
      </h1>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <PortalCard title={closed ? "Closed" : "Where it stands"}>
          <ol>
            {STEPS.map((step, index) => {
              const done = index < at || closed;
              const now = index === at && !closed;
              return (
                <li key={step.key} className="relative flex gap-4 pb-6 last:pb-0">
                  {index < STEPS.length - 1 ? (
                    <span aria-hidden className={cn("absolute top-8 bottom-0 left-[13px] w-0.5", done ? "bg-primary" : "bg-border")} />
                  ) : null}
                  <span
                    aria-hidden
                    className={cn(
                      "relative z-10 grid size-7 shrink-0 place-items-center rounded-full border-2",
                      done && "border-primary bg-primary text-primary-foreground",
                      now && "border-[#ff7a59] bg-card",
                      !done && !now && "border-border bg-card"
                    )}
                  >
                    {done ? <CheckIcon className="size-3.5" strokeWidth={3} /> : now ? <span className="size-2.5 rounded-full bg-[#ff7a59]" /> : null}
                  </span>
                  <div className="pt-0.5">
                    <p className={cn("text-[15px] font-semibold", done || now ? "text-foreground" : "text-muted-foreground")}>
                      {step.label}
                      {now ? <span className="sr-only"> (now)</span> : null}
                    </p>
                    {now ? <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.detail}</p> : null}
                  </div>
                </li>
              );
            })}
          </ol>
          {closed ? <p className="mt-6 text-sm leading-relaxed text-muted-foreground">This request is closed. If there&apos;s more to say, send a new one.</p> : null}
        </PortalCard>

        <PortalCard title="What you sent">
          <p className="text-[15px] leading-relaxed whitespace-pre-line text-foreground/90">{request.message}</p>
          {details.length > 0 ? (
            <dl className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
              {details.map(([name, value]) => (
                <div key={name}>
                  <dt className="text-sm text-muted-foreground">{name}</dt>
                  <dd className="mt-0.5 text-[15px] font-medium break-all text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {request.attachments?.length ? (
            <p className="mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <PaperclipIcon className="size-4" />
              {request.attachments.length} {request.attachments.length === 1 ? "file" : "files"} attached
            </p>
          ) : null}
        </PortalCard>
      </div>
    </>
  );
}
