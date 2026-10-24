"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { REVIEW_BEAT_MS, REVIEW_BEATS } from "@/components/sections/mentorship-page/mentorship-content";

const TONES = {
  neutral: "bg-[rgb(var(--ld-tint-rgb)/0.16)] text-[var(--ld-tint)]",
  warning: "bg-[rgb(255_201_74/0.16)] text-[#FFC94A]",
  success: "bg-[rgb(84_214_150/0.16)] text-[#8de3b6]",
};

const WEEK_ICONS = ["▶", "✎", "◇", "✉"];

/**
 * A code review playing out in four beats: requested, changes asked for, the
 * fix, approved. Beside it, the week it sits in, with the parts of the format
 * the current beat belongs to lit.
 *
 * Decoration that demonstrates rather than content, so it is hidden from
 * assistive technology; the format is described in words further down. It
 * advances only while the tab is visible and holds on the approved beat under
 * reduced motion.
 */
function ReviewWindow({ week }: { week: string[] }) {
  const reduceMotion = useReducedMotion() ?? false;
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") setBeat((value) => (value + 1) % REVIEW_BEATS.length);
    }, REVIEW_BEAT_MS);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const current = REVIEW_BEATS[reduceMotion ? REVIEW_BEATS.length - 1 : beat];
  /* The review item is what every beat is about; approval also moves the plan. */
  const lit = new Set(current.tone === "success" ? [1, 2] : [1]);

  return (
    <div aria-hidden="true" className="group relative mt-[clamp(48px,6vw,84px)] [perspective:2200px]">
      <div className="ld-floor-rise relative mx-auto max-w-[1120px]">
        <div className="overflow-hidden rounded-t-3xl border border-b-0 border-[rgb(var(--ld-tint-rgb)/0.22)] bg-[var(--ld-panel)] shadow-[0_-30px_90px_-30px_rgb(64_110_230/0.55)]">
          <div className="flex items-center gap-2.5 border-b border-[rgb(var(--ld-tint-rgb)/0.12)] bg-[var(--ld-ink-2)] px-[18px] py-3.5">
            {[0, 1, 2].map((dot) => (
              <span key={dot} className="size-2.5 rounded-full bg-[rgb(var(--ld-tint-rgb)/0.3)]" />
            ))}
            <span
              className={cn(
                "ml-2.5 rounded-full px-2.5 py-1 font-mono text-[11px] tracking-[0.06em] uppercase transition-colors duration-500",
                TONES[current.tone]
              )}
            >
              {current.status}
              {current.tone === "success" ? " ✓" : ""}
            </span>
            <span className="hidden font-mono text-[12.5px] text-[var(--ld-muted)] sm:inline">orders/page.tsx</span>
            <span className="ml-auto font-mono text-[11px] text-[var(--ld-muted-3)] uppercase">{current.week}</span>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-h-[290px] py-4 pb-6 font-mono text-[clamp(12px,1.05vw,14.5px)] leading-loose">
              {current.lines.map((line, index) => (
                <div key={`${beat}-${index}`}>
                  <div
                    className={cn(
                      "flex gap-3.5 px-[18px] transition-colors duration-500",
                      line.change === "removed" && "bg-[rgb(255_107_61/0.1)]",
                      line.change === "added" && "bg-[rgb(84_214_150/0.1)]"
                    )}
                  >
                    <span className="w-[18px] text-right text-[rgb(125_142_192/0.6)]">{index + 1}</span>
                    <span
                      className={cn(
                        "w-2.5",
                        line.change === "removed" ? "text-[#ff9b7d]" : line.change === "added" ? "text-[#8de3b6]" : ""
                      )}
                    >
                      {line.change === "removed" ? "-" : line.change === "added" ? "+" : " "}
                    </span>
                    <span
                      className={cn(
                        "truncate whitespace-pre",
                        line.change === "removed" ? "text-[#ffc2b0]" : line.change === "added" ? "text-[#bdf2d6]" : "text-[var(--ld-muted)]"
                      )}
                    >
                      {line.code}
                    </span>
                  </div>
                  {line.note ? (
                    <div
                      className={cn(
                        "ld-pop mx-[18px] mt-2 mb-2.5 ml-[60px] rounded-[14px] border bg-[#13296b] px-3.5 py-3 font-sans text-[13.5px] leading-normal text-[var(--ld-muted)]",
                        line.note.state === "open" ? "border-[rgb(255_201_74/0.45)]" : "border-[rgb(84_214_150/0.45)]"
                      )}
                    >
                      <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-[var(--ld-paper)]">
                        <span className="grid size-[22px] place-items-center rounded-[7px] bg-[var(--ld-ink)] shadow-[inset_0_0_0_1px_rgb(var(--ld-accent-rgb)/0.7)]">
                          <Image src="/brand/logo-sapphire.png" alt="" width={15} height={15} className="size-[15px] object-contain" />
                        </span>
                        Docerity reviewer
                        <span
                          className={cn(
                            "ml-auto font-mono text-[11px] font-normal uppercase",
                            line.note.state === "open" ? "text-[#FFC94A]" : "text-[#8de3b6]"
                          )}
                        >
                          {line.note.state}
                        </span>
                      </span>
                      {line.note.text}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="hidden flex-col gap-3 border-l border-[rgb(var(--ld-tint-rgb)/0.1)] bg-[rgb(13_26_69/0.55)] p-[18px] lg:flex">
              <span className="font-mono text-[11px] tracking-[0.08em] text-[var(--ld-muted-3)] uppercase">This week</span>
              {week.map((item, index) => (
                <div
                  key={item}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors duration-500",
                    lit.has(index)
                      ? "border-[rgb(var(--ld-tint-rgb)/0.35)] bg-[rgb(var(--ld-tint-rgb)/0.12)]"
                      : "border-[rgb(var(--ld-tint-rgb)/0.1)]"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-[26px] shrink-0 place-items-center rounded-lg text-xs transition-colors duration-500",
                      lit.has(index) ? "bg-[var(--ld-tint)] text-[var(--ld-ink)]" : "bg-[rgb(var(--ld-tint-rgb)/0.12)] text-[var(--ld-tint)]"
                    )}
                  >
                    {WEEK_ICONS[index] ?? "•"}
                  </span>
                  <span className="text-[13.5px] leading-tight font-semibold text-[var(--ld-paper)]">{item}</span>
                </div>
              ))}
              <div className="mt-auto flex items-center gap-2.5">
                <span className="h-[3px] flex-1 overflow-hidden rounded-full bg-[rgb(var(--ld-tint-rgb)/0.14)]">
                  <span
                    className="block h-full bg-[var(--ld-tint)] transition-[width] duration-700 ease-[cubic-bezier(.2,.7,.2,1)]"
                    style={{ width: `${Math.round(current.progress * 100)}%` }}
                  />
                </span>
                <span className="font-mono text-[11px] text-[var(--ld-muted-3)]">{current.tone === "success" ? "STAGE 2" : "STAGE 1"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <span className="ld-float absolute top-[18%] left-[max(0px,calc(50%-640px))] hidden items-center gap-2.5 rounded-[14px] bg-[rgb(var(--ld-paper-rgb)/0.96)] px-4 py-3 text-[13.5px] font-semibold text-[var(--ld-ink)] shadow-[0_30px_60px_-24px_rgb(0_0_0/0.6)] xl:inline-flex">
        <span className="grid size-[26px] place-items-center rounded-lg bg-[var(--ld-ink)] text-xs text-[var(--ld-tint)]">✓</span>
        Feedback before the call
      </span>
    </div>
  );
}

export { ReviewWindow };
