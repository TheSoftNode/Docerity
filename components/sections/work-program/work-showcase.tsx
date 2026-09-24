"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Container } from "@/components/shared/container";
import { Bloom, Eyebrow, Lede, SectionTitle } from "@/components/shared/section-kit";
import { WorkCard } from "@/components/sections/work/work-card";
import { projects } from "@/components/sections/work/work-data";

const ALL = "All work";

/*
  Filtered rather than one undifferentiated wall of 25.

  A visitor arrives with a question — "have you shipped AI?", "do you actually
  do Web3?" — and a flat grid makes them scan every card to answer it. The
  buckets come from the projects themselves, so adding a project with a new
  group adds its filter without touching this file.
*/
function WorkShowcase() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(ALL);

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
  }, []);

  const shown = useMemo(
    () =>
      active === ALL
        ? projects
        : projects.filter((project) => project.groups.includes(active)),
    [active]
  );

  return (
    <section
      id="showcase"
      className="relative scroll-mt-[var(--nav-h)] overflow-hidden border-b border-border/80 bg-surface-raised py-16 sm:py-20 lg:py-24"
    >
      <Bloom tone="violet" className="top-0 left-0 -translate-x-1/3 -translate-y-1/3" />

      <Container className="relative">
        <div className="max-w-2xl">
          <Eyebrow>Selected work</Eyebrow>
          <SectionTitle>Everything shipped, and where it runs.</SectionTitle>
          <Lede className="mt-5">
            {projects.length} projects, every one of them live or in active
            build. Filter by what you came to see.
          </Lede>
        </div>

        {/* `role="tablist"` would promise arrow-key navigation between tabs;
            these are buttons that filter a list, which is what they behave
            like, so they are described rather than mislabelled. */}
        <div
          className="mt-8 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter projects by category"
        >
          {[[ALL, projects.length] as const, ...groups].map(([group, count]) => {
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
                <WorkCard project={project} index={index} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}

export { WorkShowcase };
