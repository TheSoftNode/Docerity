"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { ContentIcon } from "@/components/shared/content-icon";
import { anchorFor } from "@/components/sections/services/anchor";
import type { ServiceLineView } from "@/lib/content/blocks/views";

/** How long each line holds focus before the panel moves on. */
const INTERVAL = 3400;

/**
 * The lines of work, as a panel that walks through itself.
 *
 * The right half of this hero was empty, and the first question somebody
 * arrives with is "do you do the thing I need?" — which the page answered only
 * after a scroll past two stacked heading blocks.
 *
 * It cycles rather than sitting still because the headline is "one team, for
 * the parts a project actually needs": the panel showing one part at a time
 * and moving on is that sentence happening. A static list of seven rows is
 * something a reader skims and forgets; one line at a time, each holding focus
 * long enough to read its summary, is something they follow.
 *
 * Hovering takes it over — the row under the pointer becomes the active one and
 * the timer stops — so it never fights somebody who is already reading.
 * Clicking jumps to the card that explains it, which is what makes this
 * navigation rather than decoration.
 */
function ServicesIndex({ lines }: { lines: ServiceLineView[] }) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (reduceMotion || held || lines.length < 2) return;

    const id = window.setInterval(
      () => setActive((current) => (current + 1) % lines.length),
      INTERVAL
    );
    return () => window.clearInterval(id);
    /* `.length`, not the array: the parent builds a fresh array every render,
       so depending on its identity would restart the timer each time and the
       panel would never advance. */
  }, [reduceMotion, held, active, lines.length]);

  const safeActive = active < lines.length ? active : 0;

  return (
    <div
      className="relative rounded-2xl border border-border bg-card/70 p-2 backdrop-blur-sm"
      onMouseLeave={() => setHeld(false)}
    >
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <p className="font-mono text-[0.625rem] tracking-[0.16em] text-muted-foreground uppercase">
          What we take on
        </p>
        <p className="font-mono text-[0.625rem] tabular-nums text-muted-foreground/60">
          {String(safeActive + 1).padStart(2, "0")} / {String(lines.length).padStart(2, "0")}
        </p>
      </div>

      <ul className="relative">
        {lines.map((line, index) => {
          const isActive = index === safeActive;

          return (
            <li key={line.title} className="relative">
              <Link
                href={`#${anchorFor(line.title)}`}
                onMouseEnter={() => {
                  setHeld(true);
                  setActive(index);
                }}
                onFocus={() => {
                  setHeld(true);
                  setActive(index);
                }}
                className="relative flex items-start gap-3 rounded-xl px-4 py-2.5"
              >
                {/* One element that slides between rows rather than seven that
                    fade in and out, so the eye tracks a single moving thing. */}
                {isActive ? (
                  <motion.span
                    aria-hidden
                    layoutId="services-index-active"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 38 }
                    }
                    className="absolute inset-0 rounded-xl border border-primary/25 bg-primary/[0.08]"
                  />
                ) : null}

                <span
                  className={cn(
                    "relative flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-300",
                    isActive
                      ? "border-primary/40 bg-primary/15 text-primary"
                      : "border-border bg-background text-muted-foreground"
                  )}
                >
                  <ContentIcon name={line.iconName} className="size-4" strokeWidth={1.75} />
                </span>

                <span className="relative min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate text-sm font-medium transition-colors duration-300",
                      isActive ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {line.title}
                  </span>

                  {/*
                    The summary belongs to whichever line has focus. Its height
                    is animated rather than toggled, so the rows below settle
                    instead of jumping — seven rows snapping on a timer would be
                    worse than no motion at all.
                  */}
                  <AnimatePresence initial={false} mode="wait">
                    {isActive ? (
                      <motion.span
                        key={line.title}
                        initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: reduceMotion ? 0 : 0.28, ease: "easeOut" }}
                        className="block overflow-hidden text-xs leading-relaxed text-muted-foreground"
                      >
                        <span className="block pt-1">{line.summary}</span>
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </span>

                <span
                  aria-hidden
                  className={cn(
                    "relative mt-0.5 font-mono text-[0.625rem] tabular-nums transition-colors duration-300",
                    isActive ? "text-primary" : "text-muted-foreground/50"
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {/*
        The timer, drawn rather than described. It restarts per line via the
        key, and disappears while a pointer is holding the panel, because a
        countdown that is not counting down is a lie.
      */}
      {!reduceMotion && !held && lines.length > 1 ? (
        <div className="mx-4 mt-2 mb-3 h-px overflow-hidden rounded-full bg-border">
          <motion.div
            key={safeActive}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: INTERVAL / 1000, ease: "linear" }}
            style={{ transformOrigin: "left" }}
            className="h-full bg-primary/50"
          />
        </div>
      ) : (
        <div className="h-3" />
      )}
    </div>
  );
}

export { ServicesIndex };
