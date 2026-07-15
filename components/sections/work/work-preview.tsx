"use client";

import { motion, type Variants } from "framer-motion";

const container: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const popIn: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: "easeOut" } },
};

const growUp: Variants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

const slideIn: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const drawLine: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1, transition: { duration: 0.7, ease: "easeInOut" } },
};

function Chrome() {
  return (
    <>
      <rect x="0" y="0" width="400" height="28" className="fill-secondary" />
      <circle cx="16" cy="14" r="4" className="fill-primary" />
      <circle cx="30" cy="14" r="4" className="fill-muted-foreground/40" />
      <circle cx="44" cy="14" r="4" className="fill-muted-foreground/40" />
    </>
  );
}

const bars = [
  { x: 40, height: 44 },
  { x: 96, height: 68 },
  { x: 152, height: 34 },
  { x: 208, height: 84, highlight: true },
  { x: 264, height: 52 },
  { x: 320, height: 60 },
];

function DashboardPreview() {
  return (
    <motion.svg
      viewBox="0 0 400 200"
      className="h-full w-full"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <rect x="0" y="0" width="400" height="200" className="fill-card" />
      <Chrome />

      <motion.path
        d="M 36 70 L 92 88 L 148 58 L 204 66 L 260 40 L 316 52"
        fill="none"
        className="stroke-primary/70"
        strokeWidth={2}
        variants={drawLine}
      />

      {bars.map((bar) => (
        <motion.rect
          key={bar.x}
          x={bar.x}
          y={172 - bar.height}
          width="28"
          height={bar.height}
          rx="4"
          className={bar.highlight ? "fill-primary" : "fill-muted-foreground/30"}
          style={{ transformOrigin: `${bar.x + 14}px 172px` }}
          variants={growUp}
        />
      ))}
    </motion.svg>
  );
}

const gridCells = [
  { x: 32, y: 44 },
  { x: 152, y: 44 },
  { x: 272, y: 44, highlight: true },
  { x: 32, y: 124 },
  { x: 152, y: 124 },
  { x: 272, y: 124 },
];

function GridPreview() {
  return (
    <motion.svg
      viewBox="0 0 400 200"
      className="h-full w-full"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <rect x="0" y="0" width="400" height="200" className="fill-card" />
      <Chrome />

      {gridCells.map((cell) => (
        <motion.rect
          key={`${cell.x}-${cell.y}`}
          x={cell.x}
          y={cell.y}
          width="96"
          height="60"
          rx="8"
          className={
            cell.highlight
              ? "fill-primary/15 stroke-primary/60"
              : "fill-muted-foreground/10 stroke-border"
          }
          strokeWidth={1}
          variants={popIn}
        />
      ))}
    </motion.svg>
  );
}

const rows = [
  { y: 48, highlight: true },
  { y: 92 },
  { y: 136 },
];

function ListPreview() {
  return (
    <motion.svg
      viewBox="0 0 400 200"
      className="h-full w-full"
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <rect x="0" y="0" width="400" height="200" className="fill-card" />
      <Chrome />

      {rows.map((row) => (
        <motion.g key={row.y} variants={slideIn}>
          <circle
            cx="52"
            cy={row.y}
            r="14"
            className={row.highlight ? "fill-primary" : "fill-muted-foreground/30"}
          />
          <rect x="80" y={row.y - 9} width="140" height="8" rx="4" className="fill-foreground/70" />
          <rect x="80" y={row.y + 5} width="90" height="6" rx="3" className="fill-muted-foreground/30" />
          <circle
            cx="352"
            cy={row.y}
            r="5"
            className={row.highlight ? "fill-primary" : "fill-muted-foreground/30"}
          />
        </motion.g>
      ))}
    </motion.svg>
  );
}

const previews = {
  dashboard: DashboardPreview,
  grid: GridPreview,
  list: ListPreview,
} as const;

function WorkPreview({ variant }: { variant: keyof typeof previews }) {
  const Preview = previews[variant];
  return (
    <div className="h-44 w-full overflow-hidden rounded-t-2xl border-b border-border">
      <Preview />
    </div>
  );
}

export { WorkPreview };
