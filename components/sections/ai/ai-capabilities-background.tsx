"use client";

import { motion, useReducedMotion } from "framer-motion";

const streams = [
  { y: 60, delay: 0 },
  { y: 160, delay: 0.6 },
  { y: 260, delay: 1.2 },
  { y: 360, delay: 1.8 },
] as const;

function AiCapabilitiesBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg viewBox="0 0 1440 440" preserveAspectRatio="none" className="h-full w-full">
        {streams.map((stream) => (
          <line
            key={stream.y}
            x1={0}
            y1={stream.y}
            x2={1440}
            y2={stream.y}
            stroke="var(--foreground)"
            strokeOpacity={0.04}
            strokeWidth={1}
          />
        ))}

        {streams.map((stream) => (
          <motion.circle
            key={`dot-${stream.y}`}
            cy={stream.y}
            r={3}
            fill="var(--brand-primary)"
            initial={{ opacity: 0, cx: 0 }}
            animate={
              reduceMotion
                ? { opacity: 0.3, cx: 720 }
                : { opacity: [0, 0.6, 0.6, 0], cx: [0, 480, 960, 1440] }
            }
            transition={{
              duration: 5,
              ease: "linear",
              repeat: Infinity,
              delay: stream.delay,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export { AiCapabilitiesBackground };
