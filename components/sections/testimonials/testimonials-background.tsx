"use client";

import { motion, useReducedMotion } from "framer-motion";

const rings = [
  { radius: 160, duration: 6, delay: 0 },
  { radius: 230, duration: 6, delay: 1 },
  { radius: 300, duration: 6, delay: 2 },
] as const;

function TestimonialsBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      aria-hidden
    >
      <svg viewBox="0 0 800 800" className="h-[140%] w-[140%] max-w-none sm:h-full sm:w-full">
        {rings.map((ring, index) => (
          <motion.circle
            key={index}
            cx={400}
            cy={400}
            r={ring.radius}
            fill="none"
            className="stroke-primary/10"
            strokeWidth={1}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={
              reduceMotion
                ? { scale: 1, opacity: 0.6 }
                : { scale: [0.85, 1.08, 0.85], opacity: [0, 0.6, 0] }
            }
            transition={{
              duration: ring.duration,
              ease: "easeInOut",
              repeat: Infinity,
              delay: ring.delay,
            }}
            style={{ transformOrigin: "400px 400px" }}
          />
        ))}
      </svg>
    </div>
  );
}

export { TestimonialsBackground };
