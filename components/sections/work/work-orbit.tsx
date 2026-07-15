"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

function OrbitCluster({
  icons,
  size,
  duration,
  badgeSize = 36,
  reverse = false,
}: {
  icons: LucideIcon[];
  size: number;
  duration: number;
  badgeSize?: number;
  reverse?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const radius = size / 2 - badgeSize / 2 - 4;
  const angleStep = 360 / icons.length;
  const direction = reverse ? -360 : 360;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-foreground/15"
          strokeWidth={1.5}
        />
      </svg>

      <motion.div
        className="absolute inset-0"
        animate={reduceMotion ? undefined : { rotate: direction }}
        transition={{ duration, ease: "linear", repeat: Infinity }}
      >
        {icons.map((Icon, i) => {
          const angle = (i * angleStep * Math.PI) / 180;
          const x = Math.round(size / 2 + radius * Math.cos(angle) - badgeSize / 2);
          const y = Math.round(size / 2 + radius * Math.sin(angle) - badgeSize / 2);

          return (
            <motion.div
              key={i}
              className="absolute flex items-center justify-center rounded-full border border-foreground/20 bg-background/50 backdrop-blur-sm"
              style={{ left: x, top: y, width: badgeSize, height: badgeSize }}
              animate={reduceMotion ? undefined : { rotate: -direction }}
              transition={{ duration, ease: "linear", repeat: Infinity }}
            >
              <Icon
                style={{ width: Math.round(badgeSize * 0.45), height: Math.round(badgeSize * 0.45) }}
                className="text-foreground/70"
                strokeWidth={1.75}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

export { OrbitCluster };
