import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowUpRightIcon, PaperclipIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { requireAccount } from "@/lib/account/session";
import { requestStep } from "@/lib/account/rules";
import { findEnquiryForEmail } from "@/lib/repositories/enquiry.repository";
import { budgets, projectTypes, timelines } from "@/lib/contact/schema";
import { formatDate } from "@/components/account/portal-ui";

export const metadata: Metadata = { title: "Request" };
export const dynamic = "force-dynamic";

/* The road a request travels, as the person who sent it sees it. */
const STEPS = [
  { label: "Received", detail: "It's in, and in line to be read." },
  { label: "Being looked at", detail: "Someone on the team is reading it now." },
  { label: "We've replied", detail: "Our answer is in your inbox." },
] as const;

const label = (options: readonly { value: string; label: string }[], value: string) => options.find((option) => option.value === value)?.label ?? "";

/**
 * One request the person sent. A navy column with what it is and its
 * details; beside it, the road it travels (received, looked at, replied)
 * with where it is now, and what they wrote. Found by reference and address
 * together, so a guessed reference shows nothing.
 */
export default async function RequestPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const account = await requireAccount(`/account/requests/${reference}`);
  if (!account.verified || !/^[A-Z0-9-]{4,40}$/i.test(reference)) notFound();

  const request = await findEnquiryForEmail(reference, account.email);
  if (!request) notFound();

  const closed = request.status === "archived";
  const at = requestStep(request.status);
  const codeLink = request.codeLink ? (/^https?:\/\//i.test(request.codeLink) ? request.codeLink : `https://${request.codeLink}`) : "";
  const details = [
    ["Budget", label(budgets, request.budget ?? "")],
    ["When", label(timelines, request.timeline ?? "")],
    ["Where you'd start", request.stage ?? ""],
  ].filter(([, value]) => value);

  return (
    <>
      <Link href="/account" className="inline-flex items-center gap-2 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeftIcon className="size-4" />
        Your account
      </Link>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
        <aside aria-label="About this request" className="rounded-[26px] bg-[#08102e] p-7 text-[#f4f5fa] lg:sticky lg:top-24">
          <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", closed ? "bg-[rgb(244_245_250/0.1)] text-[#c4cbe3]" : "bg-[rgb(175_196_255/0.14)] text-[#afc4ff]")}>
            {closed ? "Closed" : STEPS[at].label}
          </span>
          <h1 className="mt-4 font-heading text-[clamp(34px,3.2vw,42px)] leading-none font-extrabold tracking-[-0.04em]">
            {label(projectTypes, request.projectType) || "Request"}
          </h1>
          <p className="mt-4 font-mono text-lg font-medium tracking-[0.06em] text-[#afc4ff]">{request.reference}</p>
          <p className="mt-1 text-sm text-[#9aa7cf]">Sent {formatDate(request.createdAt)}</p>

          {details.length > 0 || codeLink ? (
            <dl className="mt-6 border-t border-[rgb(175_196_255/0.14)]">
              {details.map(([name, value]) => (
                <div key={name} className="flex items-baseline justify-between gap-4 border-b border-[rgb(175_196_255/0.14)] py-3">
                  <dt className="text-[13px] text-[#9aa7cf]">{name}</dt>
                  <dd className="text-right text-[15px] font-medium">{value}</dd>
                </div>
              ))}
              {codeLink ? (
                <div className="flex items-baseline justify-between gap-4 border-b border-[rgb(175_196_255/0.14)] py-3">
                  <dt className="text-[13px] text-[#9aa7cf]">Your code</dt>
                  <dd className="min-w-0 text-right text-[15px] font-medium">
                    <a href={codeLink} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1 truncate text-[#afc4ff] hover:underline">
                      <span className="truncate">{request.codeLink}</span>
                      <ArrowUpRightIcon className="size-3.5 shrink-0" />
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : null}

          <p className="mt-6 text-sm leading-relaxed text-[#c4cbe3]">
            Questions about it? Reply to any email from us, or quote <span className="font-mono text-[#f4f5fa]">{request.reference}</span>.
          </p>
        </aside>

        <div className="grid min-w-0 gap-5">
          <section aria-labelledby="journey-title" className="rounded-[26px] border border-border bg-card p-7">
            <h2 id="journey-title" className="font-heading text-[26px] font-bold tracking-[-0.025em] text-foreground">
              {closed ? "This request is closed" : "Where it stands"}
            </h2>
            <ol className="mt-6 grid gap-x-4 gap-y-6 sm:grid-cols-3">
              {STEPS.map((step, index) => {
                const state = closed || index < at ? "done" : index === at ? "now" : "todo";
                return (
                  <li key={step.label}>
                    <span
                      aria-hidden
                      className={cn(
                        "mb-4 block h-1 rounded-full",
                        state === "done" && "bg-primary",
                        state === "now" && "bg-[#ff7a59]",
                        state === "todo" && "bg-muted"
                      )}
                    />
                    <span className={cn("text-xs font-semibold", state === "done" ? "text-primary" : state === "now" ? "text-[#b4401f] dark:text-[#ff9a80]" : "text-muted-foreground")}>
                      {state === "done" ? "Done" : state === "now" ? "Now" : "Next"}
                    </span>
                    <p className={cn("mt-1 text-base font-semibold", state === "todo" ? "text-muted-foreground" : "text-foreground")}>{step.label}</p>
                    {state === "now" ? <p className="mt-1.5 text-[13px] leading-normal text-muted-foreground">{step.detail}</p> : null}
                  </li>
                );
              })}
            </ol>
            {closed ? (
              <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
                If there&apos;s more to say,{" "}
                <Link href="/account/requests/new" className="font-semibold text-primary hover:underline">
                  send a new request
                </Link>
                .
              </p>
            ) : null}
          </section>

          <section aria-labelledby="sent-title" className="rounded-[26px] border border-border bg-card p-7">
            <h2 id="sent-title" className="font-heading text-[26px] font-bold tracking-[-0.025em] text-foreground">
              What you sent
            </h2>
            <blockquote className="mt-5 border-l-[3px] border-primary pl-5 text-[16px] leading-[1.75] whitespace-pre-line text-foreground/90">{request.message}</blockquote>
            {request.attachments?.length ? (
              <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-muted px-3.5 py-1.5 text-sm text-muted-foreground">
                <PaperclipIcon className="size-4" />
                {request.attachments.length} {request.attachments.length === 1 ? "file" : "files"} attached
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </>
  );
}
