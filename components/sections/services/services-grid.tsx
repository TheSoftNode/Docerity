"use client";

import type { PointerEvent } from "react";
import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { ContentIcon } from "@/components/shared/content-icon";
import { anchorFor } from "@/components/sections/services/anchor";
import type { ServiceLineView } from "@/lib/content/blocks/views";

/*
  How many lines are treated as the ones we build.

  The section's own heading is "What we build, and what we run alongside it" —
  two groups — and the page used to render one undifferentiated grid of seven
  identical boxes, which contradicted it and left a dangling card in a
  two-column layout. The first three are the build disciplines; the rest run
  alongside them. Taken from the front of the list rather than flagged per
  line, so the order set in the admin decides, and nothing has to be re-tagged
  when a line is added or moved.
*/
const BUILD_LINES = 3;

/* One accent per build card. Three cards in the same blue read as a
   spreadsheet; the colour is what makes somebody look at the second one. */
const ACCENTS = [
  {
    border: "hover:border-primary/40",
    chip: "border-primary/30 bg-primary/10 text-primary",
    rule: "from-primary/70",
    light: "var(--brand-primary)",
  },
  {
    border: "hover:border-brand-violet/40",
    chip: "border-brand-violet/30 bg-brand-violet/10 text-brand-violet",
    rule: "from-brand-violet/70",
    light: "var(--brand-violet)",
  },
  {
    border: "hover:border-brand-teal/40",
    chip: "border-brand-teal/30 bg-brand-teal/10 text-brand-teal",
    rule: "from-brand-teal/70",
    light: "var(--brand-teal)",
  },
] as const;

/* Each card enters a beat after the one before it, so the row reads left to
   right instead of arriving as a single slab. */
function reveal(index: number, reduceMotion: boolean) {
  if (reduceMotion) return {};
  return {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.25 },
    transition: { duration: 0.5, delay: index * 0.09, ease: [0.22, 1, 0.36, 1] as const },
  };
}

/**
 * A build discipline.
 *
 * The light follows the pointer across the card rather than sitting in a fixed
 * corner. A static glow is a texture somebody stops seeing; one that tracks
 * the cursor makes the card feel like a surface being touched, and it costs
 * two motion values and no re-renders — the gradient is written straight to
 * style, so moving the mouse never renders React.
 */
function BuildCard({ line, index }: { line: ServiceLineView; index: number }) {
  const reduceMotion = useReducedMotion();
  const accent = ACCENTS[index % ACCENTS.length];

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spotlight = useMotionTemplate`radial-gradient(22rem circle at ${x}px ${y}px, color-mix(in oklab, ${accent.light} 13%, transparent), transparent 70%)`;

  function track(event: PointerEvent<HTMLElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - box.left);
    y.set(event.clientY - box.top);
  }

  return (
    <motion.article
      {...reveal(index, Boolean(reduceMotion))}
      onPointerMove={reduceMotion ? undefined : track}
      id={anchorFor(line.title)}
      className={cn(
        "group relative flex scroll-mt-[var(--nav-h)] flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-colors duration-300 sm:p-7",
        accent.border
      )}
    >
      {/* Only on hover, so a still page is not three cards glowing at once. */}
      <motion.span
        aria-hidden
        style={reduceMotion ? undefined : { background: spotlight }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent",
          accent.rule
        )}
      />

      <div className="relative flex items-start justify-between gap-4">
        <span
          className={cn(
            "flex size-12 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:-translate-y-0.5",
            accent.chip
          )}
        >
          <ContentIcon name={line.iconName} className="size-5" strokeWidth={1.75} />
        </span>
        <span
          aria-hidden
          className="font-heading text-4xl leading-none font-semibold text-foreground/[0.07] transition-colors duration-300 group-hover:text-foreground/[0.12]"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <h3 className="relative mt-6 font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {line.title}
      </h3>
      <p className="relative mt-2 text-sm font-medium text-foreground/70">{line.summary}</p>
      <p className="relative mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
        {line.description}
      </p>

      {/* Only where a page exists. A "see more" that goes nowhere is worse than
          no link. */}
      {line.href ? (
        <Link
          href={line.href}
          className="relative mt-6 inline-flex items-center gap-1.5 border-t border-border/80 pt-4 text-sm text-foreground transition-colors hover:text-primary"
        >
          See the projects
          <ArrowRightIcon className="size-3.5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </motion.article>
  );
}

/** A supporting line: compact, four across, no numbering competing with the
    build cards above. */
function SupportCard({ line, index }: { line: ServiceLineView; index: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      {...reveal(index, Boolean(reduceMotion))}
      id={anchorFor(line.title)}
      className="group flex scroll-mt-[var(--nav-h)] flex-col rounded-2xl border border-border bg-card p-5 transition-colors duration-300 hover:border-primary/30 sm:p-6"
    >
      <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors duration-300 group-hover:border-primary/30 group-hover:text-primary">
        <ContentIcon name={line.iconName} className="size-[1.125rem]" strokeWidth={1.75} />
      </span>
      <h3 className="mt-4 font-heading text-base font-semibold tracking-tight text-foreground">
        {line.title}
      </h3>
      <p className="mt-1.5 text-xs font-medium text-primary">{line.summary}</p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {line.description}
      </p>
      {line.href ? (
        <Link
          href={line.href}
          className="mt-4 inline-flex items-center gap-1.5 text-xs text-foreground transition-colors hover:text-primary"
        >
          See the projects
          <ArrowRightIcon className="size-3 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </motion.article>
  );
}

/** The two groups, rendered. Content is resolved on the server and handed
    down; everything here is motion, so it runs in the browser. */
function ServicesGrid({ lines }: { lines: ServiceLineView[] }) {
  const build = lines.slice(0, BUILD_LINES);
  const alongside = lines.slice(BUILD_LINES);

  return (
    <>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-6">
        {build.map((line, index) => (
          <BuildCard key={line.title} line={line} index={index} />
        ))}
      </div>

      {alongside.length > 0 ? (
        <div className="mt-14 lg:mt-16">
          <div className="flex items-center gap-4">
            <h3 className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
              And what runs alongside it
            </h3>
            <span aria-hidden className="h-px flex-1 bg-border" />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {alongside.map((line, index) => (
              <SupportCard key={line.title} line={line} index={index} />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

export { ServicesGrid };
