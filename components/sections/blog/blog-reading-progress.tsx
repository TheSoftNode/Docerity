"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

function ReadingProgress({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const smoothed = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <>
      <motion.div
        aria-hidden
        className="fixed inset-x-0 z-30 h-[3px] origin-left bg-primary"
        style={{
          top: "var(--nav-h)",
          scaleX: reduceMotion ? scrollYProgress : smoothed,
        }}
      />
      <div ref={ref}>{children}</div>
    </>
  );
}

export { ReadingProgress };
