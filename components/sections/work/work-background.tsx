"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  BracesIcon,
  Code2Icon,
  CpuIcon,
  DatabaseIcon,
  GitBranchIcon,
  LayersIcon,
  PackageIcon,
  ServerIcon,
  TerminalIcon,
} from "lucide-react";

import { OrbitCluster } from "@/components/sections/work/work-orbit";

const orbitIcons = [
  Code2Icon,
  GitBranchIcon,
  TerminalIcon,
  CpuIcon,
  ServerIcon,
  LayersIcon,
  DatabaseIcon,
  BracesIcon,
  PackageIcon,
];

/* Two navy fields a single step apart, divided by a luminous hairline rather
   than a slab of colour. The old version put a thick amber slash between navy
   and maroon, so a card landing on the boundary looked severed; a one-pixel
   seam between near-identical tones reads as depth and simply disappears
   behind anything opaque. */
const LEFT_ZONE = "polygon(0% 0%, 66% 0%, 50% 100%, 0% 100%)";
const RIGHT_ZONE = "polygon(66% 0%, 100% 0%, 100% 100%, 50% 100%)";

function WorkBackground() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const driftY = useTransform(scrollYProgress, [0, 1], [-26, 26]);
  const orbitY = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-surface-raised" />

      <motion.div
        style={{ y: driftY, clipPath: LEFT_ZONE }}
        className="absolute inset-[-3rem] bg-surface-step-a"
      />
      <motion.div
        style={{ y: driftY, clipPath: RIGHT_ZONE }}
        className="absolute inset-[-3rem] bg-surface-step-b"
      />

      {/* The seam itself — a gradient hairline, brightest at the top. */}
      <motion.div
        style={{
          y: driftY,
          clipPath: "polygon(65.9% 0%, 66.1% 0%, 50.1% 100%, 49.9% 100%)",
        }}
        className="absolute inset-[-3rem] bg-[linear-gradient(to_bottom,var(--brand-primary),var(--brand-violet)_45%,transparent_85%)] opacity-[0.18]"
      />

      {/* Fine texture across the whole band. */}
      <div
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--foreground) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage:
            "radial-gradient(120% 90% at 50% 0%, black 0%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(120% 90% at 50% 0%, black 0%, transparent 75%)",
          opacity: 0.04,
        }}
      />

      {/* Blooms on the opposite side to the hero's, so scrolling between the
          two reads as one lit surface rather than two stacked panels. */}
      <div className="absolute top-0 left-0 hidden h-[42rem] w-[42rem] -translate-x-1/3 -translate-y-1/3 rounded-full bg-[radial-gradient(circle,var(--brand-violet)_0%,transparent_68%)] opacity-[0.07] blur-3xl lg:block" />
      <div className="absolute right-0 bottom-0 hidden h-[36rem] w-[36rem] translate-x-1/4 translate-y-1/3 rounded-full bg-[radial-gradient(circle,var(--brand-primary)_0%,transparent_68%)] opacity-[0.06] blur-3xl lg:block" />

      {/*
        Clipped to the right zone and held back to `2xl`, which is how it
        behaved originally. Unclipped at `xl` the ring was wider than the space
        beside the cards, so all that surfaced in the open area next to the
        heading were two stray badges — it read as loose icons drifting across
        the section rather than as an orbit sitting behind it.
      */}
      <motion.div
        style={{ y: orbitY, clipPath: RIGHT_ZONE }}
        className="absolute inset-0 hidden 2xl:block"
      >
        <div className="absolute top-1/2 right-[-14%] -translate-y-1/2 opacity-[0.14]">
          <OrbitCluster icons={orbitIcons} size={720} duration={34} badgeSize={50} />
        </div>
      </motion.div>
    </div>
  );
}

export { WorkBackground, orbitIcons };
