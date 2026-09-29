"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Container } from "@/components/shared/container";
import { Bloom, Eyebrow, Lede, SectionTitle } from "@/components/shared/section-kit";
import { WorkCard } from "@/components/sections/work/work-card";
import type { Project, ProjectMedia } from "@/components/sections/work/work-data";
import type { SectionHeading } from "@/lib/content/blocks/source";

/* Exported so the filter test can name the chip without typing the label,
   which is how renaming the section broke a test about counts. */
export const ALL_FILTER = "All projects";

/*
  Filtered rather than one undifferentiated wall of 25.

  A visitor arrives with a question ("have you shipped AI?", "do you actually
  do Web3?") and a flat grid makes them scan every card to answer it. The
  buckets come from the projects themselves, so adding a project with a new
  group adds its filter without touching this file.
*/
function WorkShowcase({
  projects,
  media,
  heading,
}: {
  /* Read by the page: this component filters and animates, so it runs in the
     browser and cannot read the content source itself. */
  heading: SectionHeading;
  /* Passed down rather than imported: the content source is `server-only`,
     and this filters client-side on every keystroke of the group buttons. */
  projects: Project[];
  media: Partial<Record<string, ProjectMedia>>;
}) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(ALL_FILTER);

  const groups = useMemo(() => {
    const counts = new Map<string, number>();
    for (const project of projects) {
      for (const group of project.groups) {
        counts.set(group, (counts.get(group) ?? 0) + 1);
      }
    }
    /* Busiest first, so the filters read as a summary of the work rather than
       an alphabetical list where a one-project bucket leads. */
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [projects]);

  const shown = useMemo(
    () =>
      active === ALL_FILTER
        ? projects
        : projects.filter((project) => project.groups.includes(active)),
    [active, projects]
  );

  return (
    <section
      id="showcase"
      className="relative scroll-mt-[var(--nav-h)] overflow-hidden border-b border-border/80 bg-surface-raised py-16 sm:py-20 lg:py-24"
    >
      <Bloom tone="violet" className="top-0 left-0 -translate-x-1/3 -translate-y-1/3" />

      <Container className="relative">
        <div className="max-w-2xl">
          <Eyebrow>{heading.eyebrow}</Eyebrow>
          <SectionTitle>{heading.title}</SectionTitle>
          {heading.lede ? <Lede className="mt-5">{heading.lede}</Lede> : null}
        </div>

        {/* `role="tablist"` would promise arrow-key navigation between tabs;
            these are buttons that filter a list, which is what they behave
            like, so they are described rather than mislabelled. */}
        <div
          className="mt-8 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter projects by category"
        >
          {[[ALL_FILTER, projects.length] as const, ...groups].map(([group, count]) => {
            const isActive = group === active;
            return (
              <button
                key={group}
                type="button"
                onClick={() => setActive(group)}
                aria-pressed={isActive}
                className={
                  "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 " +
                  (isActive
                    ? "border-primary/60 bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground")
                }
              >
                {group}
                <span
                  className={
                    "font-mono text-[0.6875rem] " +
                    (isActive ? "text-primary" : "text-muted-foreground/70")
                  }
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3 lg:gap-6">
          {/* `popLayout` so the remaining cards close the gap as others leave,
              instead of the grid jumping to its new shape in one frame. */}
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((project, index) => (
              <motion.div
                key={project.slug}
                layout={!reduceMotion}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
              >
                <WorkCard project={project} index={index} media={media[project.slug]} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}

export { WorkShowcase };
