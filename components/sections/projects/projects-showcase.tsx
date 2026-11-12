"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRightIcon } from "lucide-react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { SectionHeading } from "@/lib/content/blocks/source";
import type { Project, ProjectMedia } from "@/components/sections/work/work-data";
import { ProjectMediaFill } from "@/components/sections/work/project-media-fill";
import { useProjectsFilter } from "@/components/sections/projects/filter-context";
import {
  ALL_FILTER,
  filterProjects,
  groupCounts,
} from "@/components/sections/projects/projects-content";

/* Three columns on desktop, two on a tablet, one on a phone. */
const CARD_SIZES = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

type View = "grid" | "index";

/* How many projects show before "Show all": enough to judge the work by,
   few enough that the page does not become thirty screens on a phone. */
const FIRST_LOOK = 9;

function statusTone(status: Project["status"]) {
  if (status === "Live") return "bg-[#54D696]";
  if (status === "In progress") return "bg-[#FFC94A]";
  return "bg-[var(--ld-text-dim)]";
}

/**
 * Every project, filterable, as a grid of cards or a dense index.
 *
 * Filtered rather than one undifferentiated wall: a visitor arrives with a
 * question ("have you shipped AI?", "do you actually do Web3?"), and the
 * buckets come from the projects themselves, so a new group adds its filter
 * without touching this file. The filter is shared with the hero's command
 * bar through context.
 *
 * Two views because the two questions differ: the grid is for looking, with
 * each card's screenshot touring itself on hover, and the index is for
 * scanning thirty names, categories and stacks at once.
 */
function ProjectsShowcase({
  projects,
  media,
  heading,
}: {
  projects: Project[];
  media: Partial<Record<string, ProjectMedia>>;
  heading: SectionHeading;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const { filter, setFilter, showAll, setShowAll } = useProjectsFilter();
  const [view, setView] = useState<View>("grid");

  const groups = useMemo(() => groupCounts(projects), [projects]);
  const shown = useMemo(() => filterProjects(projects, filter), [projects, filter]);
  const chips = [{ label: ALL_FILTER, count: projects.length }, ...groups];
  /* "Show all" belongs to the filter it was pressed under; choosing another
     filter starts again from the first few (see filter-context). */
  const visible = showAll ? shown : shown.slice(0, FIRST_LOOK);
  const hiddenCount = shown.length - visible.length;

  return (
    <section
      id="showcase"
      aria-labelledby="showcase-title"
      className="scroll-mt-24 bg-[var(--ld-paper)] text-[var(--ld-ink)]"
    >
      <div className="doc-shell py-16 sm:py-24 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            <p className="mb-4 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">
              {heading.eyebrow}
            </p>
            <h2
              id="showcase-title"
              className="ld-display text-[clamp(38px,5.2vw,72px)] leading-[0.95] font-extrabold tracking-[-0.045em] text-balance"
            >
              {heading.title}
            </h2>
            {heading.lede ? (
              <p className="mt-5 max-w-[38rem] text-[17px] leading-relaxed text-[var(--ld-text-2)]">{heading.lede}</p>
            ) : null}
          </div>

          <div role="group" aria-label="View" className="hidden rounded-full bg-[var(--ld-paper-2)] p-1 md:inline-flex">
            {(["grid", "index"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={view === option}
                onClick={() => setView(option)}
                className={cn(
                  "min-h-10 rounded-full px-[18px] text-sm font-semibold capitalize transition-colors",
                  view === option ? "bg-[var(--ld-ink)] text-[var(--ld-paper)]" : "text-[var(--ld-text-2)] hover:text-[var(--ld-ink)]"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div
          role="group"
          aria-label="Filter projects by category"
          className="-mx-5 mt-7 flex gap-2 overflow-x-auto border-b border-[var(--ld-line)] px-5 pb-5 [scrollbar-width:none] sm:mx-0 sm:mt-8 sm:flex-wrap sm:px-0 sm:pb-7 [&::-webkit-scrollbar]:hidden"
        >
          {chips.map((chip) => {
            const active = chip.label === filter;
            return (
              <button
                key={chip.label}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(chip.label)}
                className={cn(
                  "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors",
                  active
                    ? "border-[var(--ld-ink)] bg-[var(--ld-ink)] text-[var(--ld-paper)]"
                    : "border-[var(--ld-line-2)] text-[var(--ld-text-2)] hover:border-[var(--ld-ink)] hover:text-[var(--ld-ink)]"
                )}
              >
                {chip.label}
                <span className="font-mono text-[11px] opacity-70">{chip.count}</span>
              </button>
            );
          })}
        </div>

        {/* Announces the result of a filter, which otherwise only changes
            what a sighted visitor can see. */}
        <p aria-live="polite" className="sr-only">
          {shown.length} {shown.length === 1 ? "project" : "projects"} shown
        </p>

        {/* On a phone the cards are compact rows (picture beside the words)
            and the index view is not offered: one way to look, not two. */}
        {view === "grid" ? (
          <ul className="mt-6 grid gap-y-4 sm:mt-8 sm:grid-cols-2 sm:gap-x-[22px] sm:gap-y-7 lg:grid-cols-3">
            {visible.map((project) => (
              <li key={project.slug} className="ld-zoom">
                <article className="group relative flex h-full items-center gap-4 transition-transform sm:flex-col sm:items-stretch sm:gap-0 duration-500 ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-1.5">
                  <div className="relative aspect-[4/3] w-[38%] shrink-0 overflow-hidden rounded-[14px] border border-transparent sm:aspect-[16/10] sm:w-auto sm:rounded-[18px] bg-[var(--ld-ink)] transition-colors duration-300 group-hover:border-[rgb(var(--ld-accent-rgb)/0.6)]">
                    <ProjectMediaFill
                      project={project}
                      media={media[project.slug]}
                      reduceMotion={reduceMotion}
                      sizes={CARD_SIZES}
                      tour="hover"
                      compact
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 items-start justify-between gap-3 sm:mt-4">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.06em] text-[var(--ld-text-muted)] uppercase">
                        <span aria-hidden="true" className={cn("size-1.5 rounded-full", statusTone(project.status))} />
                        <span className="sr-only">{project.status}, </span>
                        {project.category}
                      </p>
                      <h3 className="ld-display mt-1 text-[19px] leading-tight font-bold tracking-[-0.02em] sm:mt-1.5 sm:text-[22px]">
                        {/* The link covers the whole card through its ::after,
                            so the card is one target with one accessible name. */}
                        <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0 after:rounded-[18px] focus-visible:outline-none">
                          {project.name}
                        </Link>
                      </h3>
                      <p className="mt-1 line-clamp-2 text-[13.5px] leading-normal text-[var(--ld-text-2)] sm:mt-1.5 sm:text-[14.5px]">
                        {project.description}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="hidden size-[38px] shrink-0 place-items-center rounded-full border border-[var(--ld-line-2)] transition-all sm:grid duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:border-[var(--ld-accent)] group-hover:bg-[var(--ld-accent)]"
                    >
                      <ArrowUpRightIcon className="size-4" />
                    </span>
                  </div>
                  {/* The keyboard focus ring for the whole card. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-1.5 rounded-[22px] ring-2 ring-[var(--ld-accent)] opacity-0 group-has-[:focus-visible]:opacity-100"
                  />
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="mt-5">
            {visible.map((project) => (
              <li key={project.slug} className="ld-zoom border-b border-[var(--ld-line)]">
                <Link
                  href={`/projects/${project.slug}`}
                  className="group grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-4 px-2 py-5 transition-colors hover:bg-[rgb(var(--ld-ink-rgb)/0.03)] md:grid-cols-[44px_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.1fr)_130px_24px]"
                >
                  <span className="font-mono text-xs text-[var(--ld-text-muted)]">{project.index}</span>
                  <span className="ld-display truncate text-[clamp(20px,2.2vw,28px)] font-bold tracking-[-0.02em] transition-transform duration-300 group-hover:translate-x-2">
                    {project.name}
                  </span>
                  <span className="hidden font-mono text-[11.5px] text-[var(--ld-text-muted)] uppercase md:block">
                    {project.category}
                  </span>
                  <span className="hidden truncate text-[13.5px] text-[var(--ld-text-2)] md:block">
                    {project.tags.slice(0, 3).join(" · ")}
                  </span>
                  <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase">
                    <span aria-hidden="true" className={cn("size-[7px] rounded-full", statusTone(project.status))} />
                    {project.status}
                  </span>
                  <ArrowUpRightIcon aria-hidden="true" className="hidden size-4 text-[var(--ld-text-muted)] md:block" />
                </Link>
              </li>
            ))}
          </ul>
        )}

        {hiddenCount > 0 ? (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--ld-ink)] px-6 text-[15px] font-semibold text-[var(--ld-paper)] transition-transform hover:-translate-y-0.5"
            >
              Show all {shown.length} projects
              <span className="font-mono text-xs opacity-60">+{hiddenCount}</span>
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export { ProjectsShowcase };
