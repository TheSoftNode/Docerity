"use client";

import { motion, useReducedMotion } from "framer-motion";

function hexPoints(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

const blocks = [180, 380, 580, 780, 980, 1180, 1380] as const;
const y = 70;
const r = 34;

function Web3HeroBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg viewBox="0 0 1560 260" preserveAspectRatio="none" className="h-full w-full">
        {blocks.slice(0, -1).map((x, index) => (
          <line
            key={`link-${x}`}
            x1={x + r}
            y1={y}
            x2={blocks[index + 1] - r}
            y2={y}
            stroke="#f3f1ea"
            strokeOpacity={0.08}
            strokeWidth={1.5}
          />
        ))}

        {blocks.map((x, index) => (
          <g key={x}>
            <polygon
              points={hexPoints(x, y, r)}
              fill="none"
              stroke={index === 3 ? "#c2660a" : "#f3f1ea"}
              strokeOpacity={index === 3 ? 0.5 : 0.1}
              strokeWidth={1.5}
            />
            {index === 3 && (
              <motion.polygon
                points={hexPoints(x, y, r)}
                fill="#c2660a"
                initial={{ opacity: 0.08 }}
                animate={
                  reduceMotion
                    ? { opacity: 0.14 }
                    : { opacity: [0.08, 0.2, 0.08] }
                }
                transition={{ duration: 2.6, ease: "easeInOut", repeat: Infinity }}
              />
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

export { Web3HeroBackground };
