"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { orbitPositions, SPECIALTY_INTERVAL_MS } from "@/components/sections/mentorship-page/mentorship-content";

/**
 * The specialties around "You", one matched at a time: a line draws to it
 * and its dot takes the accent. The specialties are also given as a plain
 * list for assistive technology, since the circle is a picture of matching
 * rather than something to read.
 */
function TeamBench({ specialties }: { specialties: string[] }) {
  const reduceMotion = useReducedMotion() ?? false;
  const [match, setMatch] = useState(0);
  const points = orbitPositions(specialties.length);

  useEffect(() => {
    if (reduceMotion || specialties.length < 2) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") setMatch((value) => (value + 1) % specialties.length);
    }, SPECIALTY_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [reduceMotion, specialties.length]);

  return (
    <div>
      <ul className="sr-only">
        {specialties.map((specialty) => (
          <li key={specialty}>{specialty}</li>
        ))}
      </ul>
      <div aria-hidden="true" className="relative mx-auto aspect-square w-full max-w-[560px]">
        <div className="absolute inset-0 rounded-full bg-[var(--ld-ink)] shadow-[0_60px_120px_-50px_rgb(var(--ld-ink-rgb)/0.7)]" />
        <div className="ld-spin absolute inset-[12%] rounded-full border border-dashed border-[rgb(var(--ld-tint-rgb)/0.3)]" />
        <div className="absolute inset-[30%] rounded-full border border-[rgb(var(--ld-tint-rgb)/0.18)]" />
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
          {points.map((point, index) => (
            <line
              key={specialties[index]}
              x1="50"
              y1="50"
              x2={point.x}
              y2={point.y}
              stroke={index === match ? "rgb(244 245 250 / 0.85)" : "rgb(175 196 255 / 0.18)"}
              strokeWidth={index === match ? 0.5 : 0.25}
              strokeDasharray={index === match ? undefined : "1 1.2"}
              className="transition-[stroke] duration-500"
            />
          ))}
        </svg>
        {specialties.map((specialty, index) => {
          const on = index === match;
          return (
            <span
              key={specialty}
              className={cn(
                "absolute inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-xl border px-2 py-1.5 text-[11.5px] sm:gap-2 sm:px-3 sm:py-2 sm:text-[13.5px] font-semibold whitespace-nowrap transition-[transform,background-color,color,border-color] duration-500 ease-[cubic-bezier(.2,.7,.2,1)]",
                on
                  ? "scale-[1.08] border-[var(--ld-paper)] bg-[var(--ld-paper)] text-[var(--ld-ink)]"
                  : "border-[rgb(var(--ld-tint-rgb)/0.25)] bg-[#13296b] text-[var(--ld-muted)]"
              )}
              style={{ left: `${points[index].x}%`, top: `${points[index].y}%` }}
            >
              <span className={cn("size-[7px] rounded-full", on ? "bg-[var(--ld-accent)]" : "bg-[rgb(var(--ld-tint-rgb)/0.5)]")} />
              {specialty}
            </span>
          );
        })}
        <span className="ld-display absolute top-1/2 left-1/2 grid aspect-square w-[22%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[var(--ld-paper)] text-[clamp(18px,2vw,26px)] font-extrabold text-[var(--ld-ink)] shadow-[0_0_0_10px_rgb(var(--ld-tint-rgb)/0.14),0_0_0_11.5px_rgb(var(--ld-accent-rgb)/0.55)]">
          You
        </span>
        <span className="absolute bottom-[6%] left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-[0.08em] whitespace-nowrap text-[var(--ld-muted)] uppercase">
          Matched to · {specialties[match]}
        </span>
      </div>
    </div>
  );
}

export { TeamBench };
