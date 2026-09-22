import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/*
  The landing page's section vocabulary, shared so the inner pages speak it
  too: one eyebrow, two title scales, one lede measure, and two card frames.
*/

function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("font-mono text-xs tracking-[0.2em] text-primary uppercase", className)}>
      {children}
    </p>
  );
}

/** Page-level h1 — the hero's fluid scale. */
function HeroTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h1
      className={cn(
        "mt-5 text-balance font-heading text-[clamp(2rem,6vw,3rem)] font-semibold leading-[1.06] tracking-tight text-foreground lg:text-[clamp(2.4rem,3.3vw,3.4rem)]",
        className
      )}
    >
      {children}
    </h1>
  );
}

function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={cn(
        "mt-4 text-balance font-heading text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold leading-[1.1] tracking-tight text-foreground",
        className
      )}
    >
      {children}
    </h2>
  );
}

function Lede({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "mt-4 max-w-[46ch] text-pretty text-[0.9375rem] leading-[1.75] text-muted-foreground",
        className
      )}
    >
      {children}
    </p>
  );
}

/**
 * Always-lit frame: a 1px sapphire → border → violet gradient around an
 * opaque panel. For the one feature panel in a section.
 */
function FramedPanel({
  children,
  className,
  innerClassName,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--brand-primary),transparent_55%),var(--border)_45%,color-mix(in_oklch,var(--brand-violet),transparent_60%))] p-px shadow-[0_30px_70px_-40px_rgba(0,0,0,0.9)]",
        className
      )}
    >
      <div className={cn("h-full rounded-[calc(1rem-1px)] bg-card", innerClassName)}>
        {children}
      </div>
    </div>
  );
}

/**
 * Quiet frame that lights up on hover — for items in a grid, where every card
 * glowing at once would be noise.
 */
function HoverCard({
  children,
  className,
  innerClassName,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div
      className={cn(
        "group relative rounded-2xl bg-[linear-gradient(to_bottom,var(--border),color-mix(in_oklch,var(--border),transparent_55%))] p-px transition-[background-image,box-shadow] duration-500 hover:bg-[linear-gradient(to_bottom,var(--brand-primary),var(--brand-violet))] hover:shadow-[0_28px_60px_-30px_color-mix(in_oklch,var(--brand-primary),transparent_55%)]",
        className
      )}
    >
      <div className={cn("flex h-full flex-col rounded-[calc(1rem-1px)] bg-card", innerClassName)}>
        {children}
      </div>
    </div>
  );
}

/** Soft coloured light behind a section. Position it with `className`. */
function Bloom({
  tone = "primary",
  className,
}: {
  tone?: "primary" | "violet";
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute hidden size-[38rem] rounded-full opacity-[0.07] blur-3xl lg:block",
        tone === "primary"
          ? "bg-[radial-gradient(circle,var(--brand-primary)_0%,transparent_68%)]"
          : "bg-[radial-gradient(circle,var(--brand-violet)_0%,transparent_68%)]",
        className
      )}
    />
  );
}

/** Glowing dot used beside a headline metric. */
function MetricDot() {
  return (
    <span
      aria-hidden
      className="size-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_var(--brand-primary)]"
    />
  );
}

export { Eyebrow, HeroTitle, SectionTitle, Lede, FramedPanel, HoverCard, Bloom, MetricDot };
