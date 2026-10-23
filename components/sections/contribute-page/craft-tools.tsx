"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils";
import type { PairView } from "@/lib/content/blocks/views";
import { maxIdeas, readTimeFor, rungFor, type Size } from "@/components/sections/contribute-page/contribute-content";

const VERDICT = {
  right: { label: "✓ Right size", tone: "bg-[#dfe6fb] text-[var(--ld-deep)]", fill: "bg-[var(--ld-deep)]" },
  wide: { label: "Getting wide", tone: "bg-[#eef1f8] text-[var(--ld-text-muted)]", fill: "bg-[#7f98e0]" },
  too: { label: "✕ Too wide", tone: "bg-[#eef1f8] text-[var(--ld-text-muted)]", fill: "bg-[#9aa0b1]" },
} as const;

/**
 * The two things the craft section lets somebody try: pick a concept and see
 * the everyday thing it is paired with, and slide how much a piece covers to
 * see the topic grow from the right size to a textbook chapter.
 */
function CraftTools({ pairs, sizes }: { pairs: PairView[]; sizes: Size[] }) {
  const id = useId();
  const [picked, setPicked] = useState(0);
  const [ideas, setIdeas] = useState(1);
  const pair = pairs[picked];
  const most = maxIdeas(sizes);
  const rung = rungFor(sizes, ideas);
  const verdict = rung ? VERDICT[rung.verdict] : null;

  return (
    <div className="grid gap-4">
      {pair ? (
        <div className="rounded-3xl bg-[#eef1f8] p-5">
          <p className="mb-3 font-mono text-[11.5px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">Pick a concept · see its pair</p>
          <div role="group" aria-label="Concepts" className="flex flex-wrap gap-1.5">
            {pairs.map((option, index) => {
              const on = index === picked;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPicked(index)}
                  className={cn(
                    "min-h-9 rounded-[10px] border px-3 text-[13.5px] font-semibold outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)]",
                    on ? "border-[var(--ld-ink)] bg-[var(--ld-ink)] text-[var(--ld-paper)]" : "border-[var(--ld-line)] bg-white hover:border-[var(--ld-ink)]"
                  )}
                >
                  {option.conceptLabel}
                </button>
              );
            })}
          </div>
          <div key={pair.id} aria-live="polite" className="ld-pop mt-4 grid items-stretch gap-1.5 sm:grid-cols-[minmax(0,1fr)_54px_minmax(0,1fr)] sm:gap-0">
            <div className="rounded-[18px] bg-[var(--ld-ink)] p-[18px] text-[var(--ld-paper)]">
              <span className="font-mono text-[11px] text-[var(--ld-muted-3)] uppercase">The concept</span>
              <span className="ld-display mt-2.5 block text-[26px] font-extrabold tracking-[-0.03em]">{pair.conceptLabel}</span>
              <span className="mt-1.5 block text-sm text-[var(--ld-muted)]">{pair.conceptCaption}</span>
            </div>
            <div aria-hidden="true" className="ld-display grid place-items-center py-1 text-[30px] font-extrabold text-[var(--ld-deep)]">
              ≈
            </div>
            <div className="rounded-[18px] border border-[var(--ld-line)] bg-white p-[18px]">
              <span className="font-mono text-[11px] text-[var(--ld-text-muted)] uppercase">Works like</span>
              <span className="ld-display mt-2.5 block text-2xl leading-[1.05] font-extrabold tracking-[-0.03em]">{pair.analogyLabel}</span>
              <span className="mt-1.5 block text-sm text-[var(--ld-text-muted)]">{pair.analogyCaption}</span>
            </div>
          </div>
        </div>
      ) : null}

      {rung && verdict ? (
        <div className="rounded-3xl border border-[var(--ld-line)] bg-white px-[22px] pt-5 pb-[22px]">
          <div className="flex flex-wrap items-baseline justify-between gap-2.5">
            <label htmlFor={`${id}-ideas`} className="font-mono text-[11.5px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">
              How much are you covering?
            </label>
            <span className={cn("rounded-full px-2.5 py-1 font-mono text-[11px] tracking-[0.06em] uppercase transition-colors duration-300", verdict.tone)}>
              {verdict.label}
            </span>
          </div>
          <div aria-live="polite">
            <p
              className={cn(
                "ld-display mt-3.5 min-h-[2.3em] text-[clamp(24px,2.4vw,32px)] leading-[1.1] font-extrabold tracking-[-0.03em] transition-colors duration-300",
                rung.verdict === "right" ? "text-[var(--ld-ink)]" : "text-[var(--ld-text-muted)]"
              )}
            >
              {rung.topic}
            </p>
            <p className="mt-1.5 text-[14.5px] text-[var(--ld-text-muted)]">{rung.why}</p>
          </div>

          {/* A real range input over the bars: the bars are the picture of it. */}
          <div className="relative mt-[18px]">
            <input
              id={`${id}-ideas`}
              type="range"
              min={1}
              max={most}
              step={1}
              value={ideas}
              onChange={(event) => setIdeas(Number(event.target.value))}
              aria-valuetext={`${ideas} ${ideas === 1 ? "idea" : "ideas"}: ${rung.topic}`}
              className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            />
            <div aria-hidden="true" className="flex gap-1 rounded-lg ring-offset-2 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--ld-accent)]">
              {Array.from({ length: most }, (_, index) => (
                <span key={index} className={cn("h-[34px] flex-1 rounded-md transition-colors duration-200", index < ideas ? verdict.fill : "bg-[#eef1f8]")} />
              ))}
            </div>
          </div>
          <div aria-hidden="true" className="mt-2 flex justify-between font-mono text-[11px] text-[var(--ld-text-muted)] uppercase">
            <span>1 idea</span>
            <span>{readTimeFor(ideas)}</span>
            <span>{most} ideas</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { CraftTools };
