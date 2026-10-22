"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon, CodeIcon } from "lucide-react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { Project, ProjectMedia } from "@/components/sections/work/work-data";
import { ProjectStage } from "@/components/sections/home/project-stage";
import { PROJECT_INTERVAL_MS } from "@/components/sections/home/home-data";

type Props = {
  projects: Project[];
  media: Partial<Record<string, ProjectMedia>>;
};

/**
 * The featured projects as an index, with one large stage.
 *
 * An index rather than a card grid because the grid gave every project equal,
 * small weight; here one project at a time gets the full width of a browser
 * frame, and the list stays short enough to read at a glance.
 *
 * It plays through the projects on its own, with a progress line on the
 * active row and along the stage, and any row or the arrows take over at
 * once. It holds while the pointer is over the picture or keyboard focus is
 * inside the section (WCAG 2.2.2: moving content needs a way to stop it),
 * while the tab is hidden, and entirely under reduced motion.
 *
 * The rows are toggle buttons rather than tabs: the stage is a detail view of
 * the pressed row, and each project's own page is one click away below it.
 */
function WorkIndex({ projects, media }: Props) {
  const reduceMotion = useReducedMotion() ?? false;
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const count = projects.length;
  const paused = hovered || focused;
  const autoplay = !reduceMotion && count > 1;

  /* One timeout per selection rather than an interval, so a hand-picked
     project always gets its full turn instead of whatever was left of the
     previous one's. */
  useEffect(() => {
    if (!autoplay || paused) return;
    const timer = window.setTimeout(() => {
      if (document.visibilityState === "visible") setSelected((value) => (value + 1) % count);
    }, PROJECT_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [autoplay, paused, selected, count]);

  if (count === 0) return null;

  const index = Math.min(selected, count - 1);
  const project = projects[index];
  const total = String(count).padStart(2, "0");
  const step = (delta: number) => setSelected((value) => (value + delta + count) % count);
  const progress = autoplay ? { durationMs: PROJECT_INTERVAL_MS, paused } : null;

  return (
    <div
      className="grid items-start gap-[clamp(32px,5vw,72px)] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)]"
      /* Keyboard focus only. A mouse click also focuses the row it lands on,
         and counting that would leave the section paused for good after
         anybody picked a project by hand. */
      onFocus={(event) => {
        if ((event.target as HTMLElement).matches(":focus-visible")) setFocused(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <div className="min-w-0">
        <ul aria-label="Featured projects">
          {projects.map((item, position) => {
            const active = position === index;
            return (
              <li key={item.slug} className="relative">
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelected(position)}
                  className={cn(
                    "group grid w-full grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-3.5 border-t border-[rgb(var(--ld-tint-rgb)/0.16)] py-4 text-left outline-none transition-colors duration-300",
                    "focus-visible:ring-1 focus-visible:ring-[rgb(var(--ld-accent-rgb)/0.7)]",
                    active ? "text-[var(--ld-paper)]" : "text-[var(--ld-muted-3)] hover:text-[var(--ld-paper)]"
                  )}
                >
                  <span className="font-mono text-xs">{item.index}</span>
                  <span className="flex min-w-0 items-center gap-3 transition-transform duration-300 group-hover:translate-x-1.5">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-0.5 shrink-0 bg-[var(--ld-accent)] transition-[width] duration-500 ease-[cubic-bezier(.2,.7,.2,1)]",
                        active ? "w-7" : "w-0"
                      )}
                    />
                    <span className="ld-display truncate text-[clamp(20px,2vw,26px)] font-bold tracking-[-0.02em]">
                      {item.name}
                    </span>
                  </span>
                  <span className="hidden items-center gap-2 font-mono text-[11px] text-[var(--ld-muted-3)] uppercase sm:inline-flex">
                    <span
                      aria-hidden="true"
                      className={cn("size-1.5 rounded-full", item.status === "Live" ? "bg-[#54D696]" : "bg-[#FFC94A]")}
                    />
                    {item.category}
                  </span>
                </button>
                {/* The time left on this project, drawn over the row's top rule.
                    Keyed by selection so it restarts with every change. */}
                {active && progress ? (
                  <span
                    key={`progress-${index}`}
                    aria-hidden="true"
                    className="ld-progress absolute inset-x-0 top-0 h-px origin-left bg-[var(--ld-accent)]"
                    style={{
                      animationDuration: `${progress.durationMs}ms`,
                      animationPlayState: progress.paused ? "paused" : "running",
                    }}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[rgb(var(--ld-tint-rgb)/0.16)] pt-5 font-mono text-xs text-[var(--ld-muted-3)]">
          <span className="inline-flex items-center gap-2">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-[#54D696]" /> Live
            <span aria-hidden="true" className="ml-2.5 size-1.5 rounded-full bg-[#FFC94A]" /> In progress
          </span>
          <Link href="/projects" className="border-b border-current text-[var(--ld-paper)] hover:opacity-70">
            All projects →
          </Link>
        </div>
      </div>

      <div className="min-w-0">
        <div className="mb-4 flex items-center justify-end gap-3.5">
          <span className="font-mono text-[13px] text-[var(--ld-muted-2)]">
            <span className="text-[var(--ld-paper)]">{project.index}</span> / {total}
          </span>
          <button
            type="button"
            aria-label="Previous project"
            onClick={() => step(-1)}
            className="grid size-11 place-items-center rounded-full border border-[rgb(var(--ld-paper-rgb)/0.3)] transition-transform hover:-translate-y-0.5"
          >
            <ArrowLeftIcon className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next project"
            onClick={() => step(1)}
            className="grid size-11 place-items-center rounded-full bg-[var(--ld-accent)] text-[var(--ld-ink)] transition-transform hover:-translate-y-0.5"
          >
            <ArrowRightIcon className="size-4" />
          </button>
        </div>

        {/* Keyed by project, so changing it replays the stage's entrance
            instead of swapping the picture in place under a static frame. */}
        <article key={project.slug}>
          {/* Hovering the picture is what pauses it: somebody looking closely
              at a project should not have it change under them. The rest of
              the section keeps playing under the pointer. */}
          <div
            data-stage=""
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
          >
            <ProjectStage
              project={project}
              media={media[project.slug]}
              reduceMotion={reduceMotion}
              progress={progress}
            />
          </div>

          <div className="ld-up ld-delay-1 mt-8 flex flex-wrap items-start justify-between gap-x-10 gap-y-5">
            <div className="min-w-0 flex-[1_1_320px]">
              <h3 className="ld-display text-[clamp(28px,3vw,38px)] font-extrabold tracking-[-0.035em]">
                {project.name}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-[var(--ld-muted)]">{project.description}</p>
              <p className="mt-3 font-mono text-xs leading-relaxed text-[var(--ld-muted-3)]">
                {project.tags.join(" · ")}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--ld-accent)] px-4 text-sm font-semibold text-[var(--ld-ink)] transition-transform hover:-translate-y-0.5"
                >
                  Visit live site
                  <ArrowUpRightIcon className="size-3.5" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : null}
              <Link
                href={`/projects/${project.slug}`}
                className="inline-flex min-h-11 items-center rounded-full border border-[rgb(var(--ld-paper-rgb)/0.3)] px-4 text-sm font-semibold transition-transform hover:-translate-y-0.5"
              >
                Case study
              </Link>
              {project.repoUrl ? (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[rgb(var(--ld-paper-rgb)/0.3)] px-4 text-sm font-semibold transition-transform hover:-translate-y-0.5"
                >
                  <CodeIcon className="size-3.5" />
                  Code
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              ) : null}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export { WorkIndex };
