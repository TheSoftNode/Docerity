"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { pairs } from "@/components/sections/explainers/explainers-data";
import { CornerBrackets } from "@/components/sections/explainers/explainer-corner-brackets";

const PAIR_INTERVAL = 4200;

function Panel({
  kicker,
  label,
  caption,
  Icon,
  align,
}: {
  kicker: string;
  label: string;
  caption: string;
  Icon: (typeof pairs)[number]["concept"]["Icon"];
  align: "left" | "right";
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={`flex flex-1 flex-col items-center gap-3 text-center ${
        align === "left" ? "sm:items-end sm:text-right" : "sm:items-start sm:text-left"
      }`}
    >
      <p className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
        {kicker}
      </p>

      <div className="relative flex size-16 items-center justify-center">
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full border border-dashed border-primary/30"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 18, ease: "linear", repeat: Infinity }}
        />
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
          className="flex size-12 items-center justify-center rounded-2xl border border-border bg-card"
        >
          <Icon className="size-6 text-primary" strokeWidth={1.75} />
        </motion.div>
      </div>

      <div>
        <p className="font-heading text-lg font-medium text-foreground sm:text-xl">{label}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{caption}</p>
      </div>
    </div>
  );
}

function Connector() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex h-12 w-16 shrink-0 items-center justify-center sm:h-full sm:w-20">
      <div className="flex h-full w-full items-center justify-center gap-1.5 sm:flex-col">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-1 rounded-full bg-primary"
            animate={
              reduceMotion
                ? { opacity: 0.4 }
                : { opacity: [0.25, 1, 0.25], scale: [1, 1.4, 1] }
            }
            transition={{
              duration: 1.6,
              ease: "easeInOut",
              repeat: Infinity,
              delay: i * 0.25,
            }}
          />
        ))}
      </div>

      <motion.span
        className="absolute flex size-9 items-center justify-center rounded-full border border-primary/40 bg-background font-heading text-sm text-primary"
        animate={reduceMotion ? undefined : { scale: [1, 1.12, 1] }}
        transition={{ duration: 2.4, ease: "easeInOut", repeat: Infinity }}
      >
        &asymp;
      </motion.span>
    </div>
  );
}

function ProgressTrack({ isActive }: { isActive: boolean }) {
  return (
    <span className="h-1 w-8 overflow-hidden rounded-full bg-muted-foreground/20">
      {isActive && (
        <motion.span
          key="fill"
          className="block h-full rounded-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: PAIR_INTERVAL / 1000, ease: "linear" }}
        />
      )}
    </span>
  );
}

function ExplainerStage() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    /*
      Auto-advance stops under reduced motion, matching every other timed
      component here. Swapping the pair out from under someone mid-sentence is
      movement they did not ask for, and it also made this section's visual
      snapshot unstable: the screenshot caught whichever pair happened to be
      showing.
    */
    if (reduceMotion) return;

    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % pairs.length);
    }, PAIR_INTERVAL);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  const pair = pairs[active];

  return (
    <div>
      <div className="relative rounded-3xl border border-border bg-card/90 px-6 py-10 shadow-[0_30px_70px_-35px_rgba(0,0,0,0.8)] backdrop-blur-sm sm:px-10 sm:py-14">
        <CornerBrackets />

        <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={pair.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex w-full flex-col items-center gap-5 sm:flex-row sm:gap-2"
            >
              <Panel
                kicker="The concept"
                label={pair.concept.label}
                caption={pair.concept.caption}
                Icon={pair.concept.Icon}
                align="left"
              />
              <Connector />
              <Panel
                kicker="Like this"
                label={pair.analogy.label}
                caption={pair.analogy.caption}
                Icon={pair.analogy.Icon}
                align="right"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2">
        {pairs.map((p, index) => (
          <ProgressTrack key={`${p.id}-${index === active}`} isActive={index === active} />
        ))}
      </div>
    </div>
  );
}

export { ExplainerStage };
