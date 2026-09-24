"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { ScrambleText } from "@/components/shared/scramble-text";
import { Button } from "@/components/ui/button";
import { Bloom, HeroTitle } from "@/components/shared/section-kit";
import { CornerBrackets } from "@/components/sections/explainers/explainer-corner-brackets";
import { facts, founder } from "@/components/sections/about/about-data";
import { CountUp } from "@/components/sections/about/count-up";

/*
  ── Replacing the portrait ──────────────────────────────────────────────────
  Drop a new file at `public/about/headshot.webp`. The frame is 3:4 portrait
  now rather than a circle, so a standing or head-and-shoulders shot works and
  a square one is cropped top and bottom. 900px tall or more.
  ────────────────────────────────────────────────────────────────────────────
*/
const PORTRAIT = "/about/headshot.webp";

/**
 * The portrait, in a tall frame with a scan travelling down it.
 *
 * Deliberately not the orbit this replaced. That grew to fill its column —
 * 583px at 1440 — which made the photograph the loudest thing on a page about
 * the work, and squeezed the copy into what was left. This is a fixed,
 * modest frame: the composition around it does the work instead.
 *
 * The scan is thematic rather than ornamental. Docerity is a company about
 * documentation and explanation, and the whole band is built as a dossier, so
 * a sweep reading down the page is the one piece of motion that means
 * something here.
 */
function PortraitPlate() {
  const reduceMotion = useReducedMotion();

  return (
    <figure className="relative z-10 mx-auto w-[13rem] sm:w-[15rem] lg:mx-0 lg:w-[16rem] xl:w-[17.5rem]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.6, ease: "easeOut" }}
        className="relative rounded-2xl bg-[linear-gradient(150deg,var(--brand-primary),var(--border)_45%,var(--brand-violet))] p-px shadow-[0_34px_70px_-30px_rgba(0,0,0,0.95)]"
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-[calc(1rem-1px)] bg-card">
          <Image
            src={PORTRAIT}
            alt={`${founder.name}, founder of Docerity`}
            fill
            sizes="(min-width: 1280px) 17.5rem, (min-width: 640px) 15rem, 13rem"
            priority
            className="object-cover object-top"
          />

          {/* A single bar travelling top to bottom, not a loop of flashes. */}
          {!reduceMotion ? (
            <motion.span
              aria-hidden
              initial={{ y: "-30%" }}
              animate={{ y: "130%" }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
              className="pointer-events-none absolute inset-x-0 h-1/3 bg-[linear-gradient(to_bottom,transparent,color-mix(in_oklch,var(--brand-primary),transparent_86%)_45%,transparent)]"
            />
          ) : null}

          {/* Keeps the crop legible against the frame's lower edge. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-[linear-gradient(to_top,var(--card),transparent)] opacity-70"
          />
        </div>
      </motion.div>

      <figcaption className="mt-3 flex items-baseline justify-between gap-3 font-mono text-[0.625rem] tracking-[0.14em] text-muted-foreground uppercase">
        <span className="truncate">{founder.name}</span>
        <span className="shrink-0 text-primary">Founder</span>
      </figcaption>
    </figure>
  );
}

/** One label/value pair on either rail. */
function RailItem({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-baseline gap-2">
      <span className="text-muted-foreground/70">{label}</span>
      <span className="text-foreground/80">{value}</span>
    </span>
  );
}

/*
  Built as a dossier rather than the usual copy-left / visual-right band.

  Three versions of this hero followed that pattern — a stats panel, then a
  cut-out portrait, then an orbit — and each was the same arrangement with a
  different object dropped into the right-hand column. The panel, its rails
  and the registration marks give the section a structure of its own, and it
  suits a company whose subject is documentation.
*/
function AboutHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background">
      <Bloom className="top-0 right-0 translate-x-1/4 -translate-y-1/2" />
      <Bloom tone="violet" className="bottom-0 left-0 -translate-x-1/3 translate-y-1/2" />

      <Container className="relative pt-10 pb-14 lg:pt-12 lg:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.6, ease: "easeOut" }}
          className="relative rounded-3xl bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--brand-primary),transparent_62%),var(--border)_38%,color-mix(in_oklch,var(--brand-violet),transparent_66%))] p-px shadow-[0_40px_90px_-50px_rgba(0,0,0,0.95)]"
        >
          <div className="relative rounded-[calc(1.5rem-1px)] bg-card">
            <CornerBrackets />

            {/* Header rail — the document's metadata line. */}
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-border/70 px-6 py-3.5 font-mono text-[0.625rem] tracking-[0.16em] uppercase sm:px-8">
              <span className="text-primary">
                <ScrambleText text="Profile — About Docerity" />
              </span>
              <span className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                <RailItem label="Based" value={founder.based} />
                <RailItem label="Hours" value={founder.hours} />
              </span>
            </div>

            <div className="grid grid-cols-1 gap-10 px-6 pt-9 pb-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-14 lg:pt-12 lg:pb-10">
              <div className="min-w-0">
                {/*
                  A relaxed measure. Earlier versions capped this at 20ch and
                  the headline broke into three cramped lines while its column
                  sat half empty; 26ch lets it fall into two with room, which
                  is what "relaxed" actually looks like at this size.
                */}
                <HeroTitle className="mt-0 max-w-[26ch] leading-[1.12]">
                  {["One engineer,", "three habits:"].map((line, index) => (
                    <motion.span
                      key={line}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.5,
                        delay: reduceMotion ? 0 : 0.1 + index * 0.09,
                        ease: "easeOut",
                      }}
                      className="block"
                    >
                      {line}
                    </motion.span>
                  ))}
                  <motion.span
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.5,
                      delay: reduceMotion ? 0 : 0.28,
                      ease: "easeOut",
                    }}
                    className="block text-brand-violet"
                  >
                    build, explain, teach.
                  </motion.span>
                </HeroTitle>

                {/* 62ch and 1.85 leading: the lede was capped at 52ch, which
                    is a caption measure, not a paragraph one. */}
                <p className="mt-7 max-w-[62ch] text-pretty text-[1.0625rem] leading-[1.85] text-muted-foreground">
                  Docerity is the company around work I have been doing for
                  years — shipping production software, writing the explanation
                  that makes it make sense, and mentoring the engineers who will
                  maintain it.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
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

                {/*
                  The figures sit inside this column rather than spanning the
                  panel. Spanning it, the last cell ended up directly beneath
                  the portrait and the plate covered it — the overlap that was
                  meant to give the composition depth was landing on content.
                  Keeping them here makes the split asymmetric instead: copy
                  and figures stacked on the left, one tall plate beside them.
                */}
                <dl className="mt-10 grid grid-cols-2 border-t border-border/70 sm:grid-cols-4">
                  {facts.map((fact, index) => (
                    <motion.div
                      key={fact.label}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.4,
                        delay: reduceMotion ? 0 : index * 0.07,
                      }}
                      className="group relative py-5 pr-5 [&:nth-child(even)]:border-l [&:nth-child(even)]:border-border/70 [&:nth-child(even)]:pl-5 [&:not(:nth-child(-n+2))]:border-t [&:not(:nth-child(-n+2))]:border-border/70 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:border-border/70 sm:[&:not(:first-child)]:pl-5 sm:[&:not(:nth-child(-n+2))]:border-t-0"
                    >
                      <span
                        aria-hidden
                        className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-[linear-gradient(to_right,var(--brand-primary),transparent)] transition-transform duration-500 group-hover:scale-x-100"
                      />
                      <dd className="font-heading text-[clamp(1.5rem,2.2vw,2rem)] leading-none font-semibold text-foreground">
                        <CountUp value={fact.value} />
                      </dd>
                      <dt className="mt-2 text-[0.8125rem] leading-snug text-foreground">
                        {fact.label}
                      </dt>
                      <p className="mt-1 text-[0.6875rem] leading-snug text-muted-foreground">
                        {fact.since}
                      </p>
                    </motion.div>
                  ))}
                </dl>
              </div>

              <PortraitPlate />
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

export { AboutHero };
