"use client";

import { motion, useReducedMotion } from "framer-motion";

const paths = [
  "M0,60 C 400,60 700,280 1440,240",
  "M0,420 C 400,420 700,280 1440,260",
] as const;

const signalPath = "M0,240 C 400,240 700,250 1440,250";

const signalDot = {
  cx: [0, 360, 720, 1080, 1440],
  cy: [240, 242, 246, 248, 250],
};

function MentorshipAudienceBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg
        viewBox="0 0 1440 480"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        {paths.map((d) => (
          <path
            key={d}
            d={d}
            fill="none"
            className="stroke-foreground/10"
            strokeWidth={1.5}
          />
        ))}

        <path d={signalPath} fill="none" className="stroke-primary/40" strokeWidth={2} />

        <motion.circle
          r={5}
          className="fill-primary"
          initial={{ opacity: 0, cx: signalDot.cx[0], cy: signalDot.cy[0] }}
          animate={
            reduceMotion
              ? { opacity: 0.8, cx: signalDot.cx[0], cy: signalDot.cy[0] }
              : {
                  opacity: [0, 1, 1, 0],
                  cx: signalDot.cx,
                  cy: signalDot.cy,
                }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: 3.2,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 0.8,
                }
          }
        />
      </svg>
    </div>
  );
}

export { MentorshipAudienceBackground };
