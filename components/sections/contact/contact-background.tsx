"use client";

import { motion, useReducedMotion } from "framer-motion";

const traces = [
  [
    { x: 40, y: 0 },
    { x: 40, y: 110 },
    { x: 900, y: 110 },
    { x: 900, y: 50 },
  ],
  [
    { x: 160, y: 640 },
    { x: 160, y: 430 },
    { x: 950, y: 430 },
    { x: 950, y: 80 },
  ],
  [
    { x: 1400, y: 0 },
    { x: 1400, y: 150 },
    { x: 1150, y: 150 },
    { x: 1150, y: 55 },
  ],
  [
    { x: 1300, y: 640 },
    { x: 1300, y: 380 },
    { x: 1080, y: 380 },
    { x: 1080, y: 90 },
  ],
  [
    { x: 0, y: 300 },
    { x: 320, y: 300 },
    { x: 320, y: 70 },
    { x: 1020, y: 70 },
    { x: 1020, y: 50 },
  ],
  [
    { x: 1440, y: 260 },
    { x: 1040, y: 260 },
    { x: 1040, y: 80 },
    { x: 860, y: 80 },
  ],
] as const;

const signalPoints = [
  { x: 1010, y: 640 },
  { x: 1010, y: 300 },
  { x: 960, y: 300 },
  { x: 960, y: 50 },
] as const;

function toPathD(points: readonly { x: number; y: number }[]) {
  return `M${points.map((p) => `${p.x},${p.y}`).join(" L")}`;
}

const signalPath = toPathD(signalPoints);

function ContactBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <svg
        viewBox="0 0 1440 640"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        {traces.map((points, index) => (
          <path
            key={index}
            d={toPathD(points)}
            fill="none"
            stroke="#0b1330"
            strokeOpacity={0.1}
            strokeWidth={1.5}
          />
        ))}
        {traces.map((points, index) => {
          const end = points[points.length - 1];
          return (
            <circle
              key={`via-${index}`}
              cx={end.x}
              cy={end.y}
              r={3.5}
              fill="#0b1330"
              fillOpacity={0.15}
            />
          );
        })}

        <path
          d={signalPath}
          fill="none"
          stroke="#c2660a"
          strokeOpacity={0.45}
          strokeWidth={2}
        />

        <motion.circle
          r={6}
          fill="#c2660a"
          initial={{ opacity: 0, cx: signalPoints[0].x, cy: signalPoints[0].y }}
          animate={
            reduceMotion
              ? { opacity: 0.9, cx: signalPoints[0].x, cy: signalPoints[0].y }
              : {
                  opacity: [0, 1, 1, 0],
                  cx: signalPoints.map((p) => p.x),
                  cy: signalPoints.map((p) => p.y),
                }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: 2.6,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 0.6,
                  opacity: { duration: 2.6, times: [0, 0.08, 0.9, 1] },
                }
          }
        />

        <motion.circle
          cx={signalPoints[signalPoints.length - 1].x}
          cy={signalPoints[signalPoints.length - 1].y}
          r={5}
          fill="#c2660a"
          initial={{ opacity: 0.4, scale: 1 }}
          animate={
            reduceMotion
              ? { opacity: 0.7, scale: 1 }
              : { opacity: [0.3, 0.8, 0.3], scale: [1, 1.6, 1] }
          }
          transition={{ duration: 2.6, ease: "easeInOut", repeat: Infinity }}
          style={{ transformOrigin: `${signalPoints[signalPoints.length - 1].x}px ${signalPoints[signalPoints.length - 1].y}px` }}
        />
      </svg>
    </div>
  );
}

export { ContactBackground };
