"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Decorative depth behind the hero illustration.
 *
 * A sibling layer: it never touches the cards, scenes or chips.
 *
 * Rings are sized from this box's *width* and kept circular with
 * `aspect-square`, so they always fit the column they sit in.
 *
 * Two earlier versions clipped. Fixed `rem` sizes inside an `overflow-hidden`
 * box left the ring exactly as tall as the frame, tangent to the edges and
 * sliced flat. Sizing from height then overshot the other way: at 1440 the
 * ring spanned 694–1454, crossing into the text column and running off the
 * page, where the section's `overflow-hidden` cut it flat again.
 */
function HeroAura() {
  const reduceMotion = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute -inset-6 -z-10">
      {/* Glow under the cards, so they sit in light rather than on flat navy. */}
      <div className="absolute top-1/2 left-1/2 w-[80%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--brand-primary)_0%,transparent_65%)] opacity-[0.10] blur-2xl" />

      {/* Outer ring sits wider than the artwork, so the illustration reads as
          being inside it rather than crossed by it. */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[96%] aspect-square -translate-x-1/2 -translate-y-1/2"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 60, ease: "linear", repeat: Infinity }}
      >
        <span className="absolute inset-0 rounded-full border border-dashed border-primary/25" />
        <span className="absolute top-0 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_var(--brand-primary)]" />
      </motion.div>

      <motion.div
        className="absolute top-1/2 left-1/2 w-[74%] aspect-square -translate-x-1/2 -translate-y-1/2"
        animate={reduceMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 45, ease: "linear", repeat: Infinity }}
      >
        <span className="absolute inset-0 rounded-full border border-dashed border-brand-violet/20" />
        <span className="absolute bottom-0 left-1/2 size-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-brand-violet shadow-[0_0_10px_var(--brand-violet)]" />
      </motion.div>

      {/* Corner ticks, outside the rings, as the outermost frame. */}
      {[
        "top-0 left-0 border-t border-l",
        "top-0 right-0 border-t border-r",
        "bottom-0 left-0 border-b border-l",
        "bottom-0 right-0 border-b border-r",
      ].map((corner) => (
        <span key={corner} className={`absolute size-5 border-primary/25 ${corner}`} />
      ))}
    </div>
  );
}

export { HeroAura };
