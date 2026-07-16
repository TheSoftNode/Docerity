"use client";

import { motion, useReducedMotion } from "framer-motion";

const layers = [
  [60, 130, 200],
  [420, 90, 165, 240],
  [780, 130, 200],
  [1140, 165],
] as const;

function layerNodes(layer: readonly number[]) {
  const x = layer[0];
  return layer.slice(1).map((y) => ({ x, y }));
}

const columns = layers.map(layerNodes);

const highlightPath = [
  { x: 60, y: 200 },
  { x: 420, y: 165 },
  { x: 780, y: 130 },
  { x: 1140, y: 165 },
] as const;

function AiHeroBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg viewBox="0 0 1200 280" preserveAspectRatio="none" className="h-full w-full">
        {columns.slice(0, -1).map((column, colIndex) =>
          column.flatMap((node, nodeIndex) =>
            columns[colIndex + 1].map((nextNode, nextIndex) => (
              <line
                key={`${colIndex}-${nodeIndex}-${nextIndex}`}
                x1={node.x}
                y1={node.y}
                x2={nextNode.x}
                y2={nextNode.y}
                stroke="#f3f1ea"
                strokeOpacity={0.05}
                strokeWidth={1}
              />
            ))
          )
        )}

        <path
          d={`M ${highlightPath.map((p) => `${p.x},${p.y}`).join(" L ")}`}
          fill="none"
          stroke="#c2660a"
          strokeOpacity={0.4}
          strokeWidth={1.5}
        />

        {columns.flat().map((node, index) => (
          <circle
            key={index}
            cx={node.x}
            cy={node.y}
            r={4}
            fill="#f3f1ea"
            fillOpacity={0.12}
          />
        ))}

        {highlightPath.map((node) => (
          <circle
            key={`${node.x}-${node.y}`}
            cx={node.x}
            cy={node.y}
            r={4}
            fill="#c2660a"
            fillOpacity={0.5}
          />
        ))}

        <motion.circle
          r={5}
          fill="#c2660a"
          initial={{ opacity: 0, cx: highlightPath[0].x, cy: highlightPath[0].y }}
          animate={
            reduceMotion
              ? { opacity: 0.8, cx: highlightPath[0].x, cy: highlightPath[0].y }
              : {
                  opacity: [0, 1, 1, 0],
                  cx: highlightPath.map((p) => p.x),
                  cy: highlightPath.map((p) => p.y),
                }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: 3,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 0.6,
                }
          }
        />
      </svg>
    </div>
  );
}

export { AiHeroBackground };
