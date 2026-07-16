"use client";

import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { ArrowUpRightIcon } from "lucide-react";

import type { projects } from "@/components/sections/work/work-data";
import { WorkPreview } from "@/components/sections/work/work-preview";

const MAX_TILT = 5;

function WorkCard({
  project,
  index,
}: {
  project: (typeof projects)[number];
  index: number;
}) {
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLElement>(null);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (reduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(relX * MAX_TILT * 2);
    rotateX.set(-relY * MAX_TILT * 2);
  };

  const handlePointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.article
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: "easeOut", delay: index * 0.1 }}
      style={{
        rotateX: springX,
        rotateY: springY,
        transformPerspective: 900,
      }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40"
    >
      <WorkPreview variant={project.preview} />

      <div className="relative p-8">
        <span
          aria-hidden
          className="pointer-events-none absolute top-0 right-4 font-heading text-[6rem] leading-none font-medium text-foreground/[0.04] transition-colors duration-300 group-hover:text-primary/[0.08]"
        >
          {project.index}
        </span>

        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          {project.category}
        </p>

        <h3 className="mt-3 font-heading text-2xl font-medium text-foreground">
          {project.name}
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {project.description}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <p className="font-heading text-sm font-medium text-primary">
            {project.metric}
          </p>
          <Link
            href={`/work/${project.slug}`}
            className="inline-flex items-center gap-1 text-sm text-foreground/80 transition-colors hover:text-foreground"
          >
            View case study
            <ArrowUpRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export { WorkCard };
