"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { GRAPH, commitId, type Lane } from "@/components/sections/about-page/about-content";

/** How long each branch stays selected before the graph moves on. */
const STEP_MS = 5200;

/**
 * The career as a branch graph, and the commit card for the branch in view.
 *
 * It steps through the branches on its own, oldest first, and holds while
 * the pointer or focus is on it. The branch names are real buttons laid over
 * the drawing, so the graph is usable from a keyboard. The paths are
 * decoration. Under reduced motion nothing draws in and nothing steps on.
 * `children` is the page's heading, set beside the card as HEAD's message.
 */
function BranchGraph({ lanes, initLabel, children }: { lanes: Lane[]; initLabel: string; children: ReactNode }) {
  const reduceMotion = useReducedMotion() ?? false;
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  /* Bumped on every change, so the timer bar's animation restarts. */
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduceMotion || held || lanes.length < 2) return;
    const timer = window.setTimeout(() => {
      if (document.visibilityState === "visible") {
        setActive((index) => (index + 1) % lanes.length);
        setStep((value) => value + 1);
      }
    }, STEP_MS);
    return () => window.clearTimeout(timer);
  }, [reduceMotion, held, lanes.length, step]);

  const choose = (index: number) => {
    setActive(index);
    setStep((value) => value + 1);
  };
  const lane = lanes[active];
  const { width, height, main, head } = GRAPH;
  const pct = (value: number, of: number) => `${(value / of) * 100}%`;

  return (
    <div
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHeld(false);
      }}
    >
      <div className="ld-up flex flex-wrap justify-between gap-x-5 gap-y-2.5 border-b border-dashed border-[rgb(var(--ld-tint-rgb)/0.18)] pb-3.5 font-mono text-[12.5px] text-[var(--ld-muted-3)]">
        <span>
          <span className="text-[var(--ld-accent)]">$</span> <span className="text-[var(--ld-paper)]">git log --graph --all</span>
          &nbsp; docerity/about
        </span>
        <span>
          {lanes.length} branches · 1 main{reduceMotion ? "" : held ? " · paused" : " · autoplay"}
        </span>
      </div>

      {/* Scrolls sideways on a phone rather than shrinking the names to nothing. */}
      <div className="ld-up ld-delay-1 -mx-4 mt-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <div className="relative min-w-[760px]">
          <svg viewBox={`0 0 ${width} ${height}`} className="block h-auto w-full overflow-visible" aria-hidden="true">
            <path className="ld-draw" d={`M 24 ${main} L ${head - 12} ${main}`} fill="none" stroke="#7f98e0" strokeWidth={5} strokeLinecap="round" pathLength={100} />
            {lanes.map((branch, index) => {
              const on = index === active;
              return (
                <g key={branch.index} onClick={() => choose(index)} className="cursor-pointer">
                  <path d={branch.d} fill="none" stroke="transparent" strokeWidth={22} />
                  <path
                    className="ld-draw transition-[stroke,stroke-width] duration-300"
                    style={{ animationDelay: `${0.35 + index * 0.12}s` }}
                    d={branch.d}
                    fill="none"
                    stroke={on ? "#F4F5FA" : "rgb(175 196 255 / 0.42)"}
                    strokeWidth={on ? 4 : 2.5}
                    strokeLinecap="round"
                    pathLength={100}
                  />
                  <circle
                    cx={branch.x0}
                    cy={branch.y}
                    r={on ? 9 : 6}
                    fill={on ? "var(--ld-accent)" : "#AFC4FF"}
                    stroke="var(--ld-ink)"
                    strokeWidth={3}
                    className="transition-all duration-300"
                  />
                  {branch.current && branch.x1 - branch.x0 > 300 ? (
                    <text x={branch.x1} y={branch.y - 13} textAnchor="end" fill="#7d8ec0" className="font-mono text-[11px]">
                      ongoing →
                    </text>
                  ) : null}
                </g>
              );
            })}
            <circle cx={24} cy={main} r={9} fill="var(--ld-ink)" stroke="#AFC4FF" strokeWidth={3} />
            <text x={24} y={main + 32} fill="#adb0bd" className="font-mono text-[12px]">
              {initLabel}
            </text>
            <circle className="ld-live" cx={head} cy={main} r={17} fill="var(--ld-accent)" />
            <circle cx={head} cy={main} r={7} fill="var(--ld-ink)" />
            <text x={head} y={main + 46} textAnchor="middle" fill="#F4F5FA" className="ld-display text-[22px] font-extrabold">
              HEAD
            </text>
            <text x={head} y={main + 66} textAnchor="middle" fill="#AFC4FF" className="font-mono text-[12px]">
              docerity
            </text>
          </svg>

          <ul aria-label="Roles, oldest first" className="absolute inset-0">
            {lanes.map((branch, index) => {
              const on = index === active;
              const left = pct(branch.x0 + 12, width);
              return (
                <li key={branch.index}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => choose(index)}
                    style={{ left, top: pct(branch.y - 32, height) }}
                    className={cn(
                      "absolute rounded-md font-mono text-[13px] leading-[1.2] font-medium whitespace-nowrap outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)]",
                      on ? "text-[var(--ld-paper)]" : "text-[#adb0bd] hover:text-[var(--ld-paper)]"
                    )}
                  >
                    {branch.org}
                    <span className="sr-only">, {branch.period}</span>
                  </button>
                  {/* Under the branch, so the line runs between a name and its dates. */}
                  <span aria-hidden="true" style={{ left, top: pct(branch.y + 10, height) }} className="absolute font-mono text-[11px] whitespace-nowrap text-[var(--ld-muted-3)]">
                    {branch.period}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-[clamp(18px,2.4vw,34px)] grid items-end gap-[clamp(24px,4vw,64px)] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div>{children}</div>
        {lane ? (
          <div aria-live="polite">
            <div key={lane.index} className="ld-pop rounded-[22px] border border-[rgb(var(--ld-tint-rgb)/0.16)] bg-[rgb(17_35_88/0.5)] px-5 py-[18px] font-mono text-[12.5px] leading-[1.75]">
              <p className="text-[#e9c46a]">
                commit {commitId(lane.org)} <span className="text-[var(--ld-muted-3)]">({lane.current ? "ongoing → HEAD" : "merged into main"})</span>
              </p>
              <p className="text-[var(--ld-muted-3)]">
                Role:&nbsp;&nbsp;&nbsp;
                <span className="text-[var(--ld-paper)]">
                  {lane.role} @ {lane.org}
                </span>
              </p>
              <p className="text-[var(--ld-muted-3)]">
                Date:&nbsp;&nbsp;&nbsp;<span className="text-[var(--ld-paper)]">{lane.period}</span>
              </p>
              <p className="mt-3 pl-[4ch] font-sans text-[15.5px] leading-normal text-[var(--ld-muted)]">{lane.summary}</p>
              <div aria-hidden="true" className="mt-4 h-0.5 overflow-hidden rounded-sm bg-[rgb(var(--ld-tint-rgb)/0.1)]">
                <div
                  className={cn("h-full bg-[var(--ld-accent)]", reduceMotion || held ? "w-full opacity-35" : step % 2 ? "ld-fill-a" : "ld-fill-b")}
                  style={reduceMotion || held ? undefined : { animationDuration: `${STEP_MS}ms` }}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export { BranchGraph };
