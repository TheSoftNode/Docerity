import Link from "next/link";
import { ArrowLeftIcon, ArrowUpRightIcon, ChevronLeftIcon, ChevronRightIcon, GitBranchIcon } from "lucide-react";
import { statusDot } from "@/lib/content/project-schema";

import { cn } from "@/lib/utils";
import type { Project } from "@/components/sections/work/work-data";
import {
  extraGroups,
  manifestOf,
  pad,
  type Siblings,
} from "@/components/sections/project-detail/project-detail-content";

const BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-[14.5px] font-semibold transition-[transform,border-color] duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ld-accent)]";

/**
 * The project's dossier: its number in outline behind everything, the name
 * set large, what it does, where to see it, and a manifest of the facts it
 * actually has.
 *
 * The primary action depends on what exists. A live product is visited; a
 * private one with a write-up is read; the code is offered where it is
 * public, and otherwise the second button is an invitation to build
 * something like it.
 */
function ProjectHero({
  project,
  siblings,
  hasWriteUp,
}: {
  project: Project;
  siblings?: Siblings<Project>;
  hasWriteUp: boolean;
}) {
  const groups = extraGroups(project);
  /* The stack is listed in full just under the preview, so it isn't
     repeated here as a cut-down "+3". */
  const facts = manifestOf(project).filter((fact) => fact.label !== "Stack");

  return (
    <section className="relative -mt-[76px] overflow-hidden bg-[var(--ld-ink)] pt-[112px] text-[var(--ld-paper)]">
      <span
        aria-hidden="true"
        className="ld-drift ld-display pointer-events-none absolute top-[96px] -right-[1vw] hidden text-[clamp(160px,22vw,320px)] leading-[0.8] font-semibold tracking-[-0.06em] text-transparent [-webkit-text-stroke:1.25px_rgb(var(--ld-tint-rgb)/0.14)] md:block"
      >
        {project.index}
      </span>
      <span
        aria-hidden="true"
        className="absolute -top-[30%] -left-[12%] aspect-square w-[min(60vw,820px)] rounded-full bg-[radial-gradient(circle,rgb(28_58_140/0.55),transparent_65%)]"
      />

      <div className="doc-shell relative">
        <div className="ld-up flex items-center justify-between gap-3">
          <Link
            href="/projects"
            className="group -my-2 inline-flex min-h-11 items-center gap-2 text-sm text-[var(--ld-muted)] transition-colors hover:text-[var(--ld-paper)]"
          >
            <ArrowLeftIcon aria-hidden="true" className="size-4 transition-transform group-hover:-translate-x-1" />
            All projects
          </Link>
          {siblings ? (
            <nav aria-label="Browse projects" className="flex items-center gap-2">
              <span className="mr-1 text-[13px] text-[var(--ld-muted-3)] tabular-nums">
                <span className="text-[var(--ld-paper)]">{pad(siblings.position)}</span> / {pad(siblings.total)}
              </span>
              <Link
                href={`/projects/${siblings.previous.slug}`}
                aria-label={`Previous project: ${siblings.previous.name}`}
                className="grid size-10 place-items-center rounded-full border border-[rgb(var(--ld-paper-rgb)/0.18)] transition-colors hover:bg-[rgb(var(--ld-paper-rgb)/0.1)]"
              >
                <ChevronLeftIcon aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href={`/projects/${siblings.next.slug}`}
                aria-label={`Next project: ${siblings.next.name}`}
                className="grid size-10 place-items-center rounded-full border border-[rgb(var(--ld-paper-rgb)/0.18)] transition-colors hover:bg-[rgb(var(--ld-paper-rgb)/0.1)]"
              >
                <ChevronRightIcon aria-hidden="true" className="size-4" />
              </Link>
            </nav>
          ) : null}
        </div>

        <div className="mt-[clamp(28px,5vw,64px)] grid items-end gap-x-[clamp(24px,4vw,72px)] gap-y-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="min-w-0">
            <p className="ld-up ld-delay-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] text-[var(--ld-tint)]">
              {project.category}
              {groups.length > 0 ? (
                <>
                  <span aria-hidden="true" className="text-[var(--ld-muted-3)]">
                    ·
                  </span>
                  <span className="text-[var(--ld-muted-3)]">{groups.join(" · ")}</span>
                </>
              ) : null}
            </p>
            <h1 className="ld-display ld-up ld-delay-2 mt-3 text-[clamp(38px,6vw,88px)] leading-[0.98] font-semibold tracking-[-0.04em] text-balance [overflow-wrap:anywhere]">
              {project.name}
              <span aria-hidden="true" className="text-[var(--ld-accent)]">
                .
              </span>
            </h1>
          </div>
          <div className="ld-up ld-delay-3 min-w-0 lg:pb-2">
            <p className="text-[clamp(16px,1.25vw,18px)] leading-relaxed text-[var(--ld-muted)]">{project.description}</p>
            <div className="mt-6 grid grid-cols-1 gap-2.5 min-[420px]:flex min-[420px]:flex-wrap">
              {project.liveUrl ? (
                /* Real anchors: these navigate, and a screen reader should be
                   told they open elsewhere before they are followed. */
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={cn(BUTTON, "bg-[var(--ld-accent)] text-[var(--ld-ink)]")}
                >
                  Visit {project.name}
                  <ArrowUpRightIcon aria-hidden="true" className="size-4" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : hasWriteUp ? (
                <a href="#write-up" className={cn(BUTTON, "bg-[var(--ld-accent)] text-[var(--ld-ink)]")}>
                  Read the case study
                </a>
              ) : null}
              {project.repoUrl ? (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={cn(BUTTON, "border border-[rgb(var(--ld-paper-rgb)/0.22)] hover:border-[rgb(var(--ld-paper-rgb)/0.5)]")}
                >
                  <GitBranchIcon aria-hidden="true" className="size-4" />
                  Source code
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : (
                <Link
                  href="/contact"
                  className={cn(BUTTON, "border border-[rgb(var(--ld-paper-rgb)/0.22)] hover:border-[rgb(var(--ld-paper-rgb)/0.5)]")}
                >
                  Build something like it
                </Link>
              )}
            </div>
          </div>
        </div>

        <dl className="ld-up ld-delay-4 mt-[clamp(28px,4vw,52px)] grid grid-cols-2 gap-px overflow-hidden rounded-[18px] bg-[rgb(var(--ld-tint-rgb)/0.12)] ring-1 ring-[rgb(var(--ld-tint-rgb)/0.12)] sm:auto-cols-fr sm:grid-flow-col sm:grid-cols-none">
          {facts.map((fact) => (
            <div key={fact.label} className="min-w-0 bg-[var(--ld-ink)] px-4 py-3.5 sm:px-5 sm:py-4">
              <dt className="text-[12.5px] text-[var(--ld-muted-3)]">{fact.label}</dt>
              <dd className="mt-1 flex items-center gap-2 text-[14.5px] leading-snug font-medium [overflow-wrap:anywhere]">
                {fact.label === "Status" ? (
                  <span
                    aria-hidden="true"
                    className={cn("size-2 shrink-0 rounded-full", project.status === "Live" ? "ld-live bg-[#54D696]" : statusDot(project.status))}
                  />
                ) : null}
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export { ProjectHero };
