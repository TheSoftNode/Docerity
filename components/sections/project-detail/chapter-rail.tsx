"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { pad } from "@/components/sections/project-detail/project-detail-content";

export type Chapter = { id: string; heading: string };

/**
 * The write-up's contents, which follow the reader.
 *
 * Whichever chapter crosses the upper third of the viewport is current: it
 * gets `aria-current`, the accent and a full bar, and the bars before it stay
 * filled so the rail doubles as progress. The links are ordinary anchors, so
 * the rail works before hydration and without JavaScript; tracking is an
 * enhancement on top.
 */
function ChapterRail({ chapters }: { chapters: Chapter[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const targets = chapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter((element): element is HTMLElement => element !== null);
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setCurrent(targets.indexOf(entry.target as HTMLElement));
        }
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [chapters]);

  return (
    <nav aria-label="Chapters" className="flex flex-row flex-wrap gap-x-5 gap-y-2 lg:flex-col lg:gap-1">
      {chapters.map((chapter, index) => {
        const active = index === current;
        return (
          <a
            key={chapter.id}
            href={`#${chapter.id}`}
            aria-current={active ? "location" : undefined}
            onClick={() => setCurrent(index)}
            className={cn(
              "block py-2 transition-colors lg:py-3",
              active ? "text-[var(--ld-ink)]" : "text-[var(--ld-text-muted)] hover:text-[var(--ld-ink)]"
            )}
          >
            <span className="flex gap-3 text-[15px] leading-snug font-medium">
              <span
                className={cn(
                  "pt-0.5 font-mono text-xs",
                  active ? "text-[var(--ld-accent)]" : "text-[var(--ld-muted-3)]"
                )}
              >
                {pad(index + 1)}
              </span>
              {chapter.heading}
            </span>
            <span
              aria-hidden="true"
              className={cn(
                "mt-3 hidden h-0.5 origin-left rounded-full transition-[transform,background-color] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] lg:block",
                active ? "bg-[var(--ld-accent)]" : "bg-[var(--ld-line)]",
                index <= current ? "scale-x-100" : "scale-x-25"
              )}
            />
          </a>
        );
      })}
    </nav>
  );
}

export { ChapterRail };
