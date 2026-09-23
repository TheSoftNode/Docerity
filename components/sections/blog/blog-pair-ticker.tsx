"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { explainerPosts } from "@/components/sections/blog/blog-data";

const INTERVAL = 3400;

/**
 * The blog's premise, demonstrated rather than described: a real concept
 * beside the everyday thing it works like, cycling through the actual posts.
 *
 * Replaces a static paragraph that said the same thing in words. Each pair is
 * read from `explainerPosts`, so it can never drift from the published set.
 */
function BlogPairTicker() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(
      () => setActive((current) => (current + 1) % explainerPosts.length),
      INTERVAL
    );
    return () => window.clearInterval(id);
  }, [reduceMotion, active]);

  const post = explainerPosts[active];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative min-h-[3.25rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={post.slug}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="flex items-center gap-3"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground">
              <post.concept.Icon className="size-4" strokeWidth={1.75} />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-mono text-[0.6875rem] tracking-[0.12em] text-muted-foreground uppercase">
                {post.concept.label}
              </span>
              <span className="block truncate text-sm font-semibold text-foreground">
                {post.analogy.label}
              </span>
            </span>
            <span aria-hidden className="ml-auto flex shrink-0 items-center gap-1.5">
              {[0, 1, 2].map((dot) => (
                <motion.span
                  key={dot}
                  className="size-1 rounded-full bg-primary"
                  animate={reduceMotion ? { opacity: 0.4 } : { opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: dot * 0.2 }}
                />
              ))}
            </span>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
              <post.analogy.Icon className="size-4" strokeWidth={1.75} />
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress across the set, doubling as a position readout. */}
      <div className="flex items-center gap-2">
        <span className="h-px flex-1 overflow-hidden bg-border">
          <motion.span
            key={active}
            className="block h-full bg-[linear-gradient(to_right,var(--brand-primary),var(--brand-violet))]"
            initial={{ width: "0%" }}
            animate={{ width: reduceMotion ? "0%" : "100%" }}
            transition={{ duration: INTERVAL / 1000, ease: "linear" }}
          />
        </span>
        <span className="font-mono text-[0.625rem] text-muted-foreground tabular-nums">
          {String(active + 1).padStart(2, "0")} / {String(explainerPosts.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

export { BlogPairTicker };
