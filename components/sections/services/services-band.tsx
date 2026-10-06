"use client";

import type { PointerEvent } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";

import { cn } from "@/lib/utils";
import { ContentIcon } from "@/components/shared/content-icon";
import type { ServiceLineView } from "@/lib/content/blocks/views";

/*
  The accents cycle rather than being fixed per line, because the list is
  editable: a colour tied to "Web3" would move to whatever took its place the
  first time somebody reordered the band.
*/
const ACCENTS = [
  "var(--brand-primary)",
  "var(--brand-violet)",
  "var(--brand-teal)",
] as const;

/**
 * One line of work, compact.
 *
 * No description, no link, no number — the title and a single clause. The
 * dedicated page these came from had room to explain each one; this band has
 * to answer "what else do they do?" in the two seconds somebody spends on it
 * before scrolling, and anything more is a second page pretending to be a
 * section.
 */
function Line({ line, index }: { line: ServiceLineView; index: number }) {
  const reduceMotion = useReducedMotion();
  const accent = ACCENTS[index % ACCENTS.length];

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spotlight = useMotionTemplate`radial-gradient(14rem circle at ${x}px ${y}px, color-mix(in oklab, ${accent} 11%, transparent), transparent 70%)`;

  function track(event: PointerEvent<HTMLElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - box.left);
    y.set(event.clientY - box.top);
  }

  return (
    <motion.li
      initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={reduceMotion ? undefined : track}
      className="group relative flex items-start gap-3.5 overflow-hidden rounded-xl border border-border bg-card p-4 transition-colors duration-300 hover:border-primary/30"
    >
      <motion.span
        aria-hidden
        style={reduceMotion ? undefined : { background: spotlight }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <span
        className="relative flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background transition-colors duration-300"
        style={{ color: accent }}
      >
        <ContentIcon name={line.iconName} className="size-[1.125rem]" strokeWidth={1.75} />
      </span>

      <span className="relative min-w-0">
        <span className="block font-heading text-sm font-semibold tracking-tight text-foreground">
          {line.title}
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
          {line.summary}
        </span>
      </span>
    </motion.li>
  );
}

/**
 * Everything else the team takes on, as one band on the homepage.
 *
 * This replaced a whole /services page. The page was a reasonable idea and the
 * wrong shape: seven lines of work, three of which already have their own
 * section or page on this site, do not need a destination of their own — they
 * need to be visible to somebody who is already here. A page nobody navigates
 * to answers the question later than the question gets asked.
 *
 * The content is the same editable list the page used, so nothing was thrown
 * away in the move and it is still edited in one place.
 */
function ServicesBand({
  lines,
  heading,
}: {
  lines: ServiceLineView[];
  heading: { eyebrow: string; title: string; lede?: string };
}) {
  if (lines.length === 0) return null;

  return (
    <ul
      className={cn(
        "mt-10 grid gap-3 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3",
        /* Seven into three columns leaves one on its own row. Letting the last
           one span two columns on a wide screen closes the gap without
           pretending there are eight. */
        "[&>li:last-child]:lg:col-span-2 [&>li:nth-last-child(2)]:sm:col-span-2 [&>li:nth-last-child(2)]:lg:col-span-1"
      )}
      aria-label={heading.title}
    >
      {lines.map((line, index) => (
        <Line key={line.title} line={line} index={index} />
      ))}
    </ul>
  );
}

export { ServicesBand };
