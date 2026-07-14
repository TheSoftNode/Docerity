"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.11, delayChildren: 0.15 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const popIn: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const drawLine: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.55, ease: "easeInOut" },
  },
};

const growBar: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const codeLines = [
  { width: 132, tone: "muted" as const },
  { width: 196, tone: "faint" as const },
  { width: 96, tone: "highlight" as const },
  { width: 168, tone: "faint" as const },
  { width: 118, tone: "muted" as const },
];

const barFill: Record<(typeof codeLines)[number]["tone"], string> = {
  muted: "fill-muted-foreground/60",
  faint: "fill-muted-foreground/30",
  highlight: "fill-primary",
};

const graphNodes = [
  { cx: 344, cy: 226 },
  { cx: 334, cy: 288 },
  { cx: 276, cy: 292 },
];

function HeroIllustration() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
      transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
      className="relative mx-auto aspect-square w-full max-w-sm"
    >
      <motion.svg
        viewBox="0 0 480 480"
        className="h-full w-full overflow-visible"
        aria-hidden
        initial={reduceMotion ? "visible" : "hidden"}
        animate="visible"
        variants={container}
      >
        <defs>
          <pattern id="dot-grid" width="26" height="26" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="1.5" className="fill-foreground/10" />
          </pattern>
        </defs>

        <rect x="20" y="30" width="440" height="420" fill="url(#dot-grid)" />

        <motion.g variants={fadeUp} style={{ transformOrigin: "240px 240px" }}>
          <motion.g
            animate={reduceMotion ? undefined : { rotate: [-6, -3.5, -6] }}
            transition={{ duration: 7, ease: "easeInOut", repeat: Infinity }}
            style={{ transformOrigin: "240px 240px" }}
          >
            <rect
              x="94"
              y="132"
              width="292"
              height="216"
              rx="22"
              className="fill-secondary stroke-border"
              strokeWidth={1}
            />
          </motion.g>
        </motion.g>

        <motion.rect
          x="56"
          y="66"
          width="320"
          height="238"
          rx="20"
          className="fill-card stroke-border"
          strokeWidth={1}
          variants={fadeUp}
        />

        <motion.circle cx="84" cy="94" r="5.5" className="fill-primary" variants={popIn} />
        <motion.circle cx="103" cy="94" r="5.5" className="fill-muted-foreground/40" variants={popIn} />
        <motion.circle cx="122" cy="94" r="5.5" className="fill-muted-foreground/40" variants={popIn} />

        <motion.line
          x1="56"
          y1="112"
          x2="376"
          y2="112"
          className="stroke-border"
          strokeWidth={1}
          variants={drawLine}
        />

        {codeLines.map((line, index) =>
          line.tone === "highlight" ? (
            <motion.g
              key={index}
              variants={growBar}
              style={{ transformOrigin: "82px 0px" }}
            >
              <motion.rect
                x="82"
                y={138 + index * 22}
                height="8"
                width={line.width}
                rx="4"
                className={barFill[line.tone]}
                animate={reduceMotion ? undefined : { opacity: [1, 0.45, 1] }}
                transition={{ duration: 3.2, ease: "easeInOut", repeat: Infinity }}
              />
            </motion.g>
          ) : (
            <motion.rect
              key={index}
              x="82"
              y={138 + index * 22}
              height="8"
              width={line.width}
              rx="4"
              className={barFill[line.tone]}
              style={{ transformOrigin: "82px 0px" }}
              variants={growBar}
            />
          )
        )}

        <motion.g variants={fadeUp}>
          {graphNodes.map((node, index) => (
            <motion.line
              key={index}
              x1="302"
              y1="256"
              x2={node.cx}
              y2={node.cy}
              className="stroke-border"
              strokeWidth={1.5}
              variants={drawLine}
            />
          ))}
        </motion.g>

        {graphNodes.map((node, index) => (
          <motion.circle
            key={index}
            cx={node.cx}
            cy={node.cy}
            r="6"
            className="fill-foreground"
            variants={popIn}
          />
        ))}

        <motion.g variants={popIn} style={{ transformOrigin: "302px 256px" }}>
          <motion.circle
            cx="302"
            cy="256"
            r="9"
            className="fill-primary"
            animate={reduceMotion ? undefined : { scale: [1, 1.18, 1] }}
            transition={{ duration: 2.6, ease: "easeInOut", repeat: Infinity }}
            style={{ transformOrigin: "302px 256px" }}
          />
        </motion.g>
      </motion.svg>
    </motion.div>
  );
}

export { HeroIllustration };
