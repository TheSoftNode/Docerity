"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

import { fadeUp } from "@/components/sections/hero/illustration-variants";
import { scenes } from "@/components/sections/hero/illustration-scenes";
import { TagChips } from "@/components/sections/hero/illustration-tag-chips";
import { ProofCard } from "@/components/sections/hero/illustration-proof-card";

const SCENE_INTERVAL = 4200;
const MAX_TILT = 9;

function HeroIllustration() {
  const reduceMotion = useReducedMotion();
  const [activeScene, setActiveScene] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 150, damping: 18 });
  const springY = useSpring(rotateY, { stiffness: 150, damping: 18 });

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setActiveScene((current) => (current + 1) % scenes.length);
    }, SCENE_INTERVAL);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(relX * MAX_TILT * 2);
    rotateX.set(-relY * MAX_TILT * 2);
  };

  const handlePointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const ActiveScene = scenes[activeScene].Component;

  return (
    <div
      ref={wrapperRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      /* Left-aligned in its column, not centred. `mx-auto` split the
         leftover width evenly, so half of it landed in the middle of the hero
         and read as a hole: 106px of dead space at 1280, 210px at 2560. Any
         slack now falls on the page's outer edge, where it belongs. */
      className="relative aspect-square w-full max-w-[30rem]"
      style={{ perspective: 1200 }}
    >
      <motion.div
        animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
        style={{ rotateX: springX, rotateY: springY, transformStyle: "preserve-3d" }}
        className="h-full w-full"
      >
        <svg viewBox="0 0 480 480" className="h-full w-full overflow-visible" aria-hidden>
          <defs>
            <pattern id="dot-grid" width="26" height="26" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" className="fill-foreground/10" />
            </pattern>
          </defs>

          <rect x="10" y="20" width="460" height="440" fill="url(#dot-grid)" />

          <ProofCard activeScene={activeScene} />

          <motion.g
            initial={{ opacity: 0, y: 18 }}
            animate={{
              opacity: 1,
              y: 0,
              rotate: reduceMotion ? -7 : [-7, -4, -7],
            }}
            transition={{
              opacity: { duration: 0.5, ease: "easeOut", delay: 0.08 },
              y: { duration: 0.5, ease: "easeOut", delay: 0.08 },
              rotate: reduceMotion
                ? { duration: 0 }
                : { duration: 7, ease: "easeInOut", repeat: Infinity },
            }}
            style={{ transformOrigin: "240px 240px" }}
          >
            <rect
              x="88"
              y="122"
              width="304"
              height="226"
              rx="22"
              className="fill-secondary stroke-border"
              strokeWidth={1}
            />
          </motion.g>

          <motion.rect
            x="46"
            y="52"
            width="340"
            height="256"
            rx="20"
            className="fill-card stroke-border drop-shadow-[0_24px_48px_-16px_rgba(0,0,0,0.55)]"
            strokeWidth={1}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.16 }}
          />

          <motion.circle cx="74" cy="80" r="5.5" className="fill-primary" variants={fadeUp} initial="hidden" animate="visible" />
          <motion.circle cx="93" cy="80" r="5.5" className="fill-muted-foreground/40" variants={fadeUp} initial="hidden" animate="visible" />
          <motion.circle cx="112" cy="80" r="5.5" className="fill-muted-foreground/40" variants={fadeUp} initial="hidden" animate="visible" />

          <motion.line
            x1="46"
            y1="98"
            x2="386"
            y2="98"
            className="stroke-border"
            strokeWidth={1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />

          <clipPath id="scene-clip">
            <rect x="46" y="98" width="340" height="200" />
          </clipPath>

          <g clipPath="url(#scene-clip)">
            <AnimatePresence mode="wait">
              <ActiveScene key={scenes[activeScene].id} />
            </AnimatePresence>
          </g>

          <g>
            {scenes.map((scene, index) => (
              <circle
                key={scene.id}
                cx={190 + index * 16}
                cy="332"
                r={index === activeScene ? 4 : 3}
                className={index === activeScene ? "fill-primary" : "fill-muted-foreground/40"}
              />
            ))}
          </g>
        </svg>
      </motion.div>

      <TagChips />
    </div>
  );
}

export { HeroIllustration };
