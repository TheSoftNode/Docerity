"use client";

import { useEffect, useRef, useState } from "react";

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
  const strip = useRef<HTMLDivElement>(null);

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

  /* On a phone the chapters are a sideways strip; keep the current one in
     view by scrolling the strip itself, never the page. */
  useEffect(() => {
    const box = strip.current;
    const chip = box?.querySelector<HTMLElement>(`[data-chapter="${current}"]`);
    if (!box || !chip || box.scrollWidth <= box.clientWidth) return;
    box.scrollTo({ left: chip.offsetLeft - 16, behavior: "smooth" });
  }, [current]);

  return (
    <nav aria-label="Chapters">
      {/* Phones and tablets: a strip that stays under the header while reading. */}
      <div
        ref={strip}
        className="-mx-5 flex gap-1.5 overflow-x-auto px-5 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:hidden [&::-webkit-scrollbar]:hidden"
      >
        {chapters.map((chapter, index) => {
          const active = index === current;
          return (
            <a
              key={chapter.id}
              href={`#${chapter.id}`}
              data-chapter={index}
              aria-current={active ? "location" : undefined}
              onClick={() => setCurrent(index)}
              className={cn(
                "inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full px-3.5 text-[13.5px] font-medium whitespace-nowrap transition-colors",
                active ? "bg-[var(--ld-ink)] text-[var(--ld-paper)]" : "bg-[var(--ld-card)] text-[var(--ld-text-2)] ring-1 ring-[rgb(8_16_46/0.08)]"
              )}
            >
              <span className={cn("text-[12px] tabular-nums", active ? "text-[var(--ld-accent)]" : "text-[var(--ld-muted-3)]")}>{pad(index + 1)}</span>
              {chapter.heading}
            </a>
          );
        })}
      </div>

      {/* Desktop: the contents rail beside the text, doubling as progress. */}
      <div className="hidden flex-col gap-1 lg:flex">
        {chapters.map((chapter, index) => {
          const active = index === current;
          return (
            <a
              key={chapter.id}
              href={`#${chapter.id}`}
              aria-current={active ? "location" : undefined}
              onClick={() => setCurrent(index)}
              className={cn("block py-2.5 transition-colors", active ? "text-[var(--ld-ink)]" : "text-[var(--ld-text-muted)] hover:text-[var(--ld-ink)]")}
            >
              <span className="flex gap-3 text-[14.5px] leading-snug font-medium">
                <span className={cn("pt-0.5 text-[12px] tabular-nums", active ? "text-[var(--ld-accent)]" : "text-[var(--ld-muted-3)]")}>{pad(index + 1)}</span>
                {chapter.heading}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "mt-2.5 block h-0.5 origin-left rounded-full transition-[transform,background-color] duration-500 ease-[cubic-bezier(.2,.7,.2,1)]",
                  active ? "bg-[var(--ld-accent)]" : "bg-[var(--ld-line)]",
                  index <= current ? "scale-x-100" : "scale-x-25"
                )}
              />
            </a>
          );
        })}
      </div>
    </nav>
  );
}

export { ChapterRail };
