"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
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

const MAROON_CLIP = "polygon(68% 0%, 100% 0%, 100% 100%, 52% 100%)";

const floatingTags = [
  { label: "Postgres", top: "12%", left: "78%", delay: 0.5, floatDelay: 1.8 },
  { label: "React Native", top: "88%", left: "80%", delay: 0.7, floatDelay: 0.6 },
  { label: "GraphQL", top: "30%", left: "84%", delay: 0.9, floatDelay: 0.9 },
  { label: "Node.js", top: "45%", left: "90%", delay: 1.1, floatDelay: 1.5 },
] as const;

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

function WorkBackground() {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const splitY = useTransform(scrollYProgress, [0, 1], [-16, 16]);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        style={{
          y: splitY,
          clipPath: "polygon(0% 0%, 68% 0%, 52% 100%, 0% 100%)",
        }}
        className="absolute inset-0 bg-[#161d42]"
      />
      <motion.div
        style={{ y: splitY, clipPath: MAROON_CLIP }}
        className="absolute inset-0 bg-[#241119]"
      />
      <motion.div
        style={{
          y: splitY,
          clipPath: "polygon(67% 0%, 69.5% 0%, 53.5% 100%, 51% 100%)",
        }}
        className="absolute inset-0 bg-primary"
      />

      {/* Everything below is strictly confined to the maroon (right) zone. */}
      <motion.div style={{ y: splitY, clipPath: MAROON_CLIP }} className="absolute inset-0">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="absolute top-1/2 left-[72%] hidden -translate-x-1/2 -translate-y-1/2 lg:block"
        >
          <OrbitCluster icons={orbitIcons} size={860} duration={34} badgeSize={56} />
        </motion.div>

        {floatingTags.map((tag) => (
          <motion.span
            key={tag.label}
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={
              reduceMotion
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 1, scale: 1, y: [0, -10, 0] }
            }
            transition={
              reduceMotion
                ? { duration: 0.5, delay: tag.delay }
                : {
                    opacity: { duration: 0.5, delay: tag.delay },
                    scale: { duration: 0.5, delay: tag.delay },
                    y: {
                      duration: 5.5,
                      ease: "easeInOut",
                      repeat: Infinity,
                      delay: tag.delay + tag.floatDelay,
                    },
                  }
            }
            className="absolute rounded-full border border-foreground/15 bg-background/25 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-foreground/80 backdrop-blur-sm"
            style={{ top: tag.top, left: tag.left }}
          >
            {tag.label}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}

export { WorkBackground };
