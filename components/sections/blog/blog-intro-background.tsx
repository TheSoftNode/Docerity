"use client";

import { motion, useReducedMotion } from "framer-motion";

const dots = [120, 320, 620, 920, 1180, 1340] as const;

function BlogIntroBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg
        viewBox="0 0 1440 64"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <line
          x1={0}
          y1={32}
          x2={1440}
          y2={32}
          stroke="var(--foreground)"
          strokeOpacity={0.08}
          strokeWidth={1}
        />
        {dots.map((x, index) => (
          <motion.circle
            key={x}
            cx={x}
            cy={32}
            r={2.5}
            fill="var(--brand-primary)"
            initial={{ opacity: 0.15 }}
            animate={
              reduceMotion
                ? { opacity: 0.4 }
                : { opacity: [0.15, 0.7, 0.15] }
            }
            transition={{
              duration: 2.2,
              ease: "easeInOut",
              repeat: Infinity,
              delay: index * 0.3,
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export { BlogIntroBackground };
