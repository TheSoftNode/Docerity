"use client";

import { motion, useReducedMotion } from "framer-motion";

import { Container } from "@/components/shared/container";
import { Eyebrow, Lede, SectionTitle } from "@/components/shared/section-kit";
import { process } from "@/components/sections/work-program/work-program-data";

function WorkProcess() {
  const reduceMotion = useReducedMotion();
  const stops = process.map((_, index) => (index / (process.length - 1)) * 100);

  return (
    <section className="relative border-b border-border/80 bg-surface-raised py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>How it works</Eyebrow>
          <SectionTitle>From first call to shipped software.</SectionTitle>
          <Lede>
            Four stages, each ending in something you can look at &mdash; not a
            status update.
          </Lede>
        </div>

        <div className="relative mt-12 lg:mt-16">
          {/* The rail, and the pulse that runs along it. Horizontal only: on a
              phone the steps stack, and a track between them would just be a
              line pointing off-screen. */}
          <div className="absolute top-5 right-0 left-0 hidden h-px bg-[linear-gradient(to_right,var(--brand-primary),var(--brand-violet))] opacity-40 sm:block" />
          <motion.span
            aria-hidden
            className="absolute top-[15px] hidden size-2.5 rounded-full bg-primary shadow-[0_0_14px_var(--brand-primary)] sm:block"
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

          <ol className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4 lg:gap-6">
            {process.map((step, index) => (
              <li key={step.title} className="relative flex flex-col items-start">
                <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-surface-raised text-primary">
                  <step.Icon className="size-4" strokeWidth={1.75} />
                </span>
                {/* The summary reads as a sentence under the title. Set as
                    uppercase mono next to the number it wrapped to two lines
                    and pushed each step's title to a different height. */}
                <p className="mt-5 font-mono text-[0.6875rem] tracking-[0.16em] text-muted-foreground uppercase">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 font-heading text-lg font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm font-medium text-primary">{step.summary}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

export { WorkProcess };
