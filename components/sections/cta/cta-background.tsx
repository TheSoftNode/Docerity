"use client";

import { motion, useReducedMotion } from "framer-motion";

const RAY_COUNT = 15;
const ORIGIN = { x: 500, y: 480 };

const rays = Array.from({ length: RAY_COUNT }, (_, i) => {
  const x = (i / (RAY_COUNT - 1)) * 1000;
  return { x, id: i };
});

function CtaBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg
        viewBox="0 0 1000 400"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        {/* Two colour fields and an amber divider used to split this canvas
            down the middle — the divider landed straight through the headline.
            The section is one field now; only the rays remain. */}

        {rays.map((ray, index) => {
          const isCenter = index === Math.floor(RAY_COUNT / 2);
          return (
            <motion.line
              key={ray.id}
              x1={ORIGIN.x}
              y1={ORIGIN.y}
              x2={ray.x}
              y2={-20}
              strokeWidth={isCenter ? 1.5 : 1}
              className={isCenter ? "stroke-primary/25" : "stroke-foreground/[0.08]"}
              initial={{ opacity: 0.4 }}
              animate={
                reduceMotion
                  ? undefined
                  : { opacity: [0.4, isCenter ? 0.7 : 0.9, 0.4] }
              }
              transition={{
                duration: 4,
                ease: "easeInOut",
                repeat: Infinity,
                delay: index * 0.18,
              }}
            />
          );
        })}

        <motion.circle
          cx={ORIGIN.x}
          cy={ORIGIN.y}
          r={6}
          className="fill-primary/60"
          animate={reduceMotion ? undefined : { scale: [1, 1.6, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
          style={{ transformOrigin: `${ORIGIN.x}px ${ORIGIN.y}px` }}
        />
      </svg>
    </div>
  );
}

export { CtaBackground };
