import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowUpRightIcon, CheckIcon, MessageCircleIcon, MonitorSmartphoneIcon, ZapIcon, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { requireAccount } from "@/lib/account/session";
import { UPDATE_KIND_LABELS, currentMilestoneIndex, projectProgress, safeHttps, type MilestoneStatus, type UpdateKind } from "@/lib/account/rules";
import { findProjectForEmail } from "@/lib/repositories/client-project.repository";
import { timeAgo } from "@/components/admin/admin-content";
import { ProgressRing, StatusPillOnDark, formatDate } from "@/components/account/portal-ui";
import { LiveRefresh } from "@/components/account/live-refresh";
import { UpdateThread } from "@/components/account/update-thread";

export const metadata: Metadata = { title: "Project" };
export const dynamic = "force-dynamic";

const KIND: Record<UpdateKind, { Icon: LucideIcon; tone: string }> = {
  update: { Icon: ZapIcon, tone: "bg-primary/10 text-primary" },
  milestone: { Icon: CheckIcon, tone: "bg-brand-teal/15 text-brand-teal" },
  preview: { Icon: MonitorSmartphoneIcon, tone: "bg-primary/10 text-primary" },
  question: { Icon: MessageCircleIcon, tone: "bg-[#ff7a59]/15 text-[#b4401f] dark:text-[#ff9a80]" },
};

const shortDate = (value: Date | string | null | undefined) => formatDate(value).replace(/ \d{4}$/, "");

/**
 * One project, as the client follows it.
 *
 * On the left, a navy column that stays in view: the name, a large progress
 * ring, the dates, what happens next and the links. On the right, the route
 * (each milestone as a stretch of road, done, now or to come) and every update
 * with the conversation under it. It checks for news every half minute while
 * open. Only found for the address it belongs to: somebody else's id is
 * simply a page that does not exist.
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

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
        <aside aria-label="Where it stands" className="rounded-[26px] bg-[#08102e] p-7 text-[#f4f5fa] lg:sticky lg:top-24">
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusPillOnDark status={project.status} />
            <span className="inline-flex items-center gap-1.5 text-[13px] text-[#9aa7cf]">
              <span aria-hidden className="size-2 rounded-full bg-[#4cc59a]" />
              Live
            </span>
          </div>
          <h1 className="mt-4 font-heading text-[clamp(34px,3.2vw,42px)] leading-none font-extrabold tracking-[-0.04em]">{project.title}</h1>
          {project.summary ? <p className="mt-3 text-[15px] leading-relaxed text-[#c4cbe3]">{project.summary}</p> : null}

          <div className="my-7 flex justify-center">
            <ProgressRing
              value={progress}
              size={210}
              stroke={14}
              tone="dark"
              numberClass="text-[56px]"
              caption={project.milestones.length ? `${done} of ${project.milestones.length} milestones` : "Plan coming soon"}
            />
          </div>

          <dl className="grid grid-cols-2 border-t border-[rgb(175_196_255/0.14)]">
            <div className="py-3.5">
              <dt className="text-[13px] text-[#9aa7cf]">Started</dt>
              <dd className="mt-0.5 font-heading text-[19px] font-bold">{project.startDate ? formatDate(project.startDate) : "Not yet"}</dd>
            </div>
            <div className="border-l border-[rgb(175_196_255/0.14)] py-3.5 pl-4">
              <dt className="text-[13px] text-[#9aa7cf]">Target</dt>
              <dd className="mt-0.5 font-heading text-[19px] font-bold">{project.targetDate ? formatDate(project.targetDate) : "To be agreed"}</dd>
            </div>
          </dl>

          {project.nextStep ? (
            <p className="mt-1 rounded-2xl border border-[#ff7a59]/30 bg-[#ff7a59]/[0.12] px-4 py-3.5 text-[15px] leading-normal">
              <span className="mb-1 block text-xs font-bold text-[#ff9a80]">What happens next</span>
              {project.nextStep}
            </p>
          ) : null}

          {links.length > 0 ? (
            <ul className="mt-4">
              {links.map((link) => (
                <li key={link.url} className="border-t border-[rgb(175_196_255/0.14)]">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-3 py-3 text-[15px] font-medium">
                    <span className="min-w-0 truncate">{link.label}</span>
                    <ArrowUpRightIcon className="size-4 shrink-0 text-[#afc4ff] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </aside>

        <div className="grid min-w-0 gap-5">
          <section aria-labelledby="route-title" className="rounded-[26px] border border-border bg-card p-7">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="route-title" className="font-heading text-[26px] font-bold tracking-[-0.025em] text-foreground">
                The route
              </h2>
              <span className="text-sm text-muted-foreground">
                {project.milestones.length ? `${done} of ${project.milestones.length} done` : "Being planned"}
              </span>
            </div>
            {project.milestones.length === 0 ? (
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">The plan is being put together. Its milestones appear here once it is agreed.</p>
            ) : (
              <ol className="mt-6 grid gap-x-4 gap-y-7 sm:grid-cols-2 xl:grid-cols-[repeat(auto-fit,minmax(170px,1fr))]">
                {project.milestones.map((milestone, index) => {
                  const status = milestone.status as MilestoneStatus;
                  const isNow = index === current;
                  const state = status === "done" ? "done" : isNow ? "now" : "todo";
                  return (
                    <li key={String(milestone._id)}>
                      <span
                        aria-hidden
                        className={cn(
                          "mb-4 block h-1 rounded-full",
                          state === "done" && "bg-primary",
                          state === "now" && "bg-[linear-gradient(90deg,var(--primary)_50%,var(--muted)_50%)]",
                          state === "todo" && "bg-muted"
                        )}
                      />
                      <span className={cn("text-xs font-semibold", state === "done" ? "text-primary" : state === "now" ? "text-[#b4401f] dark:text-[#ff9a80]" : "text-muted-foreground")}>
                        {state === "done"
                          ? `Done${milestone.doneAt ? ` · ${shortDate(milestone.doneAt)}` : ""}`
                          : state === "now"
                            ? `Now${milestone.due ? ` · due ${shortDate(milestone.due)}` : ""}`
                            : milestone.due
                              ? `Due ${shortDate(milestone.due)}`
                              : "To come"}
                      </span>
                      <p className={cn("mt-1 text-base leading-snug font-semibold", state === "todo" ? "text-muted-foreground" : "text-foreground")}>{milestone.title}</p>
                      {milestone.detail ? <p className="mt-1.5 text-[13px] leading-normal text-muted-foreground">{milestone.detail}</p> : null}
                    </li>
                  );
                })}
              </ol>
            )}
          </section>

          <section aria-labelledby="updates-title" className="rounded-[26px] border border-border bg-card p-7">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="updates-title" className="font-heading text-[26px] font-bold tracking-[-0.025em] text-foreground">
                Updates
              </h2>
              <LiveRefresh />
            </div>
            {project.updates.length === 0 ? (
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">Updates from the team appear here as the work moves, and in your inbox too.</p>
            ) : (
              <ol className="mt-2">
                {project.updates.map((update) => {
                  const kind = (update.kind in UPDATE_KIND_LABELS ? update.kind : "update") as UpdateKind;
                  const { Icon, tone } = KIND[kind];
                  const link = safeHttps(update.link);
                  return (
                    <li key={String(update._id)} className="grid grid-cols-[44px_minmax(0,1fr)] gap-4 border-t border-border py-6 first:border-t-0 last:pb-1">
                      <span aria-hidden className={cn("grid size-11 place-items-center rounded-[14px]", tone)}>
                        <Icon className="size-[18px]" />
                      </span>
                      <article className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          {UPDATE_KIND_LABELS[kind]} · {timeAgo(update.createdAt)}
                          {update.by ? ` · ${update.by}` : ""}
                        </p>
                        <h3 className="mt-1 font-heading text-[19px] leading-snug font-bold tracking-[-0.02em] text-foreground">{update.title}</h3>
                        {update.body ? <p className="mt-2 text-[15px] leading-relaxed whitespace-pre-line text-muted-foreground">{update.body}</p> : null}
                        {link ? (
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3.5 inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-semibold text-background transition-transform hover:-translate-y-0.5"
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
          </section>
        </div>
      </div>
    </>
  );
}
