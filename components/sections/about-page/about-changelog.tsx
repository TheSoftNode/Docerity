"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils";
import type { SectionHeading } from "@/lib/content/blocks/source";
import type { ExperienceView } from "@/lib/content/blocks/views";
import {
  FILTERS,
  filterCounts,
  isCurrent,
  matchesFilter,
  notesLabel,
  type ExperienceFilter,
} from "@/components/sections/about-page/about-content";

/**
 * Experience as a changelog: every role a release, newest first, each one
 * opening to its notes. A filter narrows it to the current roles or the
 * earlier ones. Several can be open at once, since comparing two is the
 * point. The first is open, so the section never lands looking closed.
 */
function AboutChangelog({ heading, experience }: { heading: SectionHeading; experience: ExperienceView[] }) {
  const id = useId();
  const [filter, setFilter] = useState<ExperienceFilter>("all");
  const [open, setOpen] = useState<number[]>([0]);
  const counts = filterCounts(experience);
  if (experience.length === 0) return null;

  const toggle = (index: number) =>
    setOpen((current) => (current.includes(index) ? current.filter((value) => value !== index) : [...current, index]));

  return (
    <section id="changelog" aria-labelledby="changelog-title" className="scroll-mt-24 bg-white text-[var(--ld-ink)]">
      <div className="doc-shell py-[clamp(64px,8vw,112px)]">
        <div className="flex flex-wrap items-end justify-between gap-[22px]">
          <div>
            <p className="mb-3.5 flex flex-wrap items-center gap-2.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">
              {heading.eyebrow}
            </p>
            <h2 id="changelog-title" className="ld-display max-w-[14ch] text-[clamp(36px,4.8vw,66px)] leading-[0.95] font-extrabold tracking-[-0.045em] text-balance">
              {heading.title}
            </h2>
            {heading.lede ? <p className="mt-4 max-w-[30rem] text-[17px] leading-relaxed text-[var(--ld-text-2)]">{heading.lede}</p> : null}
          </div>
          <div role="group" aria-label="Show roles" className="flex gap-1.5 rounded-[14px] bg-[#eef1f8] p-[5px]">
            {FILTERS.map((option) => {
              const on = option.value === filter;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(option.value)}
                  className={cn(
                    "min-h-[38px] rounded-[10px] px-3.5 text-sm font-semibold outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)]",
                    on ? "bg-[var(--ld-ink)] text-[var(--ld-paper)]" : "text-[var(--ld-ink)] hover:bg-white"
                  )}
                >
                  {option.label} <span className="font-mono text-xs opacity-55">{counts[option.value]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <ol className="mt-[clamp(40px,5vw,64px)]">
          {experience.map((entry, index) => {
            if (!matchesFilter(entry.period, filter)) return null;
            const current = isCurrent(entry.period);
            const expanded = open.includes(index);
            return (
              <li key={`${entry.org}-${entry.role}`} className="grid grid-cols-[22px_minmax(0,1fr)] gap-x-[18px] md:grid-cols-[170px_30px_minmax(0,1fr)]">
                <div className="col-start-2 pt-[18px] md:col-start-1 md:py-[26px] md:text-right">
                  <span className="block font-mono text-[13px]">{entry.period}</span>
                  {current ? (
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--ld-line)] px-2 py-0.5 font-mono text-[10.5px] text-[var(--ld-text-muted)] uppercase">
                      <span aria-hidden="true" className="size-1.5 rounded-full bg-[var(--ld-accent)]" />
                      Current
                    </span>
                  ) : null}
                </div>
                <div aria-hidden="true" className="relative col-start-1 row-span-2 row-start-1 flex justify-center md:col-start-2 md:row-span-1">
                  <span className="absolute inset-y-0 w-0.5 bg-[#e4e7f0]" />
                  <span
                    className={cn(
                      "relative mt-[22px] size-3.5 rounded-full border-[3px] bg-white md:mt-[30px]",
                      current ? "border-[var(--ld-accent)]" : "border-[var(--ld-deep)]"
                    )}
                  />
                </div>
                <div className="col-start-2 border-b border-[#eef1f8] py-3 md:col-start-3 md:py-5">
                  <h3>
                    <button
                      type="button"
                      id={`${id}-r-${index}`}
                      aria-expanded={expanded}
                      aria-controls={`${id}-n-${index}`}
                      onClick={() => toggle(index)}
                      className="group flex w-full items-start justify-between gap-[18px] rounded-lg py-1.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)]"
                    >
                      <span>
                        <span className="ld-display block text-[clamp(21px,2vw,27px)] font-bold tracking-[-0.02em] transition-colors group-hover:text-[var(--ld-deep)]">
                          {entry.role}
                        </span>
                        <span className="mt-1 block text-[15px] font-semibold text-[var(--ld-deep)]">{entry.org}</span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "mt-1 inline-flex flex-none items-center gap-2 rounded-[10px] px-3 py-[7px] font-mono text-xs transition-colors duration-300",
                          expanded ? "bg-[var(--ld-ink)] text-[var(--ld-paper)]" : "bg-[#eef1f8] text-[var(--ld-ink)]"
                        )}
                      >
                        {notesLabel(entry.points.length)}
                        <span className={cn("inline-block transition-transform duration-300", expanded && "rotate-180")}>↓</span>
                      </span>
                    </button>
                  </h3>
                  <p className="mt-2 max-w-[44rem] text-[15.5px] leading-normal text-[var(--ld-text-2)]">{entry.summary}</p>
                  <div
                    id={`${id}-n-${index}`}
                    role="region"
                    aria-labelledby={`${id}-r-${index}`}
                    className={cn(
                      "grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none",
                      expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="overflow-hidden" inert={!expanded}>
                      <ul className="mt-3.5 mb-1.5 grid max-w-[52rem] gap-[9px]">
                        {entry.points.map((point) => (
                          <li key={point} className="grid grid-cols-[22px_minmax(0,1fr)] gap-2 text-[15px] leading-normal text-[var(--ld-text-2)]">
                            <span aria-hidden="true" className="font-mono text-[#2f9e6b]">
                              +
                            </span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export { AboutChangelog };
