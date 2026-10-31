import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, ArrowUpRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { requireAccount } from "@/lib/account/session";
import { currentMilestoneIndex, projectProgress, requestStatusLabel, requestStep, waitingOnClient } from "@/lib/account/rules";
import { listProjectsForEmail } from "@/lib/repositories/client-project.repository";
import { listEnquiriesForEmail } from "@/lib/repositories/enquiry.repository";
import { projectTypes } from "@/lib/contact/schema";
import { timeAgo } from "@/components/admin/admin-content";
import { ProgressRing, RequestTrack, StatusPill, StatusPillOnDark, formatDate } from "@/components/account/portal-ui";
import { VerifyBanner } from "@/components/account/verify-banner";
import { LiveRefresh } from "@/components/account/live-refresh";

export const metadata: Metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

const START_OPTIONS = [
  { type: "software", label: "A project" },
  { type: "mentorship", label: "Mentorship" },
  { type: "speaking", label: "A talk" },
  { type: "other", label: "A question" },
];

/**
 * A client's front page.
 *
 * The greeting large, beside a strip of the three numbers that matter (what
 * is live, how far along, what is waiting on them); then each project as a
 * tile with its progress ring, what is happening now and the latest news,
 * the newest on navy; then their requests, each with a small track of where
 * it stands, and a way to start something new. Nothing private shows until
 * the address is confirmed, because the address is what ties the work to them.
 */
export default async function AccountOverviewPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const account = await requireAccount("/account");
  const { welcome } = await searchParams;
  const first = account.name.split(" ")[0];

  if (!account.verified) {
    return (
      <>
        <Greeting eyebrow={account.company || "Your account"} lead="Almost there," name={first} />
        <div className="mt-10 max-w-3xl">
          <VerifyBanner email={account.email} />
        </div>
      </>
    );
  }

  const [projects, requests] = await Promise.all([listProjectsForEmail(account.email), listEnquiriesForEmail(account.email)]);
  const typeLabel = (value: string) => projectTypes.find((type) => type.value === value)?.label ?? "Request";
  const live = projects.filter((project) => project.status !== "done");
  const overall = live.length
    ? Math.round(live.reduce((sum, project) => sum + projectProgress(project.milestones, project.status), 0) / live.length)
    : projects.length
      ? 100
      : 0;
  const waiting = waitingOnClient(projects);
  const shownRequests = requests.filter((request) => requestStatusLabel(request.status));

  return (
    <>
      <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
        <Greeting eyebrow={account.company || "Your account"} lead={welcome ? "Welcome aboard," : "Good to see you,"} name={first} />
        <div className="flex flex-wrap items-center gap-3">
          <dl className="flex overflow-hidden rounded-[22px] border border-border bg-card">
            {[
              { value: String(live.length), label: live.length === 1 ? "project live" : "projects live" },
              { value: projects.length ? `${overall}%` : "–", label: "overall" },
              { value: String(waiting), label: waiting === 1 ? "needs you" : "need you", hot: waiting > 0 },
            ].map((stat) => (
              <div key={stat.label} className="min-w-[118px] border-l border-border px-5 py-4 first:border-l-0">
                <dt className="sr-only">{stat.label}</dt>
                <dd className={cn("font-heading text-[34px] leading-none font-extrabold tracking-[-0.04em]", stat.hot ? "text-[#b4401f] dark:text-[#ff9a80]" : "text-foreground")}>
                  {stat.value}
                </dd>
                <span aria-hidden className="mt-1.5 block text-[13px] text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </dl>
          <Link
            href="/account/requests/new"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-[#ff7a59] px-5 text-[15px] font-bold text-[#08102e] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            New request <ArrowUpRightIcon className="size-4" />
          </Link>
        </div>
      </div>

      <section aria-labelledby="projects-title" className="mt-12">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="projects-title" className="font-heading text-[26px] font-bold tracking-[-0.025em] text-foreground">
            Your projects
          </h2>
          {projects.length > 0 ? <LiveRefresh /> : null}
        </div>

        {projects.length === 0 ? (
          <div className="grid items-center gap-6 overflow-hidden rounded-[26px] bg-[#08102e] p-8 text-[#f4f5fa] sm:p-10 md:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <p className="font-heading text-[32px] leading-tight font-extrabold tracking-[-0.035em]">No projects yet.</p>
              <p className="mt-2 max-w-[48ch] text-[15px] leading-relaxed text-[#c4cbe3]">
                Once we agree to work together, your project lives here: its progress, the milestones as they land, and every update the moment it&apos;s posted.
              </p>
            </div>
            <Link
              href="/account/requests/new?type=software"
              className="inline-flex h-12 items-center gap-2 justify-self-start rounded-full bg-[#afc4ff] px-5 text-[15px] font-bold text-[#08102e] transition-transform hover:-translate-y-0.5"
            >
              Start a project <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        ) : (
          <ul className={cn("grid gap-4", projects.length > 1 && "lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]")}>
            {projects.map((project, index) => {
              const dark = index % 2 === 0;
              const progress = projectProgress(project.milestones, project.status);
              const now = project.status === "done" ? -1 : currentMilestoneIndex(project.milestones);
              const done = project.milestones.filter((milestone) => milestone.status === "done").length;
              const latest = project.updates[0];
              const nowLine =
                project.status === "review"
                  ? project.nextStep || "Your review"
                  : now >= 0
                    ? `${project.milestones[now].title}${project.milestones[now].due ? ` · due ${formatDate(project.milestones[now].due).replace(/ \d{4}$/, "")}` : ""}`
                    : project.status === "done"
                      ? "Delivered"
                      : project.nextStep;
              return (
                <li key={String(project._id)}>
                  <Link
                    href={`/account/projects/${String(project._id)}`}
                    className={cn(
                      "group grid h-full min-h-[290px] grid-cols-[minmax(0,1fr)_auto] gap-5 rounded-[26px] p-7 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
                      dark
                        ? "bg-[#08102e] text-[#f4f5fa] hover:shadow-[0_30px_60px_-30px_rgb(8_16_46/0.7)]"
                        : "border border-border bg-card text-foreground hover:shadow-[0_24px_50px_-32px_rgb(8_16_46/0.45)]"
                    )}
                  >
                    <div className="min-w-0">
                      {dark ? <StatusPillOnDark status={project.status} /> : <StatusPill status={project.status} />}
                      <h3 className="mt-3.5 max-w-[14ch] font-heading text-[clamp(28px,2.6vw,34px)] leading-none font-extrabold tracking-[-0.035em]">{project.title}</h3>
                      {nowLine ? (
                        <p className="mt-6 flex items-start gap-2.5 text-[15px]">
                          <span aria-hidden className="mt-1.5 size-2.5 shrink-0 rounded-full bg-[#ff7a59] shadow-[0_0_0_4px_rgb(255_122_89/0.2)]" />
                          <span>
                            <span className={cn("block text-xs", dark ? "text-[#9aa7cf]" : "text-muted-foreground")}>Now</span>
                            {nowLine}
                          </span>
                        </p>
                      ) : null}
                    </div>
                    <ProgressRing
                      value={progress}
                      tone={dark ? "dark" : "light"}
                      caption={project.milestones.length ? `${done} of ${project.milestones.length}` : undefined}
                    />
                    <div
                      className={cn(
                        "col-span-2 flex items-center justify-between gap-4 self-end border-t pt-4 text-sm",
                        dark ? "border-[rgb(175_196_255/0.14)] text-[#c4cbe3]" : "border-border text-muted-foreground"
                      )}
                    >
                      <span className="min-w-0 truncate">
                        {latest ? (
                          <>
                            <span className={cn("font-semibold", dark ? "text-[#f4f5fa]" : "text-foreground")}>{latest.title}</span> · {timeAgo(latest.createdAt)}
                          </>
                        ) : (
                          "No updates yet"
                        )}
                      </span>
                      <span
                        aria-hidden
                        className={cn(
                          "grid size-10 shrink-0 place-items-center rounded-full transition-transform group-hover:translate-x-0.5",
                          dark ? "bg-[#afc4ff] text-[#08102e]" : "bg-foreground text-background"
                        )}
                      >
                        <ArrowRightIcon className="size-[18px]" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="mt-12 grid items-start gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <section aria-labelledby="requests-title">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 id="requests-title" className="font-heading text-[26px] font-bold tracking-[-0.025em] text-foreground">
              Your requests
            </h2>
            <Link href="/account/requests/new" className="text-sm font-semibold text-primary hover:underline">
              New request
            </Link>
          </div>
          <div className="rounded-[22px] border border-border bg-card px-6 py-1.5">
            {shownRequests.length === 0 ? (
              <p className="py-5 text-[15px] leading-relaxed text-muted-foreground">
                A project brief, a mentorship application or a question: anything you send, here or through the contact form, shows here with where it stands.
              </p>
            ) : (
              <ul>
                {shownRequests.map((request) => (
                  <li key={String(request._id)} className="border-t border-border first:border-t-0">
                    <Link
                      href={`/account/requests/${request.reference}`}
                      className="-mx-3 grid gap-x-5 gap-y-1.5 rounded-xl px-3 py-[18px] transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-foreground sm:grid-cols-[minmax(0,1fr)_auto]"
                    >
                      <span className="text-base font-semibold text-foreground">{typeLabel(request.projectType)}</span>
                      <RequestTrack step={requestStep(request.status)} label={requestStatusLabel(request.status) ?? ""} />
                      <span className="line-clamp-1 text-sm text-muted-foreground sm:col-span-2">{request.message}</span>
                      <span className="font-mono text-xs text-muted-foreground sm:col-span-2">
                        {request.reference} · {formatDate(request.createdAt).replace(/ \d{4}$/, "")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <div className="grid gap-4 lg:pt-[52px]">
          <section aria-labelledby="start-title" className="rounded-[22px] bg-[#1c3a8c] p-6 text-[#f4f5fa]">
            <h2 id="start-title" className="font-heading text-2xl font-bold tracking-[-0.025em]">
              Something new?
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-[#c9d5ff]">Start a project, apply for mentorship, or just ask. It lands with a person, not a queue.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {START_OPTIONS.map((option) => (
                <Link
                  key={option.type}
                  href={`/account/requests/new?type=${option.type}`}
                  className="inline-flex h-9 items-center rounded-full bg-[rgb(244_245_250/0.12)] px-3.5 text-sm font-medium transition-colors hover:bg-[rgb(244_245_250/0.22)]"
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </section>

          <Link
            href="/account/profile"
            className="flex items-center gap-4 rounded-[22px] border border-border bg-card p-5 transition-colors hover:border-foreground/20"
          >
            <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-full bg-[#1c3a8c] text-[17px] font-bold text-[#afc4ff]">
              {initials(account.name)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[17px] font-semibold text-foreground">{account.name}</span>
              <span className="block truncate text-sm text-muted-foreground">
                {account.email}
                {account.company ? ` · ${account.company}` : ""}
              </span>
            </span>
            <ArrowRightIcon className="ml-auto size-4 shrink-0 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </>
  );
}

function Greeting({ eyebrow, lead, name }: { eyebrow: string; lead: string; name: string }) {
  return (
    <div>
      <p className="text-[15px] text-muted-foreground">{eyebrow}</p>
      <h1 className="mt-2.5 font-heading text-[clamp(44px,5.4vw,68px)] leading-[0.95] font-extrabold tracking-[-0.045em] text-foreground">
        {lead}
        <br />
        <span className="text-primary">{name}.</span>
      </h1>
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
