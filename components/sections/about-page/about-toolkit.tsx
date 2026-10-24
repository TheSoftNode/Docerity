"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import type { SectionHeading } from "@/lib/content/blocks/source";
import type { SkillGroupView, ToolView } from "@/lib/content/blocks/views";
import { slugOf } from "@/components/sections/about-page/about-content";

/**
 * The toolkit as a terminal: pick a part of the system and the stack for it
 * prints, line by line. The day-to-day tools run along the bottom as their
 * marks, and the band holds still under the pointer so a name can be read.
 */
function AboutToolkit({ heading, groups, tools }: { heading: SectionHeading; groups: SkillGroupView[]; tools: ToolView[] }) {
  const [active, setActive] = useState(0);
  const group = groups[active];
  if (!group) return null;

  return (
    <section id="toolkit" aria-labelledby="toolkit-title" className="scroll-mt-24 bg-[#eef1f8] text-[var(--ld-ink)]">
      <div className="doc-shell grid items-center gap-[clamp(32px,5vw,80px)] py-[clamp(64px,8vw,112px)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <p className="mb-3.5 flex flex-wrap items-center gap-2.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">
            <span className="rounded-full bg-[#dfe6fb] px-2.5 py-1 text-[var(--ld-deep)]">Stack</span>
            {heading.eyebrow}
          </p>
          <h2 id="toolkit-title" className="ld-display max-w-[12ch] text-[clamp(36px,4.8vw,66px)] leading-[0.95] font-extrabold tracking-[-0.045em] text-balance">
            {heading.title}
          </h2>
          {heading.lede ? <p className="mt-5 max-w-[26rem] text-[17px] leading-relaxed text-[var(--ld-text-2)]">{heading.lede}</p> : null}
          <div role="group" aria-label="Part of the system" className="mt-7 flex flex-wrap gap-2">
            {groups.map((option, index) => {
              const on = index === active;
              return (
                <button
                  key={option.title}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setActive(index)}
                  className={cn(
                    "min-h-10 rounded-xl border px-3.5 text-sm font-semibold outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)] focus-visible:ring-offset-2",
                    on
                      ? "border-[var(--ld-ink)] bg-[var(--ld-ink)] text-[var(--ld-paper)]"
                      : "border-[var(--ld-line)] bg-white text-[var(--ld-ink)] hover:border-[var(--ld-ink)]"
                  )}
                >
                  {option.title}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-3xl bg-[var(--ld-ink)] text-[var(--ld-paper)] shadow-[0_50px_90px_-60px_rgb(var(--ld-ink-rgb)/0.75)]">
          <div className="flex items-center justify-between border-b border-[rgb(var(--ld-tint-rgb)/0.12)] px-5 py-3.5 font-mono text-xs text-[var(--ld-muted-3)]">
            <span>~/docerity</span>
            <span>{group.items.length} packages</span>
          </div>
          {/* Keyed by the group, so choosing another prints it afresh. */}
          <div key={group.title} aria-live="polite" className="min-h-[400px] px-[clamp(18px,2.6vw,32px)] pt-6 pb-[30px] font-mono text-[clamp(13px,1.1vw,15px)] leading-[1.9]">
            <p>
              <span aria-hidden="true" className="text-[var(--ld-accent)]">
                ${" "}
              </span>
              docerity stack --for <span className="text-[#8de3b6]">{slugOf(group.title)}</span>
            </p>
            <p aria-hidden="true" className="mb-2 text-[var(--ld-muted-3)]">
              resolving {group.items.length} packages…
            </p>
            <ul aria-label={`${group.title} stack`}>
              {group.items.map((item, index) => (
                <li
                  key={item}
                  className="ld-log-line grid grid-cols-[22px_minmax(0,1fr)_auto] gap-2.5"
                  style={{ animationDelay: `${0.15 + index * 0.07}s` }}
                >
                  <span aria-hidden="true" className="text-[#8de3b6]">
                    ✓
                  </span>
                  <span className="min-w-0 truncate">{item}</span>
                  <span aria-hidden="true" className="hidden text-[var(--ld-muted-3)] sm:inline">
                    in production
                  </span>
                </li>
              ))}
            </ul>
            <p aria-hidden="true" className="mt-2.5">
              <span className="text-[var(--ld-accent)]">$</span>{" "}
              <span className="ld-blink inline-block h-[1.05em] w-[9px] translate-y-[3px] bg-[var(--ld-tint)]" />
            </p>
          </div>

          {tools.length > 0 ? (
            <div className="overflow-hidden border-t border-[rgb(var(--ld-tint-rgb)/0.12)] py-3.5">
              <div className="ld-marquee flex w-max gap-2.5">
                {[0, 1].map((copy) => (
                  <ul key={copy} aria-label={copy === 0 ? "Day to day" : undefined} aria-hidden={copy === 1 || undefined} className="flex gap-2.5">
                    {tools.map((tool) => (
                      <li key={tool.name} className="inline-flex items-center gap-2 rounded-[10px] bg-[rgb(var(--ld-paper-rgb)/0.06)] px-3 py-[7px] text-[13px] text-[var(--ld-muted)]">
                        <span className="grid size-[22px] place-items-center rounded-md bg-white/90 p-[3px]">
                          <Image src={tool.src} alt="" width={16} height={16} className="size-4 object-contain" />
                        </span>
                        {tool.name}
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export { AboutToolkit };
