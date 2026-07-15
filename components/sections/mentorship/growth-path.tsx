"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

import { checkpoints, dotPath, pathD } from "@/components/sections/mentorship/mentorship-data";

const DRAW_DURATION = 2;

function CheckpointMarker({
  checkpoint,
  progressAtPoint,
  isInView,
  reduceMotion,
}: {
  checkpoint: (typeof checkpoints)[number];
  progressAtPoint: number;
  isInView: boolean;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: isInView ? 1 : 0 }}
      transition={{
        duration: reduceMotion ? 0.3 : 0.4,
        delay: reduceMotion ? 0 : progressAtPoint * DRAW_DURATION,
      }}
    >
      <circle
        cx={checkpoint.x}
        cy={checkpoint.y}
        r={9}
        className="fill-card stroke-primary"
        strokeWidth={2}
      />
      <text
        x={checkpoint.x}
        y={checkpoint.y - 24}
        textAnchor="middle"
        className="fill-foreground font-heading text-[22px] font-medium"
      >
        {checkpoint.label}
      </text>
      <text
        x={checkpoint.x}
        y={checkpoint.y - 2}
        textAnchor="middle"
        className="fill-muted-foreground font-mono text-[13px]"
      >
        {checkpoint.detail}
      </text>
    </motion.g>
  );
}

function GrowthPath() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div className="relative w-full">
      <svg
        ref={ref}
        viewBox="0 0 980 220"
        className="h-auto w-full overflow-visible"
        aria-hidden
      >
        <path
          d={pathD}
          fill="none"
          className="stroke-border"
          strokeWidth={2}
          strokeLinecap="round"
        />

        <motion.path
          d={pathD}
          fill="none"
          className="stroke-primary"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: reduceMotion || isInView ? 1 : 0 }}
          transition={{ duration: reduceMotion ? 0 : DRAW_DURATION, ease: "easeInOut" }}
        />

        <motion.circle
          r={7}
          className="fill-primary"
          initial={{ opacity: 0, cx: dotPath.x[0], cy: dotPath.y[0] }}
          animate={
            reduceMotion
              ? { opacity: 0 }
              : isInView
                ? { opacity: [0, 1, 1, 0], cx: dotPath.x, cy: dotPath.y }
                : { opacity: 0 }
          }
          transition={{
            duration: DRAW_DURATION,
            ease: "easeInOut",
            opacity: { duration: DRAW_DURATION, times: [0, 0.05, 0.95, 1] },
          }}
        />

        {checkpoints.map((checkpoint, index) => (
          <CheckpointMarker
            key={checkpoint.label}
            checkpoint={checkpoint}
            progressAtPoint={index / (checkpoints.length - 1)}
            isInView={isInView}
            reduceMotion={reduceMotion}
          />
        ))}
      </svg>
    </div>
  );
}

export { GrowthPath };
