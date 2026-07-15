"use client";

import { motion, useReducedMotion } from "framer-motion";

const chips = [
  { label: "Production Systems", top: "2%", left: "56%", delay: 1.1, floatDelay: 0 },
  { label: "Mentorship", top: "44%", left: "-6%", delay: 1.25, floatDelay: 1.1 },
  { label: "Tech Explainers", top: "84%", left: "42%", delay: 1.4, floatDelay: 2.2 },
] as const;

function TagChips() {
  const reduceMotion = useReducedMotion();

  return (
    <>
      {chips.map((chip) => (
        <motion.span
          key={chip.label}
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={
            reduceMotion
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 1, scale: 1, y: [0, -8, 0] }
          }
          transition={
            reduceMotion
              ? { duration: 0.5, delay: chip.delay }
              : {
                  opacity: { duration: 0.5, delay: chip.delay },
                  scale: { duration: 0.5, delay: chip.delay },
                  y: {
                    duration: 5,
                    ease: "easeInOut",
                    repeat: Infinity,
                    delay: chip.delay + chip.floatDelay,
                  },
                }
          }
          className="absolute rounded-full border border-border bg-card/95 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-foreground/90 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]"
          style={{ top: chip.top, left: chip.left }}
        >
          {chip.label}
        </motion.span>
      ))}
    </>
  );
}

export { TagChips };
