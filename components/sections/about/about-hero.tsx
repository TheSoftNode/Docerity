"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRightIcon, ClockIcon, MapPinIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { ScrambleText } from "@/components/shared/scramble-text";
import { Button } from "@/components/ui/button";
import { Bloom, Eyebrow, HeroTitle, Lede } from "@/components/shared/section-kit";
import { facts, founder } from "@/components/sections/about/about-data";

/*
  A single wide column, with the numbers as a strip along the foot.

  Two earlier versions put something in a right-hand column — first a bordered
  panel of statistics, then a portrait. The panel was a table where an
  introduction should be, and the portrait made the page about the person's
  face rather than the work. Neither earned half the hero. Giving the headline
  the full measure and letting the facts run as a strip reads as one
  deliberate band instead of two columns competing.
*/
function AboutHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background">
      <Bloom className="top-0 right-0 translate-x-1/3 -translate-y-1/2" />
      <Bloom tone="violet" className="bottom-0 left-0 -translate-x-1/3 translate-y-1/2" />

      {/* A faint grid that fades out downward, so the band has texture without
          the headline sitting on a visible mesh. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(120% 80% at 50% 0%, black 0%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(120% 80% at 50% 0%, black 0%, transparent 70%)",
        }}
      />

      <Container className="relative pt-12 pb-10 lg:pb-12">
        <div>
          <Eyebrow>
            <ScrambleText text="About Docerity" />
          </Eyebrow>
          {/* 24ch rather than 18: at 18 the headline broke to three lines and
              stopped well short of the shell, leaving the right half of the
              band empty. */}
          <HeroTitle className="max-w-[24ch]">
            One engineer, three habits:{" "}
            <span className="text-brand-violet">build, explain, teach.</span>
          </HeroTitle>
          <Lede className="mt-6 max-w-[54ch] text-base">
            Docerity is the company around work I have been doing for years —
            shipping production software, writing the explanation that makes it
            make sense, and mentoring the engineers who will maintain it.
          </Lede>

          {/* The actions and the meta sit on one row that spans the shell, so
              the copy block is anchored across the full width instead of
              trailing off two thirds of the way across. */}
          <div className="mt-9 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="h-11 w-full px-6 text-sm sm:w-auto"
                nativeButton={false}
                render={<Link href="/contact" />}
              >
                Start a project
                <ArrowRightIcon />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 w-full px-6 text-sm sm:w-auto"
                nativeButton={false}
                render={<Link href="#profile" />}
              >
                See the track record
              </Button>
            </div>

            {/* Location and time zone: the two questions a distributed client
                asks first. Phone numbers live on /contact only. */}
            <dl className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-6 lg:justify-end">
              <div className="flex min-w-0 items-center gap-2">
                <MapPinIcon className="size-4 shrink-0 text-primary" />
                <dt className="sr-only">Based in</dt>
                <dd className="truncate">{founder.based}</dd>
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <ClockIcon className="size-4 shrink-0 text-primary" />
                <dt className="sr-only">Availability</dt>
                <dd className="truncate">{founder.availability}</dd>
              </div>
            </dl>
          </div>
        </div>
      </Container>

      {/* The strip spans the shell and sits on the section's lower edge, so it
          reads as the floor of the hero rather than a fifth element stacked
          under the buttons. */}
      <Container className="relative">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border/60 lg:grid-cols-4">
          {facts.map((fact, index) => (
            <motion.div
              key={fact.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: reduceMotion ? 0 : 0.45,
                delay: reduceMotion ? 0 : index * 0.08,
                ease: "easeOut",
              }}
              className="group relative bg-card p-5 transition-colors duration-300 hover:bg-surface-step-a lg:p-6"
            >
              {/* A rule that draws itself across the top on hover — the only
                  motion in the strip, so it stays a highlight rather than
                  noise. */}
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-[linear-gradient(to_right,var(--brand-primary),var(--brand-violet))] transition-transform duration-500 group-hover:scale-x-100"
              />
              <dd className="font-heading text-[clamp(1.75rem,3vw,2.5rem)] leading-none font-semibold text-foreground">
                {fact.value}
              </dd>
              <dt className="mt-2 text-sm leading-snug text-foreground">
                {fact.label}
              </dt>
              <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
                {fact.since}
              </p>
            </motion.div>
          ))}
        </dl>
      </Container>

      <div className="h-12 lg:h-16" />
    </section>
  );
}

export { AboutHero };
