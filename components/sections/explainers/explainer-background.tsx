"use client";

import { motion, useReducedMotion } from "framer-motion";

const WAVE_A =
  "M 520,0 C 580,90 460,150 520,220 C 580,290 460,330 520,420 L 1000,420 L 1000,0 Z";
const WAVE_B =
  "M 520,0 C 560,80 480,170 520,220 C 560,270 480,340 520,420 L 1000,420 L 1000,0 Z";

const LEFT_A =
  "M 520,0 C 580,90 460,150 520,220 C 580,290 460,330 520,420 L 0,420 L 0,0 Z";
const LEFT_B =
  "M 520,0 C 560,80 480,170 520,220 C 560,270 480,340 520,420 L 0,420 L 0,0 Z";

function ExplainerBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg
        viewBox="0 0 1000 420"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <motion.path
          d={LEFT_A}
          className="fill-background"
          animate={reduceMotion ? undefined : { d: [LEFT_A, LEFT_B, LEFT_A] }}
          transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }}
        />
        <motion.path
          d={WAVE_A}
          className="fill-[color:var(--surface-step-b)]"
          animate={reduceMotion ? undefined : { d: [WAVE_A, WAVE_B, WAVE_A] }}
          transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }}
        />
      </svg>
    </div>
  );
}

export { ExplainerBackground };
