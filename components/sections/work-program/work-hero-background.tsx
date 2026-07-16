"use client";

import { motion, useReducedMotion } from "framer-motion";

const V_LINES = [120, 280, 440, 600, 760, 920, 1080, 1240, 1400] as const;
const H_LINES = [80, 200, 320, 440] as const;

const nodes = [
  { x: 440, y: 200 },
  { x: 920, y: 320 },
  { x: 1240, y: 80 },
] as const;

function WorkHeroBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg viewBox="0 0 1520 480" preserveAspectRatio="none" className="h-full w-full">
        {V_LINES.map((x) => (
          <line
            key={x}
            x1={x}
            y1={0}
            x2={x}
            y2={480}
            stroke="#f3f1ea"
            strokeOpacity={0.05}
            strokeWidth={1}
          />
        ))}
        {H_LINES.map((y) => (
          <line
            key={y}
            x1={0}
            y1={y}
            x2={1520}
            y2={y}
            stroke="#f3f1ea"
            strokeOpacity={0.05}
            strokeWidth={1}
          />
        ))}

        {nodes.map((node, index) => (
          <g key={`${node.x}-${node.y}`}>
            <line
              x1={node.x - 14}
              y1={node.y}
              x2={node.x + 14}
              y2={node.y}
              stroke="#c2660a"
              strokeOpacity={0.4}
              strokeWidth={1}
            />
            <line
              x1={node.x}
              y1={node.y - 14}
              x2={node.x}
              y2={node.y + 14}
              stroke="#c2660a"
              strokeOpacity={0.4}
              strokeWidth={1}
            />
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={4}
              fill="#c2660a"
              initial={{ opacity: 0.3, scale: 1 }}
              animate={
                reduceMotion
                  ? { opacity: 0.6, scale: 1 }
                  : { opacity: [0.3, 0.8, 0.3], scale: [1, 1.4, 1] }
              }
              transition={{
                duration: 2.4,
                ease: "easeInOut",
                repeat: Infinity,
                delay: index * 0.5,
              }}
              style={{ transformOrigin: `${node.x}px ${node.y}px` }}
            />
          </g>
        ))}

        <motion.line
          x1={0}
          y1={0}
          x2={1520}
          y2={0}
          stroke="#f3f1ea"
          strokeOpacity={0.12}
          strokeWidth={2}
          initial={{ y1: 0, y2: 0 }}
          animate={reduceMotion ? { y1: 240, y2: 240 } : { y1: [0, 480, 0], y2: [0, 480, 0] }}
          transition={{ duration: 10, ease: "linear", repeat: Infinity }}
        />
      </svg>
    </div>
  );
}

export { WorkHeroBackground };
