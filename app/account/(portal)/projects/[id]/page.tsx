import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowUpRightIcon, CheckIcon, MessageCircleIcon, MonitorSmartphoneIcon, ZapIcon, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { requireAccount } from "@/lib/account/session";
import { MILESTONE_STATUS_LABELS, UPDATE_KIND_LABELS, currentMilestoneIndex, projectProgress, safeHttps, type MilestoneStatus, type UpdateKind } from "@/lib/account/rules";
import { findProjectForEmail } from "@/lib/repositories/client-project.repository";
import { timeAgo } from "@/components/admin/admin-content";
import { PortalCard, ProgressBar, StatusPill, formatDate } from "@/components/account/portal-ui";
import { LiveRefresh } from "@/components/account/live-refresh";
import { UpdateThread } from "@/components/account/update-thread";

export const metadata: Metadata = { title: "Project" };
export const dynamic = "force-dynamic";

const KIND_ICON: Record<UpdateKind, LucideIcon> = {
  update: ZapIcon,
  milestone: CheckIcon,
  preview: MonitorSmartphoneIcon,
  question: MessageCircleIcon,
};

/**
 * One project, as the client follows it: how far along it is, what happens
 * next, each milestone in order, every update posted (newest first), and the
 * links to look at it. The page checks for news every half minute while it is
 * open, so an update posted in the admin appears without a reload.
 *
 * Only found for the address it belongs to: the lookup is by id and address
 * together, so somebody else's id is simply a page that does not exist.
 */
export default async function AccountProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = await requireAccount(`/account/projects/${id}`);
  if (!account.verified) notFound();

  const project = await findProjectForEmail(id, account.email);
  if (!project) notFound();

  const progress = projectProgress(project.milestones, project.status);
  const current = project.status === "done" ? -1 : currentMilestoneIndex(project.milestones);
  const done = project.milestones.filter((milestone) => milestone.status === "done").length;
  const links = project.links.map((link) => ({ label: link.label, url: safeHttps(link.url) })).filter((link) => link.url);

  return (
    <>
      <Link href="/account" className="inline-flex items-center gap-2 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeftIcon className="size-4" />
        All projects
      </Link>

      <header className="mt-5 flex flex-col gap-4 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill status={project.status} />
            <LiveRefresh />
          </div>
          <h1 className="mt-4 font-heading text-[clamp(34px,4.4vw,58px)] leading-[0.98] font-extrabold tracking-[-0.045em] text-foreground">{project.title}</h1>
          {project.summary ? <p className="mt-4 max-w-[64ch] text-[17px] leading-relaxed text-muted-foreground">{project.summary}</p> : null}
        </div>
      </header>

      {/* The headline numbers: one dark band, so where things stand is the first thing read. */}
      <section aria-label="Progress" className="rounded-[24px] bg-[#08102e] p-6 text-[#f4f5fa] sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <p className="text-sm text-[#9aa7cf]">Overall progress</p>
            <p className="mt-2 font-heading text-[clamp(56px,7vw,88px)] leading-none font-extrabold tracking-[-0.05em]">{progress}%</p>
            <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-[rgb(175_196_255/0.16)]" role="progressbar" aria-label={`${progress}% complete`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
              <div className="h-full rounded-full bg-[#afc4ff] transition-[width] duration-700" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-4 lg:gap-6">
            <div>
              <dt className="text-sm text-[#9aa7cf]">Milestones</dt>
              <dd className="mt-1 font-heading text-2xl font-bold">
                {done}/{project.milestones.length}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-[#9aa7cf]">Started</dt>
              <dd className="mt-1 font-heading text-lg font-bold">{project.startDate ? formatDate(project.startDate) : "Not yet"}</dd>
            </div>
            <div>
              <dt className="text-sm text-[#9aa7cf]">Target</dt>
              <dd className="mt-1 font-heading text-lg font-bold">{project.targetDate ? formatDate(project.targetDate) : "To be agreed"}</dd>
            </div>
          </dl>
        </div>
        {project.nextStep ? (
          <p className="mt-8 rounded-2xl bg-[rgb(175_196_255/0.08)] px-5 py-4 text-[15px] leading-relaxed">
            <span className="font-semibold text-[#ff9a80]">Next: </span>
            {project.nextStep}
          </p>
        ) : null}
      </section>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <div className="grid gap-4">
          <PortalCard title="Milestones">
            {project.milestones.length === 0 ? (
              <p className="text-[15px] leading-relaxed text-muted-foreground">The plan is being put together. Milestones appear here once it is agreed.</p>
            ) : (
              <ol className="relative">
                {project.milestones.map((milestone, index) => {
                  const status = milestone.status as MilestoneStatus;
                  const isNow = index === current;
                  const last = index === project.milestones.length - 1;
                  return (
                    <li key={String(milestone._id)} className="relative flex gap-4 pb-6 last:pb-0">
                      {!last ? (
                        <span aria-hidden className={cn("absolute top-8 bottom-0 left-[13px] w-0.5", status === "done" ? "bg-primary" : "bg-border")} />
                      ) : null}
                      <span
                        aria-hidden
                        className={cn(
                          "relative z-10 grid size-7 shrink-0 place-items-center rounded-full border-2",
                          status === "done" && "border-primary bg-primary text-primary-foreground",
                          status === "doing" && "border-[#ff7a59] bg-card",
                          status === "todo" && "border-border bg-card"
                        )}
                      >
                        {status === "done" ? <CheckIcon className="size-3.5" strokeWidth={3} /> : status === "doing" ? <span className="size-2.5 rounded-full bg-[#ff7a59]" /> : null}
                      </span>
                      <div className="min-w-0 pt-0.5">
                        <p className={cn("text-[15px] font-semibold", status === "todo" ? "text-muted-foreground" : "text-foreground")}>
                          {milestone.title}
                          {isNow ? <span className="ml-2 rounded-full bg-[#ff7a59]/15 px-2 py-0.5 align-middle text-xs font-semibold text-[#b4401f] dark:text-[#ff9a80]">Now</span> : null}
                        </p>
                        {milestone.detail ? <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{milestone.detail}</p> : null}
                        <p className="mt-1 text-xs text-muted-foreground">
                          <span className="sr-only">{MILESTONE_STATUS_LABELS[status]}. </span>
                          {status === "done" && milestone.doneAt ? `Done ${formatDate(milestone.doneAt)}` : milestone.due ? `Due ${formatDate(milestone.due)}` : MILESTONE_STATUS_LABELS[status]}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </PortalCard>

          {links.length > 0 ? (
            <PortalCard title="Links">
              <ul className="grid gap-2">
                {links.map((link) => (
                  <li key={link.url}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-[15px] font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-muted"
                    >
                      <span className="min-w-0 truncate">{link.label}</span>
                      <ArrowUpRightIcon className="size-4 shrink-0 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </PortalCard>
          ) : null}
        </div>

        <PortalCard title="Updates">
          {project.updates.length === 0 ? (
            <p className="text-[15px] leading-relaxed text-muted-foreground">Updates from the team appear here as the work moves. You&apos;ll get an email for each one too.</p>
          ) : (
            <ol>
              {project.updates.map((update) => {
                const kind = (update.kind in UPDATE_KIND_LABELS ? update.kind : "update") as UpdateKind;
                const Icon = KIND_ICON[kind];
                const link = safeHttps(update.link);
                return (
                  <li key={String(update._id)} className="flex gap-4 border-t border-border py-5 first:border-t-0 first:pt-0 last:pb-0">
                    <span
                      aria-hidden
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-full",
                        kind === "question" ? "bg-[#ff7a59]/15 text-[#b4401f] dark:text-[#ff9a80]" : kind === "milestone" ? "bg-brand-teal/15 text-brand-teal" : "bg-primary/10 text-primary"
                      )}
                    >
                      <Icon className="size-[18px]" />
                    </span>
                    <article className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">
                        {UPDATE_KIND_LABELS[kind]} · {timeAgo(update.createdAt)}
                        {update.by ? ` · ${update.by}` : ""}
                      </p>
                      <h3 className="mt-1 text-[17px] font-semibold text-foreground">{update.title}</h3>
                      {update.body ? <p className="mt-2 text-[15px] leading-relaxed whitespace-pre-line text-muted-foreground">{update.body}</p> : null}
                      {link ? (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5"
                        >
                          {kind === "preview" ? "Try it" : "Open the link"}
                          <ArrowUpRightIcon className="size-4" />
                        </a>
                      ) : null}
                      <UpdateThread
                        projectId={id}
                        updateId={String(update._id)}
                        updateTitle={update.title}
                        askingYou={kind === "question"}
                        replies={(update.replies ?? []).map((reply) => ({
                          id: String(reply._id),
                          from: reply.from === "team" ? "team" : "client",
                          name: reply.name ?? "",
                          body: reply.body,
                          createdAt: new Date(reply.createdAt).toISOString(),
                        }))}
                      />
                    </article>
                  </li>
                );
              })}
            </ol>
          )}
        </PortalCard>
      </div>
    </>
  );
}
