"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRightIcon } from "lucide-react";

const INTERVAL = 4600;

/* Where a card sits by its distance from the front of the deck. */
const layout = [
  { x: 0, y: 0, scale: 1, opacity: 1, zIndex: 30 },
  { x: 18, y: -24, scale: 0.962, opacity: 0.62, zIndex: 20 },
  { x: 36, y: -48, scale: 0.924, opacity: 0.34, zIndex: 10 },
];

const accents = {
  primary: { text: "text-primary", ring: "group-hover/card:border-primary/50", wash: "var(--brand-primary)" },
  violet: { text: "text-brand-violet", ring: "group-hover/card:border-brand-violet/50", wash: "var(--brand-violet)" },
  teal: { text: "text-brand-teal", ring: "group-hover/card:border-brand-teal/50", wash: "var(--brand-teal)" },
} as const;

type HeroDeckItem = {
  key: string;
  /* A rendered element, not a component type: these decks are built by server
     components, and a component reference cannot cross that boundary. */
  icon: ReactNode;
  title: string;
  meta: ReactNode;
  tags?: readonly string[];
  href: string;
};

/**
 * A page hero's supporting panel, as a deck that deals itself.
 *
 * Only the front card is interactive; the ones behind are `aria-hidden` and
 * out of the tab order, or a keyboard user would tab through links to cards
 * they cannot see. Under reduced motion it stops cycling and the indicators
 * become the only way through, so every item stays reachable.
 */
function HeroDeck({
  label,
  countLabel,
  items,
  accent = "primary",
}: {
  label: string;
  countLabel: string;
  items: readonly HeroDeckItem[];
  accent?: keyof typeof accents;
}) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const tone = accents[accent];

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(
      () => setActive((current) => (current + 1) % items.length),
      INTERVAL
    );
    return () => window.clearInterval(id);
  }, [reduceMotion, active, items.length]);

  return (
    <div>
      <div className="mb-12 flex items-center justify-between">
        <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-muted-foreground uppercase">
          {label}
        </p>
        <p className="font-mono text-[0.6875rem] text-muted-foreground">{countLabel}</p>
      </div>

      <div className="relative aspect-[16/12] w-full sm:aspect-[16/10]">
        {items.map((item, index) => {
          const position = (index - active + items.length) % items.length;
          const style = layout[Math.min(position, layout.length - 1)];
          const isFront = position === 0;

          return (
            <motion.article
              key={item.key}
              aria-hidden={!isFront}
              className="absolute inset-0 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_70px_-40px_rgba(0,0,0,0.85)]"
              animate={style}
              transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "bottom center" }}
            >
              <Link
                href={item.href}
                tabIndex={isFront ? 0 : -1}
                className="group/card flex h-full flex-col outline-none"
              >
                {/* Accent wash instead of a screenshot; these pages have no
                    per-item artwork, so the icon carries the card. */}
                <div className="relative flex flex-1 items-center justify-center overflow-hidden border-b border-border/70">
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.14]"
                    style={{ backgroundImage: `radial-gradient(circle at 50% 120%, ${tone.wash} 0%, transparent 62%)` }}
                  />
                  <span
                    aria-hidden
                    className="absolute top-4 right-5 font-heading text-5xl leading-none font-semibold text-foreground/[0.07]"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`relative flex size-16 items-center justify-center rounded-2xl border border-border bg-background transition-colors duration-300 ${tone.text} ${tone.ring}`}
                  >
                    {item.icon}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-heading text-lg font-semibold tracking-tight text-foreground">
                        {item.title}
                      </p>
                      <div className="mt-1 text-sm text-muted-foreground">{item.meta}</div>
                    </div>
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-all duration-300 group-hover/card:border-primary/50 group-hover/card:text-foreground">
                      <ArrowUpRightIcon className="size-4" />
                    </span>
                  </div>

                  {item.tags ? (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full border border-border/80 px-2.5 py-1 text-xs text-muted-foreground"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </Link>
            </motion.article>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-2">
        {items.map((item, index) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Show ${item.title}`}
            aria-pressed={index === active}
            className="h-1 flex-1 overflow-hidden rounded-full bg-border transition-colors"
          >
            <span
              className={
                index === active
                  ? "block h-full w-full rounded-full bg-[linear-gradient(to_right,var(--brand-primary),var(--brand-violet))]"
                  : "block h-full w-0"
              }
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export { HeroDeck, type HeroDeckItem };
