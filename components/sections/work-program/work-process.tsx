"use client";

import { motion, useReducedMotion } from "framer-motion";

import { Container } from "@/components/shared/container";
import { process } from "@/components/sections/work-program/work-program-data";

function WorkProcess() {
  const reduceMotion = useReducedMotion();
  const stops = process.map((_, index) => (index / (process.length - 1)) * 100);

  return (
    <section className="relative border-b border-border/80 bg-background py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-lg text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            How it works
          </p>
          <h2 className="mt-3 font-heading text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            From first call to shipped software.
          </h2>
        </div>

        <div className="relative mt-14">
          <div className="absolute top-5 right-0 left-0 hidden h-px bg-border sm:block" />
          <motion.span
            aria-hidden
            className="absolute top-[18px] hidden size-2 rounded-full bg-primary sm:block"
            initial={{ left: "0%", opacity: 0 }}
            animate={
              reduceMotion
                ? { left: "0%", opacity: 0.8 }
                : { left: stops.map((s) => `${s}%`), opacity: [0, 1, 1, 1, 0] }
            }
            transition={{
              duration: 4.5,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 0.8,
            }}
            style={{ transform: "translateX(-50%)" }}
          />

          <div className="grid gap-8 sm:grid-cols-4 sm:gap-6">
            {process.map((step, index) => (
              <div key={step.title} className="relative flex flex-col items-start sm:items-center sm:text-center">
                <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-background text-primary">
                  <step.Icon className="size-4" />
                </span>
                <p className="mt-4 font-mono text-xs tracking-[0.15em] text-primary uppercase">
                  0{index + 1}
                </p>
                <h3 className="mt-1 font-heading text-base font-medium text-foreground">
                  {step.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground sm:px-2">
                  {step.summary}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export { WorkProcess };
