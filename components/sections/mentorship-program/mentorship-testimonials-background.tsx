"use client";

import { motion, useReducedMotion } from "framer-motion";

const bars = Array.from({ length: 36 }, (_, i) => {
  const heights = [30, 55, 40, 70, 45, 90, 60, 35, 50];
  return heights[i % heights.length];
});

function MentorshipTestimonialsBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 h-40 overflow-hidden opacity-[0.07]"
      aria-hidden
    >
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="h-full w-full">
        {bars.map((height, index) => {
          const x = (index / bars.length) * 1440;
          const barWidth = 1440 / bars.length - 6;
          return (
            <motion.rect
              key={index}
              x={x}
              width={barWidth}
              y={100 - height}
              height={height}
              className="fill-foreground"
              initial={{ scaleY: 1 }}
              animate={
                reduceMotion
                  ? { scaleY: 1 }
                  : { scaleY: [1, 1.15, 0.9, 1] }
              }
              transition={{
                duration: 3,
                ease: "easeInOut",
                repeat: Infinity,
                delay: (index % 6) * 0.15,
              }}
              style={{ transformOrigin: `${x + barWidth / 2}px 100px` }}
            />
          );
        })}
      </svg>
    </div>
  );
}

export { MentorshipTestimonialsBackground };
