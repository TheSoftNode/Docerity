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
  Drop a new file at `public/about/headshot.webp`. The frame is circular, so a
  square image with the face centred works best; a portrait-shaped one loses
  its top and bottom. 800px or larger.
  ────────────────────────────────────────────────────────────────────────────
*/
const PORTRAIT = "/about/headshot.webp";

/** Ring geometry, kept together so the rings stay concentric when adjusted. */
const rings = [
  { inset: "inset-0", duration: 54, direction: 1, style: "border-dashed border-border" },
  { inset: "inset-[7%]", duration: 38, direction: -1, style: "border-border/60" },
  { inset: "inset-[14%]", duration: 46, direction: 1, style: "border-dashed border-border/40" },
] as const;

const markers = [
  { duration: 26, direction: 1, tone: "bg-brand-violet", inset: "inset-0" },
  { duration: 34, direction: -1, tone: "bg-primary", inset: "inset-[7%]" },
] as const;

/**
 * The portrait, ringed by a slow orbit.
 *
 * Sized in `rem` rather than filling its column. Letting it fill was what
 * turned it into the loudest thing on the page (583px at 1440) and squeezed
 * the copy into what was left. Held at 17rem it reads as an instrument beside
 * the text instead of competing with it, and the surrounding panel now does
 * the compositional work.
 *
 * It also sits 48px above the centre line. Centred against the whole left
 * column it came to rest 50px below the headline, level with the figures
 * rather than the copy, which put the heaviest thing on the right beside the
 * lightest on the left. Lifted, its top edge lands within a few pixels of the
 * headline's, so the two halves start together.
 */
function PortraitOrbit() {
  const reduceMotion = useReducedMotion();

  /* Every rotation is linear and continuous. Anything eased would pulse, and
     a pulsing frame beside a face reads as an alert rather than a portrait. */
  const spin = (duration: number, direction: number) =>
    reduceMotion
      ? undefined
      : {
          animate: { rotate: 360 * direction },
          transition: { duration, repeat: Infinity, ease: "linear" as const },
        };

  return (
    <figure className="mx-auto w-[13.5rem] sm:w-[14.5rem] lg:w-[15.5rem] xl:w-[17rem] lg:-translate-y-12">
      <div className="relative isolate aspect-square w-full">
        <div
          aria-hidden
          className="absolute inset-[-12%] -z-10 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--brand-primary),transparent_82%)_0%,transparent_66%)]"
        />

        {rings.map((ring) => (
          <motion.span
            key={ring.inset}
            aria-hidden
            {...spin(ring.duration, ring.direction)}
            className={`absolute ${ring.inset} rounded-full border ${ring.style}`}
          />
        ))}

        {/* A sweep around the rim, the way a radar hand tracks a dial. It is
            the one fast-moving element, which is why it is also the faintest. */}
        <motion.span
          aria-hidden
          {...spin(7, 1)}
          className="absolute inset-[3%] rounded-full opacity-70 [background:conic-gradient(from_0deg,transparent_0deg,color-mix(in_oklch,var(--brand-primary),transparent_55%)_28deg,transparent_96deg)] [mask-image:radial-gradient(circle,transparent_63%,black_66%,black_72%,transparent_75%)] [-webkit-mask-image:radial-gradient(circle,transparent_63%,black_66%,black_72%,transparent_75%)]"
        />

        {/* Markers riding two of the rings in opposite directions. Each dot is
            offset to the rim by its parent's size, so it tracks its ring
            exactly rather than being positioned by eye. */}
        {markers.map((marker) => (
          <motion.span
            key={marker.tone + marker.inset}
            aria-hidden
            {...spin(marker.duration, marker.direction)}
            className={`absolute ${marker.inset} rounded-full`}
          >
            <span
              className={`absolute top-0 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${marker.tone} shadow-[0_0_10px_currentColor]`}
            />
          </motion.span>
        ))}

        {/* A 1px gradient ring rather than a border, so the edge runs sapphire
            to violet like the cards elsewhere. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, ease: "easeOut" }}
          className="absolute inset-[19%] rounded-full bg-[linear-gradient(140deg,var(--brand-primary),var(--brand-violet))] p-px shadow-[0_24px_50px_-24px_rgba(0,0,0,0.9)]"
        >
          <div className="relative h-full w-full overflow-hidden rounded-full bg-card">
            <Image
              src={PORTRAIT}
              alt={`${founder.name}, founder of Docerity`}
              fill
              sizes="(min-width: 1280px) 12rem, 10rem"
              priority
              className="object-cover"
            />
          </div>
        </motion.div>
      </div>

      {/* The dossier's photo caption: one hairline, two mono labels. */}
      <figcaption className="mt-4 flex items-baseline justify-between gap-3 border-t border-border/70 pt-2.5 font-mono text-[0.625rem] tracking-[0.14em] text-muted-foreground uppercase">
        <span className="truncate">{founder.name}</span>
        <span className="shrink-0 text-primary">Founder</span>
      </figcaption>
    </figure>
  );
}

/** One label/value pair on the header rail. */
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

  Three earlier versions were the same arrangement with a different object in
  the right-hand column, so changing the object was never going to make the
  section distinctive. The panel, its rails and the registration marks give it
  a structure of its own, and the form suits a company whose subject is
  documentation.

  Spacing throughout is deliberately tight. The band is an introduction, not a
  destination: it should be read in one glance and scrolled past, so nothing
  here gets more room than it needs to be legible.
*/
function AboutHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background">
      <Bloom className="top-0 right-0 translate-x-1/4 -translate-y-1/2" />
      <Bloom tone="violet" className="bottom-0 left-0 -translate-x-1/3 translate-y-1/2" />

      <Container className="relative pt-8 pb-12 lg:pt-10 lg:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.6, ease: "easeOut" }}
          className="relative rounded-3xl bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--brand-primary),transparent_62%),var(--border)_38%,color-mix(in_oklch,var(--brand-violet),transparent_66%))] p-px shadow-[0_40px_90px_-50px_rgba(0,0,0,0.95)]"
        >
          <div className="relative rounded-[calc(1.5rem-1px)] bg-card">
            <CornerBrackets />

            {/* Header rail: the document's metadata line. */}
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5 border-b border-border/70 px-6 py-3 font-mono text-[0.625rem] tracking-[0.16em] uppercase sm:px-8">
              <span className="text-primary">
                <ScrambleText text="Profile · About Docerity" />
              </span>
              <span className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                <RailItem label="Based" value={founder.based} />
                <RailItem label="Hours" value={founder.hours} />
              </span>
            </div>

            <div className="grid grid-cols-1 gap-8 px-6 pt-8 pb-7 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12 lg:pt-9 lg:pb-8">
              <div className="min-w-0">
                {/*
                  A relaxed measure. Earlier versions capped this at 20ch and
                  the headline broke into three cramped lines while its column
                  sat half empty; 26ch lets it fall into two with room.
                */}
                <HeroTitle className="mt-0 max-w-[26ch] text-[clamp(1.9rem,5vw,2.6rem)] leading-[1.14] md:text-[clamp(1.9rem,3vw,2.75rem)] lg:text-[clamp(2.1rem,2.9vw,3rem)]">
                  {["One engineer,", "three habits:"].map((line, index) => (
                    <motion.span
                      key={line}
                      initial={{ opacity: 0, y: 12 }}
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
                    initial={{ opacity: 0, y: 12 }}
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

                {/* 58ch and 1.8 leading: the lede was once capped at 52ch,
                    which is a caption measure rather than a paragraph one. */}
                <p className="mt-5 max-w-[58ch] text-pretty text-[0.9375rem] leading-[1.8] text-muted-foreground">
                  Docerity is the company around work I have been doing for
                  years: shipping production software, writing the explanation
                  that makes it make sense, and mentoring the engineers who will
                  maintain it.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    size="lg"
                    className="h-10 w-full px-5 text-sm sm:w-auto"
                    nativeButton={false}
                    render={<Link href="/contact" />}
                  >
                    Start a project
                    <ArrowRightIcon />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-10 w-full px-5 text-sm sm:w-auto"
                    nativeButton={false}
                    render={<Link href="#profile" />}
                  >
                    See the track record
                  </Button>
                </div>

                {/*
                  The figures sit inside this column rather than spanning the
                  panel. Spanning it put the last cell directly beneath the
                  portrait, and the overlap meant to give the composition depth
                  landed on content instead.
                */}
                <dl className="mt-7 grid grid-cols-2 border-t border-border/70 sm:grid-cols-4">
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
                      className="group relative py-4 pr-4 [&:nth-child(even)]:border-l [&:nth-child(even)]:border-border/70 [&:nth-child(even)]:pl-4 [&:not(:nth-child(-n+2))]:border-t [&:not(:nth-child(-n+2))]:border-border/70 sm:[&:not(:first-child)]:border-l sm:[&:not(:first-child)]:border-border/70 sm:[&:not(:first-child)]:pl-4 sm:[&:not(:nth-child(-n+2))]:border-t-0"
                    >
                      <span
                        aria-hidden
                        className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-[linear-gradient(to_right,var(--brand-primary),transparent)] transition-transform duration-500 group-hover:scale-x-100"
                      />
                      <dd className="font-heading text-[clamp(1.375rem,2vw,1.75rem)] leading-none font-semibold text-foreground">
                        <CountUp value={fact.value} />
                      </dd>
                      <dt className="mt-1.5 text-xs leading-snug text-foreground">
                        {fact.label}
                      </dt>
                      <p className="mt-1 text-[0.6875rem] leading-snug text-muted-foreground">
                        {fact.since}
                      </p>
                    </motion.div>
                  ))}
                </dl>
              </div>

              <PortraitOrbit />
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

export { AboutHero };
