"use client";

import { motion, useReducedMotion } from "framer-motion";

const traces = [
  [
    { x: 60, y: 0 },
    { x: 60, y: 90 },
    { x: 700, y: 90 },
    { x: 700, y: 45 },
  ],
  [
    { x: 940, y: 0 },
    { x: 940, y: 120 },
    { x: 760, y: 120 },
    { x: 760, y: 50 },
  ],
  [
    { x: 1000, y: 220 },
    { x: 820, y: 220 },
    { x: 820, y: 70 },
    { x: 620, y: 70 },
  ],
  [
    { x: 900, y: 700 },
    { x: 900, y: 420 },
    { x: 700, y: 420 },
    { x: 700, y: 90 },
  ],
  [
    { x: 100, y: 700 },
    { x: 100, y: 380 },
    { x: 380, y: 380 },
    { x: 380, y: 60 },
  ],
] as const;

const signalPoints = [
  { x: 520, y: 700 },
  { x: 520, y: 260 },
  { x: 560, y: 260 },
  { x: 560, y: 45 },
] as const;

function toPathD(points: readonly { x: number; y: number }[]) {
  return `M${points.map((p) => `${p.x},${p.y}`).join(" L")}`;
}

const signalPath = toPathD(signalPoints);

function ContactBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute -inset-x-6 -top-16 -bottom-10 overflow-hidden sm:-inset-x-10 sm:-top-24 lg:-inset-x-16 lg:-top-28"
      aria-hidden
    >
      <svg
        viewBox="0 0 1000 700"
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
          style={{
            transformOrigin: `${signalPoints[signalPoints.length - 1].x}px ${signalPoints[signalPoints.length - 1].y}px`,
          }}
        />
      </svg>
    </div>
  );
}

export { ContactBackground };
