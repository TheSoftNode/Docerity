"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { BOARD_INTERVAL_MS } from "@/components/sections/home/home-data";
import type { HeadlinePhrase } from "@/components/sections/home/hero-content";
import { NowBoard, type BoardRow } from "@/components/sections/home/now-board";

/**
 * The moving half of the hero: the rotating headline and the Now Board, on one
 * clock.
 *
 * They share a step so that while the headline says "Software, shipped." the
 * board lifts its Build row, and so on through the tracks. Everything around
 * them (the eyebrow, the lede, the buttons) is rendered on the server and
 * passed in, so only the parts that move ship as client code.
 */
function HeroShowcase({
  title,
  phrases,
  rows,
  eyebrow,
  children,
}: {
  /** The editable title, whole, as the heading's accessible text. */
  title: string;
  phrases: HeadlinePhrase[];
  rows: BoardRow[];
  eyebrow: ReactNode;
  /** The lede and the actions, rendered on the server. */
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const [step, setStep] = useState(0);
  const paused = useRef(false);

  /* One interval for both. It keeps running under reduced motion, because the
     board's words are content, but the headline then changes without the
     slide and the board without the scramble.

     It holds while the pointer is over the board or focus is inside the hero (WCAG
     2.2.2: anything that moves on its own needs a way to stop it), and while
     the tab is hidden, so a visitor coming back does not see it race. */
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!paused.current && document.visibilityState === "visible") setStep((value) => value + 1);
    }, BOARD_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  const count = Math.max(phrases.length, 1);
  const current = step % count;

  return (
    <div
      className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
      onFocus={() => {
        paused.current = true;
      }}
      onBlur={() => {
        paused.current = false;
      }}
    >
      <div className="min-w-0">
        {eyebrow}

        <h1 className="ld-display ld-up ld-delay-1 text-[clamp(46px,min(7vw,12.5vh),112px)] leading-[0.98] font-extrabold tracking-[-0.05em] text-balance">
          {/* The whole title, once, for screen readers and search. The
              rotating phrases below are decoration over the same words, and a
              heading whose name changed every few seconds would be announced
              as a different page section each time. */}
          <span className="sr-only">{title}</span>
          {/* Every phrase occupies the same grid cell, so the heading is as
              tall as its longest phrase and nothing below it jumps when the
              phrase changes. A long editable line wraps instead of being cut. */}
          <span aria-hidden="true" className="grid">
            {phrases.map((phrase, index) => (
              <span
                key={index}
                className={cn(
                  "[grid-area:1/1]",
                  !reduceMotion && "transition-[opacity,transform] duration-700 ease-[cubic-bezier(.75,0,.2,1)]",
                  index === current ? "translate-y-0 opacity-100" : "translate-y-[0.35em] opacity-0"
                )}
              >
                <span className="block">{phrase.lead || "\u00a0"}</span>
                <span className="block text-[var(--ld-accent)]">{phrase.accent}</span>
              </span>
            ))}
          </span>
        </h1>

        {count > 1 ? (
          <div aria-hidden="true" className="ld-up ld-delay-2 mt-6 flex gap-2">
            {phrases.map((_, index) => (
              <span
                key={index}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  index === current
                    ? "w-14 bg-[var(--ld-accent)]"
                    : "w-5 bg-[rgb(var(--ld-paper-rgb)/0.25)]"
                )}
              />
            ))}
          </div>
        ) : null}

        {children}
      </div>

      <div
        className="ld-up ld-delay-3 min-w-0 [container-type:inline-size]"
        onPointerEnter={() => {
          paused.current = true;
        }}
        onPointerLeave={() => {
          paused.current = false;
        }}
      >
        <NowBoard rows={rows} step={step} activeRow={current % rows.length} />
      </div>
    </div>
  );
}

export { HeroShowcase };
