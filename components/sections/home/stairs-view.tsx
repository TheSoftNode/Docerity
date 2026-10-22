"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { CheckpointView } from "@/lib/content/blocks/views";

const DELAYS = ["ld-delay-1", "ld-delay-2", "ld-delay-3", "ld-delay-4", "ld-delay-5", "ld-delay-6"];

/**
 * The stage as a share of the tallest step: an even climb from 42% to 100%,
 * whatever the number of stages, so a fifth stage added in the admin still
 * reads as a staircase rather than a ragged bar chart.
 */
function heightOf(position: number, count: number) {
  if (count <= 1) return 100;
  return Math.round(42 + (58 * position) / (count - 1));
}

/**
 * The climbable staircase and the card describing the chosen step.
 *
 * Steps below the chosen one are filled as "done", the chosen one carries the
 * accent and a marker, and the rest wait in outline: the same reading as a
 * progress path, without numbers that claim anyone's progress.
 */
function StairsView({ checkpoints, actions }: { checkpoints: CheckpointView[]; actions: ReactNode }) {
  const [selected, setSelected] = useState(0);
  if (checkpoints.length === 0) return null;

  const index = Math.min(selected, checkpoints.length - 1);
  const current = checkpoints[index];
  const number = (position: number) => String(position + 1).padStart(2, "0");

  return (
    <div className="mt-16 flex flex-wrap items-end gap-8">
      <ol
        aria-label="Mentorship stages"
        className="grid h-[300px] flex-[999_1_520px] items-end gap-2.5 sm:h-[380px]"
        style={{ gridTemplateColumns: `repeat(${checkpoints.length}, minmax(0, 1fr))` }}
      >
        {checkpoints.map((checkpoint, position) => {
          const active = position === index;
          const done = position < index;
          return (
            <li key={checkpoint.label} className="h-full">
              <div className="flex h-full items-end">
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelected(position)}
                  className={cn(
                    "ld-rise relative flex w-full flex-col justify-between rounded-[18px_18px_6px_6px] p-[clamp(10px,1.6vw,18px)] text-left outline-none transition-colors duration-500",
                    "focus-visible:ring-2 focus-visible:ring-[var(--ld-paper)]",
                    DELAYS[position % DELAYS.length],
                    active
                      ? "bg-[var(--ld-accent)] text-[var(--ld-ink)]"
                      : done
                        ? "bg-[var(--ld-tint)] text-[var(--ld-ink)]"
                        : "bg-[rgb(var(--ld-tint-rgb)/0.16)] text-[var(--ld-paper)] hover:bg-[rgb(var(--ld-tint-rgb)/0.26)]"
                  )}
                  style={{ height: `${heightOf(position, checkpoints.length)}%` }}
                >
                  {active ? (
                    <span
                      aria-hidden="true"
                      className="ld-float absolute -top-[42px] left-3.5 size-[26px] rounded-full border-[6px] border-[var(--ld-accent)] bg-[var(--ld-paper)]"
                    />
                  ) : null}
                  <span className="font-mono text-xs">{number(position)}</span>
                  <span className="ld-display text-[clamp(14px,1.8vw,22px)] leading-[1.1] font-bold">
                    {checkpoint.label}
                  </span>
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      <div
        aria-live="polite"
        className="flex-[1_1_300px] rounded-3xl border border-[rgb(var(--ld-tint-rgb)/0.3)] bg-[rgb(var(--ld-ink-rgb)/0.35)] p-7"
      >
        <p className="font-mono text-xs text-[var(--ld-tint)] uppercase">Stage {number(index)}</p>
        <p className="ld-display mt-3.5 text-[40px] leading-none font-extrabold tracking-[-0.035em]">
          {current.label}
        </p>
        <p className="mt-3.5 text-base leading-normal text-[var(--ld-muted)]">{current.detail}</p>
        {actions}
      </div>
    </div>
  );
}

export { StairsView };
