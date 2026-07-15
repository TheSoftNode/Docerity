"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const proofPoints = [
  { icon: "✓", text: "In prod" },
  { icon: "★", text: "5.0 stars" },
  { icon: "↗", text: "12k reads" },
] as const;

function ProofCard({ activeScene }: { activeScene: number }) {
  const reduceMotion = useReducedMotion();
  const point = proofPoints[activeScene] ?? proofPoints[0];

  return (
    <motion.g
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.g
        animate={
          reduceMotion
            ? { rotate: 8 }
            : {
                x: [0, 0, 120, 120, 0],
                y: [0, 0, -20, -20, 0],
                rotate: [8, 8, 2, 2, 8],
                scale: [1, 1, 1.04, 1.04, 1],
              }
        }
        transition={
          reduceMotion
            ? { duration: 0 }
            : {
                duration: 4.2,
                times: [0, 0.1, 0.35, 0.75, 1],
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
        style={{ transformOrigin: "246px 252px" }}
      >
        <rect
          x="112"
          y="146"
          width="286"
          height="214"
          rx="24"
          className="fill-muted stroke-border"
          strokeWidth={1}
        />

        <text
          x="290"
          y="216"
          className="fill-muted-foreground font-mono text-[10px] uppercase tracking-widest"
        >
          Proof
        </text>

        <AnimatePresence mode="wait">
          <motion.g
            key={activeScene}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <text x="290" y="250" className="fill-primary font-heading text-xl font-medium">
              {point.icon}
            </text>
            <text x="316" y="250" className="fill-foreground font-mono text-xs">
              {point.text}
            </text>
          </motion.g>
        </AnimatePresence>
      </motion.g>
    </motion.g>
  );
}

export { ProofCard };
