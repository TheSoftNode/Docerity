import Link from "next/link";
import { ArrowLeftIcon, ArrowUpRightIcon, ChevronLeftIcon, ChevronRightIcon, GitBranchIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Project } from "@/components/sections/work/work-data";
import {
  extraGroups,
  manifestOf,
  pad,
  type Siblings,
} from "@/components/sections/project-detail/project-detail-content";

const BUTTON =
  "inline-flex min-h-[50px] items-center gap-2 rounded-full px-6 text-[15px] font-semibold transition-[transform,border-color] duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ld-accent)]";

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
  const facts = manifestOf(project);

  return (
    <section className="relative -mt-[76px] overflow-hidden bg-[var(--ld-ink)] pt-32 text-[var(--ld-paper)]">
      <span
        aria-hidden="true"
        className="ld-drift ld-display pointer-events-none absolute top-[70px] -right-[2vw] hidden text-[clamp(200px,34vw,520px)] leading-[0.8] font-extrabold tracking-[-0.07em] text-transparent [-webkit-text-stroke:1.5px_rgb(var(--ld-tint-rgb)/0.16)] md:block"
      >
        {project.index}
      </span>
      <span
        aria-hidden="true"
        className="absolute -top-[30%] -left-[12%] aspect-square w-[min(60vw,820px)] rounded-full bg-[radial-gradient(circle,rgb(28_58_140/0.55),transparent_65%)]"
      />

      <div className="doc-shell relative">
        <div className="ld-up flex flex-col items-start justify-between gap-3.5 sm:flex-row sm:items-center">
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2.5 text-sm text-[var(--ld-muted)] transition-colors hover:text-[var(--ld-paper)]"
          >
            <ArrowLeftIcon aria-hidden="true" className="size-4 transition-transform group-hover:-translate-x-1" />
            All projects
          </Link>
          {siblings ? (
            <nav aria-label="Browse projects" className="flex items-center gap-3">
              <span className="font-mono text-xs tracking-[0.08em] text-[var(--ld-muted-3)] uppercase">
                Project <span className="text-[var(--ld-paper)]">{pad(siblings.position)}</span> / {pad(siblings.total)}
              </span>
              <Link
                href={`/projects/${siblings.previous.slug}`}
                aria-label="Previous project"
                className="grid size-10 place-items-center rounded-full border border-[rgb(var(--ld-paper-rgb)/0.18)] transition-colors hover:bg-[rgb(var(--ld-paper-rgb)/0.1)]"
              >
                <ChevronLeftIcon aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href={`/projects/${siblings.next.slug}`}
                aria-label="Next project"
                className="grid size-10 place-items-center rounded-full border border-[rgb(var(--ld-paper-rgb)/0.18)] transition-colors hover:bg-[rgb(var(--ld-paper-rgb)/0.1)]"
              >
                <ChevronRightIcon aria-hidden="true" className="size-4" />
              </Link>
            </nav>
          ) : null}
        </div>

        <p className="ld-up ld-delay-1 mt-[clamp(48px,7vw,96px)] flex flex-wrap items-center gap-2.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-tint)] uppercase">
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
        <h1 className="ld-display ld-up ld-delay-2 mt-[18px] max-w-[12ch] text-[clamp(56px,11vw,172px)] leading-[0.86] font-extrabold tracking-[-0.06em] [overflow-wrap:anywhere]">
          {project.name}
          <span aria-hidden="true" className="text-[var(--ld-accent)]">
            .
          </span>
        </h1>
        <p className="ld-up ld-delay-3 mt-7 max-w-[40rem] text-[clamp(18px,1.6vw,22px)] leading-relaxed text-[var(--ld-muted)]">
          {project.description}
        </p>

        <div className="ld-up ld-delay-4 mt-8 flex flex-wrap gap-2.5">
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

        <dl className="ld-up ld-delay-4 mt-[clamp(56px,7vw,96px)] grid grid-cols-2 border-t border-[rgb(var(--ld-tint-rgb)/0.2)] sm:grid-cols-3 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none">
          {facts.map((fact) => (
            <div key={fact.label} className="mr-[18px] border-r border-[rgb(var(--ld-tint-rgb)/0.12)] py-[22px] pr-[18px] last:border-r-0">
              <dt className="font-mono text-[11px] tracking-[0.1em] text-[var(--ld-muted-3)] uppercase">{fact.label}</dt>
              <dd className="mt-2.5 flex items-center gap-2 text-base font-medium">
                {fact.label === "Status" ? (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-2 rounded-full",
                      project.status === "Live" ? "ld-live bg-[#54D696]" : project.status === "In progress" ? "bg-[#FFC94A]" : "bg-[var(--ld-muted-3)]"
                    )}
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
