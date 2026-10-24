"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { PROCESS_INTERVAL_MS } from "@/components/sections/projects/projects-content";

export type ConsoleStage = {
  title: string;
  summary: string;
  description: string;
  slug: string;
  /** The lines the terminal types while this stage runs; the last is the ✓. */
  log: string[];
};

/** Delay between log lines as they type in, in seconds. */
const LINE_GAP = 0.55;

/**
 * The process as a deploy console.
 *
 * The pipeline on the left is a set of toggle buttons, one per stage, joined
 * by a rail that fills as the run progresses; earlier stages read as done,
 * later ones as queued. The terminal on the right types the running stage's
 * log, replayed whenever the stage changes because each stage's log is its
 * own keyed element.
 *
 * It advances on its own and holds while the pointer is over it or keyboard
 * focus is inside it (WCAG 2.2.2), while the tab is hidden, and entirely
 * under reduced motion, where the log also appears at once.
 */
function ProcessConsole({ stages }: { stages: ConsoleStage[] }) {
  const reduceMotion = useReducedMotion() ?? false;
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const count = stages.length;
  const paused = hovered || focused;

  useEffect(() => {
    if (reduceMotion || paused || count < 2) return;
    const timer = window.setTimeout(() => {
      if (document.visibilityState === "visible") setCurrent((value) => (value + 1) % count);
    }, PROCESS_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [reduceMotion, paused, current, count]);

  if (count === 0) return null;

  const index = Math.min(current, count - 1);
  const stage = stages[index];
  const number = (position: number) => String(position + 1).padStart(2, "0");
  const percent = Math.round(((index + 1) / count) * 100);
  const rail = count > 1 ? (index / (count - 1)) * 100 : 0;

  return (
    <div
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={(event) => {
        if ((event.target as HTMLElement).matches(":focus-visible")) setFocused(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
      className="grid overflow-hidden rounded-[28px] border border-[rgb(var(--ld-tint-rgb)/0.18)] bg-[var(--ld-panel)] shadow-[0_60px_120px_-60px_rgb(0_0_0/0.8)] md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
    >
      <div className="relative p-[clamp(22px,3vw,40px)] md:border-r md:border-[rgb(var(--ld-tint-rgb)/0.12)]">
        <div
          aria-hidden="true"
          className="absolute top-[calc(clamp(22px,3vw,40px)+30px)] bottom-[calc(clamp(22px,3vw,40px)+30px)] left-[calc(clamp(22px,3vw,40px)+15px)] w-0.5 bg-[rgb(var(--ld-tint-rgb)/0.14)]"
        >
          <div
            className="w-full bg-[var(--ld-accent)] transition-[height] duration-700 ease-[cubic-bezier(.2,.7,.2,1)]"
            style={{ height: `${rail}%` }}
          />
        </div>

        <ol aria-label="Stages" className="relative flex flex-col gap-1.5">
          {stages.map((item, position) => {
            const done = position < index;
            const active = position === index;
            return (
              <li key={item.slug}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCurrent(position)}
                  className={cn(
                    "flex w-full items-start gap-[18px] rounded-2xl py-3.5 pr-3.5 text-left outline-none transition-colors duration-500",
                    "focus-visible:ring-1 focus-visible:ring-[rgb(var(--ld-accent-rgb)/0.7)]",
                    active ? "bg-[rgb(var(--ld-tint-rgb)/0.06)]" : "hover:bg-[rgb(var(--ld-tint-rgb)/0.03)]"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border-[1.5px] font-mono text-xs transition-colors duration-500",
                      active && "border-[var(--ld-accent)] bg-[var(--ld-accent)]",
                      done && "border-[rgb(var(--ld-tint-rgb)/0.4)] bg-[rgb(var(--ld-tint-rgb)/0.14)] text-[var(--ld-tint)]",
                      !active && !done && "border-[rgb(var(--ld-tint-rgb)/0.22)] bg-[var(--ld-panel)] text-[var(--ld-muted-3)]"
                    )}
                  >
                    {done ? "✓" : active ? <span className="ld-live size-2.5 rounded-full bg-[var(--ld-ink)]" /> : number(position)}
                  </span>
                  <span className="min-w-0 pt-0.5">
                    <span
                      className={cn(
                        "block font-mono text-[11px] tracking-[0.1em] uppercase",
                        active ? "text-[var(--ld-accent)]" : "text-[var(--ld-muted-3)]"
                      )}
                    >
                      Stage {number(position)} · {done ? "Done" : active ? "Running" : "Queued"}
                    </span>
                    <span
                      className={cn(
                        "ld-display mt-1.5 block text-[clamp(22px,2.2vw,28px)] font-bold tracking-[-0.02em] transition-colors duration-500",
                        active ? "text-[var(--ld-paper)]" : done ? "text-[var(--ld-muted)]" : "text-[var(--ld-muted-3)]"
                      )}
                    >
                      {item.title}
                    </span>
                    <span
                      className={cn(
                        "mt-1 block text-[15px] font-medium",
                        active ? "text-[var(--ld-tint)]" : "text-[var(--ld-muted-3)]"
                      )}
                    >
                      {item.summary}
                    </span>
                    {active ? (
                      <span className="ld-up mt-2.5 block max-w-[30rem] text-[14.5px] leading-normal text-[var(--ld-muted)]">
                        {item.description}
                      </span>
                    ) : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="flex min-h-[460px] flex-col bg-[var(--ld-ink-2)]">
        <div className="flex items-center gap-2 border-b border-[rgb(var(--ld-tint-rgb)/0.12)] px-[18px] py-3.5 font-mono text-xs text-[var(--ld-muted-3)]">
          <span aria-hidden="true" className="size-[9px] rounded-full bg-[#FF6B3D]" />
          <span aria-hidden="true" className="size-[9px] rounded-full bg-[#FFC94A]" />
          <span aria-hidden="true" className="size-[9px] rounded-full bg-[#54D696]" />
          <span className="ml-2.5 rounded-lg bg-[rgb(var(--ld-tint-rgb)/0.08)] px-3 py-1 text-[var(--ld-muted)]">deploy.log</span>
          <span className="ml-auto inline-flex items-center gap-2 text-[#54D696]">
            <span aria-hidden="true" className="ld-live size-1.5 rounded-full bg-[#54D696]" />
            running
          </span>
        </div>

        <div className="flex-1 px-6 py-5 font-mono text-sm leading-8">
          <p className="text-[var(--ld-muted-3)]">
            $ docerity deploy <span className="text-[#54D696]">--prod</span>{" "}
            <span className="text-[var(--ld-tint)]">--stage={stage.slug}</span>
          </p>
          {/* Keyed by stage, so moving to the next one replays the typing. */}
          <div key={stage.slug}>
            {stage.log.map((line, position) => {
              const last = position === stage.log.length - 1;
              return (
                <p
                  key={line}
                  className={cn(!reduceMotion && "ld-log-line", last ? "text-[var(--ld-paper)]" : "text-[var(--ld-muted)]")}
                  style={reduceMotion ? undefined : { animationDelay: `${0.25 + position * LINE_GAP}s` }}
                >
                  <span className={last ? "text-[#54D696]" : "text-[var(--ld-accent)]"}>{last ? "✓" : "›"}</span> {line}
                </p>
              );
            })}
            <p
              aria-hidden="true"
              className={cn("text-[var(--ld-accent)]", !reduceMotion && "ld-log-line")}
              style={reduceMotion ? undefined : { animationDelay: `${0.25 + stage.log.length * LINE_GAP}s` }}
            >
              <span className="ld-blink">▍</span>
            </p>
          </div>
        </div>

        <div className="border-t border-[rgb(var(--ld-tint-rgb)/0.12)] px-6 pt-4 pb-5">
          <div className="mb-2.5 flex justify-between font-mono text-[11.5px] text-[var(--ld-muted-3)]">
            <span>
              STAGE {number(index)} OF {number(count - 1)}
            </span>
            <span className="text-[var(--ld-paper)]">{percent}%</span>
          </div>
          <div
            role="progressbar"
            aria-label="Pipeline progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="h-1 overflow-hidden rounded-full bg-[rgb(var(--ld-tint-rgb)/0.12)]"
          >
            <div
              className="h-full rounded-full bg-[var(--ld-accent)] transition-[width] duration-700 ease-[cubic-bezier(.2,.7,.2,1)]"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export { ProcessConsole };
