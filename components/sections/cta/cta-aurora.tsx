"use client";

import { motion, useReducedMotion } from "framer-motion";

/*
  Three slow-drifting blobs, one per brand accent, behind a masked grid.
  They are deliberately far apart and heavily blurred: the point is a shifting
  wash of colour under the panel, not three recognisable circles.
*/
const blobs = [
  { color: "var(--brand-primary)", className: "top-[-18%] left-[6%] size-[34rem]", x: [0, 60, 0], y: [0, 30, 0], duration: 26 },
  { color: "var(--brand-violet)", className: "top-[8%] right-[2%] size-[30rem]", x: [0, -50, 0], y: [0, 40, 0], duration: 32 },
  { color: "var(--brand-teal)", className: "bottom-[-22%] left-[38%] size-[26rem]", x: [0, 40, 0], y: [0, -30, 0], duration: 38 },
];

function CtaAurora() {
  const reduceMotion = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {blobs.map((blob) => (
        <motion.div
          key={blob.className}
          className={`absolute rounded-full opacity-[0.16] blur-[90px] dark:opacity-[0.20] ${blob.className}`}
          style={{ backgroundImage: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)` }}
          animate={reduceMotion ? undefined : { x: [...blob.x], y: [...blob.y] }}
          transition={{ duration: blob.duration, ease: "easeInOut", repeat: Infinity }}
        />
      ))}

    </div>
  );
}

export { CtaAurora };
