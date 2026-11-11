"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Project, ProjectMedia } from "@/components/sections/work/work-data";
import { ProjectMediaFill } from "@/components/sections/work/project-media-fill";

/** How many projects the phone rail carries before handing over to /projects. */
const RAIL_LIMIT = 6;

/**
 * The featured projects on a phone: a row of cards you swipe through.
 *
 * Each card is complete on its own (picture, name, one line, one button), so
 * nothing changes anywhere else when it is touched. It never moves by itself,
 * and the dots under it only report where the row is.
 */
function WorkRail({ projects, media }: { projects: Project[]; media: Partial<Record<string, ProjectMedia>> }) {
  const rail = useRef<HTMLUListElement>(null);
  const [at, setAt] = useState(0);
  const shown = projects.slice(0, RAIL_LIMIT);
  if (shown.length === 0) return null;

  function onScroll() {
    const node = rail.current;
    const first = node?.firstElementChild as HTMLElement | null;
    if (!node || !first) return;
    const width = first.offsetWidth + 12;
    setAt(Math.min(shown.length, Math.round(node.scrollLeft / width)));
  }

  return (
    <div>
      <ul
        ref={rail}
        onScroll={onScroll}
        aria-label="Featured projects"
        className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {shown.map((project) => (
          <li
            key={project.slug}
            className="w-[82%] max-w-[340px] shrink-0 snap-start overflow-hidden rounded-[22px] border border-[rgb(var(--ld-tint-rgb)/0.16)] bg-[var(--ld-ink-2)]"
          >
            <Link href={`/projects/${project.slug}`} className="block">
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--ld-ink)]">
                <ProjectMediaFill project={project} media={media[project.slug]} reduceMotion sizes="85vw" tour="hover" compact />
              </div>
              <div className="p-5">
                <h3 className="ld-display text-[24px] font-extrabold tracking-[-0.03em]">{project.name}</h3>
                <p className="mt-1.5 line-clamp-2 text-[15px] leading-normal text-[var(--ld-muted)]">{project.description}</p>
                <span className="mt-4 inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[var(--ld-tint)] px-4 text-sm font-semibold text-[var(--ld-ink)]">
                  See the project <ArrowRightIcon className="size-3.5" />
                </span>
              </div>
            </Link>
          </li>
        ))}
        <li className="flex w-[60%] max-w-[240px] shrink-0 snap-start">
          <Link
            href="/projects"
            className="flex w-full flex-col justify-end rounded-[22px] bg-[var(--ld-accent)] p-5 text-[var(--ld-ink)]"
          >
            <span className="ld-display text-[30px] leading-none font-extrabold tracking-[-0.04em]">See every project</span>
            <span className="mt-4 grid size-11 place-items-center rounded-full bg-[var(--ld-ink)] text-[var(--ld-paper)]">
              <ArrowRightIcon className="size-4" />
            </span>
          </Link>
        </li>
      </ul>

      <div aria-hidden="true" className="mt-5 flex justify-center gap-1.5">
        {[...shown, null].map((_, index) => (
          <span
            key={index}
            className={cn(
              "h-[7px] rounded-full transition-all duration-300",
              index === at ? "w-[22px] bg-[var(--ld-accent)]" : "w-[7px] bg-[rgb(var(--ld-paper-rgb)/0.25)]"
            )}
          />
        ))}
      </div>
    </div>
  );
}

export { WorkRail };
