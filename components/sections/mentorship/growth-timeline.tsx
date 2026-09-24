"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

import { checkpoints } from "@/components/sections/mentorship/mentorship-data";

/* The rail draws over two seconds and each checkpoint arrives as the line
   reaches it. */
const DRAW = 2;

/**
 * The growth path, stood upright.
 *
 * The horizontal curve needs a full-width row to stay legible; squeezed into
 * a column its 22px SVG labels shrink to ~13px, and at full width its
 * captions sat directly on the line. Vertical, it fits a two-column layout,
 * reads top-to-bottom like the progression it describes, and uses real text
 * rather than SVG text, so it stays crisp at every size.
 */
function GrowthTimeline() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLOListElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const last = checkpoints.length - 1;

  return (
    <ol ref={ref} className="relative">
      {/* Rail, then the drawn progress over it. */}
      <span
        aria-hidden
        className="absolute top-3 bottom-3 left-5 w-px -translate-x-1/2 bg-border"
      />
      <motion.span
        aria-hidden
        className="absolute top-3 bottom-3 left-5 w-px origin-top -translate-x-1/2 bg-[linear-gradient(to_bottom,var(--brand-primary),var(--brand-violet))]"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: inView ? 1 : 0 }}
        transition={{ duration: reduceMotion ? 0 : DRAW, ease: "easeInOut" }}
      />
      {/* The traveller, riding the line as it draws. */}
      <motion.span
        aria-hidden
        className="absolute left-5 size-2.5 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_14px_var(--brand-primary)]"
        initial={{ top: "0.75rem", opacity: 0 }}
        animate={
          inView && !reduceMotion
            ? { top: ["0.75rem", "calc(100% - 0.75rem)"], opacity: [0, 1, 1, 0] }
            : { opacity: 0 }
        }
        transition={{
          duration: DRAW,
          ease: "easeInOut",
          opacity: { duration: DRAW, times: [0, 0.06, 0.94, 1] },
        }}
      />

      {checkpoints.map((checkpoint, index) => {
        const isGoal = index === last;
        return (
          <motion.li
            key={checkpoint.label}
            className="relative grid grid-cols-[2.5rem_1fr] items-start gap-4 pb-7 last:pb-0"
            initial={{ opacity: 0, x: -8 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
            transition={{
              duration: reduceMotion ? 0 : 0.45,
              ease: "easeOut",
              delay: reduceMotion ? 0 : (index / last) * DRAW,
            }}
          >
            <span className="relative z-10 flex size-10 items-center justify-center">
              <span
                className={
                  isGoal
                    ? "flex size-10 items-center justify-center rounded-full border border-brand-violet/60 bg-card font-mono text-[0.6875rem] text-brand-violet shadow-[0_0_24px_-6px_var(--brand-violet)]"
                    : "flex size-10 items-center justify-center rounded-full border border-primary/40 bg-card font-mono text-[0.6875rem] text-primary"
                }
              >
                {String(index + 1).padStart(2, "0")}
              </span>
            </span>

            <div className="pt-1.5">
              <p className="font-heading text-base font-semibold tracking-tight text-foreground sm:text-lg">
                {checkpoint.label}
              </p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {checkpoint.detail}
              </p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}

export { GrowthTimeline };
