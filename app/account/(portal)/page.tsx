import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, ClockIcon, RouteIcon } from "lucide-react";

import { requireAccount } from "@/lib/account/session";
import { currentMilestoneIndex, projectProgress, requestStatusLabel } from "@/lib/account/rules";
import { listProjectsForEmail } from "@/lib/repositories/client-project.repository";
import { listEnquiriesForEmail } from "@/lib/repositories/enquiry.repository";
import { projectTypes } from "@/lib/contact/schema";
import { timeAgo } from "@/components/admin/admin-content";
import { PortalCard, ProgressBar, StatusPill, formatDate } from "@/components/account/portal-ui";
import { VerifyBanner } from "@/components/account/verify-banner";
import { LiveRefresh } from "@/components/account/live-refresh";

export const metadata: Metadata = { title: "Overview" };
export const dynamic = "force-dynamic";

/**
 * A client's front page: their projects with how far along each is and what
 * is happening now, and everything they have sent through the site with where
 * it stands. Nothing private shows until their address is confirmed, because
 * the address is what ties the work to them.
 */
export default async function AccountOverviewPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const account = await requireAccount("/account");
  const { welcome } = await searchParams;
  const first = account.name.split(" ")[0];

  if (!account.verified) {
    return (
      <>
        <PageTitle title={`Hello, ${first}`} line="One step left before your account is ready." />
        <VerifyBanner email={account.email} />
      </>
    );
  }

  const [projects, requests] = await Promise.all([listProjectsForEmail(account.email), listEnquiriesForEmail(account.email)]);
  const typeLabel = (value: string) => projectTypes.find((type) => type.value === value)?.label ?? "Request";
  const active = projects.filter((project) => project.status !== "done").length;

  return (
    <>
      <div className="flex flex-col gap-4 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <PageTitle
          title={welcome ? `Welcome, ${first}` : `Hello, ${first}`}
          line={
            projects.length === 0
              ? "Your account is ready. When we start work for you, it appears here."
              : `${active} ${active === 1 ? "project" : "projects"} in progress.`
          }
        />
        {projects.length > 0 ? <LiveRefresh /> : null}
      </div>

      <section aria-labelledby="projects-title">
        <h2 id="projects-title" className="sr-only">
          Your projects
        </h2>
        {projects.length === 0 ? (
          <div className="rounded-[20px] border border-border bg-card px-6 py-14 text-center">
            <p className="font-heading text-2xl font-bold tracking-[-0.02em] text-foreground">No projects yet</p>
            <p className="mx-auto mt-2 max-w-[46ch] text-[15px] leading-relaxed text-muted-foreground">
              Once we agree to work together, your project shows up here with its milestones, updates and previews as they happen.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-[15px] font-semibold text-background transition-transform hover:-translate-y-0.5"
            >
              Start a project <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {projects.map((project) => {
              const progress = projectProgress(project.milestones, project.status);
              const now = currentMilestoneIndex(project.milestones);
              const done = project.milestones.filter((milestone) => milestone.status === "done").length;
              const latest = project.updates[0];
              return (
                <li key={String(project._id)}>
                  <Link
                    href={`/account/projects/${String(project._id)}`}
                    className="group flex h-full flex-col rounded-[20px] border border-border bg-card p-6 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_18px_40px_-28px_rgb(8_16_46/0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-heading text-2xl leading-tight font-bold tracking-[-0.02em] text-foreground">{project.title}</h3>
                      <StatusPill status={project.status} className="shrink-0" />
                    </div>

                    <div className="mt-6 flex items-baseline justify-between">
                      <span className="font-heading text-4xl font-extrabold tracking-[-0.04em] text-foreground">{progress}%</span>
                      <span className="text-sm text-muted-foreground">
                        {project.milestones.length > 0 ? `${done} of ${project.milestones.length} milestones` : "Milestones coming soon"}
                      </span>
                    </div>
                    <div className="mt-3">
                      <ProgressBar value={progress} label={`${project.title}: ${progress}% complete`} />
                    </div>

                    <dl className="mt-6 grid gap-3 text-sm">
                      {now >= 0 && project.status !== "done" ? (
                        <div className="flex gap-2.5">
                          <dt>
                            <RouteIcon aria-label="Now" className="mt-0.5 size-4 text-primary" />
                          </dt>
                          <dd className="text-foreground">
                            <span className="text-muted-foreground">Now: </span>
                            {project.milestones[now].title}
                          </dd>
                        </div>
                      ) : null}
                      {project.targetDate ? (
                        <div className="flex gap-2.5">
                          <dt>
                            <ClockIcon aria-label="Target" className="mt-0.5 size-4 text-primary" />
                          </dt>
                          <dd className="text-foreground">
                            <span className="text-muted-foreground">Target: </span>
                            {formatDate(project.targetDate)}
                          </dd>
                        </div>
                      ) : null}
                    </dl>

                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4 text-sm">
                      <span className="min-w-0 truncate text-muted-foreground">
                        {latest ? (
                          <>
                            <span className="font-medium text-foreground">{latest.title}</span> · {timeAgo(latest.createdAt)}
                          </>
                        ) : (
                          "No updates yet"
                        )}
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5 font-semibold text-primary">
                        Open <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <PortalCard
          title="Your requests"
          action={
            <Link href="/contact" className="text-sm font-semibold text-primary hover:underline">
              Send a new one
            </Link>
          }
        >
          {requests.length === 0 ? (
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Anything you send through the contact form, a project brief or a mentorship application, shows here with where it stands.
            </p>
          ) : (
            <ul>
              {requests.map((request) => {
                const status = requestStatusLabel(request.status);
                if (!status) return null;
                return (
                  <li key={String(request._id)} className="border-t border-border py-4 first:border-t-0 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[15px] font-semibold text-foreground">{typeLabel(request.projectType)}</p>
                      <span
                        className={
                          request.status === "replied"
                            ? "rounded-full bg-brand-teal/15 px-2.5 py-1 text-xs font-semibold text-brand-teal"
                            : "rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"
                        }
                      >
                        {status}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{request.message}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Sent {formatDate(request.createdAt)}
                      {request.reference ? ` · Ref ${request.reference}` : ""}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </PortalCard>

        <PortalCard title="Your details">
          <dl className="grid gap-3 text-[15px]">
            <div>
              <dt className="text-sm text-muted-foreground">Name</dt>
              <dd className="font-medium text-foreground">{account.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Email</dt>
              <dd className="font-medium break-all text-foreground">{account.email}</dd>
            </div>
            {account.company ? (
              <div>
                <dt className="text-sm text-muted-foreground">Company</dt>
                <dd className="font-medium text-foreground">{account.company}</dd>
              </div>
            ) : null}
          </dl>
          <Link href="/account/profile" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            Edit your details <ArrowRightIcon className="size-4" />
          </Link>
        </PortalCard>
      </div>
    </>
  );
}

function PageTitle({ title, line }: { title: string; line: string }) {
  return (
    <div>
      <h1 className="font-heading text-[clamp(34px,4vw,52px)] leading-none font-extrabold tracking-[-0.04em] text-foreground">{title}</h1>
      <p className="mt-3 text-[17px] text-muted-foreground">{line}</p>
    </div>
  );
}
