"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Counts a figure up when it first scrolls into view.
 *
 * The values carry suffixes — "9+" — so the number is split from whatever
 * trails it and only the digits animate. Rendering "9" then "+" separately
 * would let the "+" shift sideways as the number grows a digit.
 *
 * The final value is in the DOM from the first render and the animation only
 * overwrites it, so a reader on reduced motion, a crawler, or anyone who
 * arrives with JavaScript still loading sees the real figure rather than a
 * zero that never resolves.
 */
function CountUp({ value, durationMs = 1100 }: { value: string; durationMs?: number }) {
  /*
    Everything derived here is a primitive.

    An earlier version kept the `match` array itself in the effect's
    dependency list. `String.match` returns a new array on every render, so
    the dependency never compared equal: the effect re-ran, restarted the
    count, set state, and triggered the render that re-ran it again. The
    figures sat flickering near zero instead of settling.
  */
  const match = value.match(/^(\d+)(.*)$/);
  const isNumeric = match !== null;
  const target = match ? Number(match[1]) : 0;
  const suffix = match ? match[2] : value;

  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(target);

  useEffect(() => {
    if (!isNumeric || reduceMotion || !inView) return;

    let frame = 0;
    const started = performance.now();

    /* No synchronous reset to zero here: the first frame runs with
       `progress` at roughly 0 and sets it anyway, and calling setState in the
       effect body triggers a cascading render for no gain. */
    const tick = (now: number) => {
      const progress = Math.min((now - started) / durationMs, 1);
      /* Ease-out cubic: the count decelerates into its final value instead of
         stopping dead, which is what makes it read as settling rather than
         as a number being switched. */
      const eased = 1 - (1 - progress) ** 3;
      setShown(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduceMotion, target, durationMs, isNumeric]);

  return (
    <span ref={ref}>
      {/* `tabular-nums` so the box does not jitter as digits change width. */}
      <span className="tabular-nums">{isNumeric ? shown : value}</span>
      {isNumeric ? suffix : null}
    </span>
  );
}

export { CountUp };
