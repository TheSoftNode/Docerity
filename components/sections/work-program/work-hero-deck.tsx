"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRightIcon } from "lucide-react";

import { MetricDot } from "@/components/shared/section-kit";
import { WorkMedia } from "@/components/sections/work/work-media";
import type { Project, ProjectMedia } from "@/components/sections/work/work-data";

const INTERVAL = 4600;

/* Where a card sits by its distance from the front of the deck. */
const layout = [
  { x: 0, y: 0, scale: 1, opacity: 1, zIndex: 30 },
  { x: 18, y: -24, scale: 0.962, opacity: 0.62, zIndex: 20 },
  { x: 36, y: -48, scale: 0.924, opacity: 0.34, zIndex: 10 },
];

/**
 * The case studies as a deck that deals itself.
 *
 * Reuses each project's existing preview art via `WorkMedia`, so a real
 * screenshot dropped into `projectMedia` shows up here too. Only the front
 * card is interactive; the ones behind are `aria-hidden` and taken out of the
 * tab order, otherwise keyboard users would tab through three links to pages
 * they cannot see.
 */
function WorkHeroDeck({
  projects,
  media,
}: {
  /* The featured set and its media, resolved on the server. This component
     cycles through them on a timer, so it stays a Client Component. */
  projects: Project[];
  media: Partial<Record<string, ProjectMedia>>;
}) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    if (projects.length < 2) return;

    const id = window.setInterval(
      () => setActive((current) => (current + 1) % projects.length),
      INTERVAL
    );
    return () => window.clearInterval(id);
    /* `.length`, not the array: the parent builds a fresh array on every
       render, so depending on its identity would clear and restart the
       interval each time and the deck would never advance. */
  }, [reduceMotion, active, projects.length]);

  /* `active` can point past the end after a project is unpublished and the
     list re-renders shorter. */
  const safeActive = active < projects.length ? active : 0;

  return (
    <div>
      <div className="mb-12 flex items-center justify-between">
        <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-muted-foreground uppercase">
          Recent outcomes
        </p>
        <p className="font-mono text-[0.6875rem] text-muted-foreground">
          {projects.length} featured
        </p>
      </div>

      <div className="relative aspect-[16/12] w-full sm:aspect-[16/10]">
        {projects.map((project, index) => {
          const position = (index - safeActive + projects.length) % projects.length;
          const style = layout[Math.min(position, layout.length - 1)];
          const isFront = position === 0;

          return (
            <motion.article
              key={project.slug}
              aria-hidden={!isFront}
              className="absolute inset-0 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_70px_-40px_rgba(0,0,0,0.85)]"
              animate={style}
              transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "bottom center" }}
            >
              <Link
                href={`/work/${project.slug}`}
                tabIndex={isFront ? 0 : -1}
                className="group/card flex h-full flex-col outline-none"
              >
                <div className="relative flex-1 overflow-hidden">
                  <WorkMedia
                    media={media[project.slug]}
                    variant={project.preview}
                    className="h-full"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(to_top,var(--card),transparent)]"
                  />
                  <span className="absolute bottom-3 left-5 rounded-full border border-border/80 bg-background/70 px-2.5 py-1 font-mono text-[0.625rem] tracking-[0.14em] text-foreground/80 uppercase backdrop-blur-md">
                    {project.category}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 px-5 pt-1 pb-5">
                  <div className="min-w-0">
                    <p className="truncate font-heading text-lg font-semibold tracking-tight text-foreground">
                      {project.name}
                    </p>
                    <p className="mt-1 flex min-w-0 items-center gap-2 text-sm font-medium text-primary">
                      <MetricDot />
                      <span className="truncate">{project.status}</span>
                    </p>
                  </div>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-all duration-300 group-hover/card:border-primary/50 group-hover/card:text-foreground">
                    <ArrowUpRightIcon className="size-4" />
                  </span>
                </div>
              </Link>
            </motion.article>
          );
        })}
      </div>

      {/* Deal a specific card. */}
      <div className="mt-5 flex items-center gap-2">
        {projects.map((project, index) => (
          <button
            key={project.slug}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Show ${project.name}`}
            aria-pressed={index === safeActive}
            className="h-1 flex-1 overflow-hidden rounded-full bg-border transition-colors"
          >
            <span
              className={
                index === safeActive
                  ? "block h-full w-full rounded-full bg-[linear-gradient(to_right,var(--brand-primary),var(--brand-violet))]"
                  : "block h-full w-0"
              }
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export { WorkHeroDeck };
