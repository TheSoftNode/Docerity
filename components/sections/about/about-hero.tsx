"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRightIcon, ClockIcon, MapPinIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { ScrambleText } from "@/components/shared/scramble-text";
import { Button } from "@/components/ui/button";
import { Bloom, Eyebrow, HeroTitle, Lede } from "@/components/shared/section-kit";
import { facts, founder } from "@/components/sections/about/about-data";

/*
  ── Replacing the portrait ──────────────────────────────────────────────────
  Drop a new file at `public/about/headshot.webp` and nothing else needs
  touching. Square, face centred, 800px or larger — the frame is circular and
  crops to a square, so anything portrait-shaped loses its top and bottom.
  ────────────────────────────────────────────────────────────────────────────
*/
const PORTRAIT = "/about/headshot.webp";

/** Ring geometry, kept together so the rings stay concentric when adjusted. */
const rings = [
  { inset: "inset-0", duration: 54, direction: 1, style: "border-dashed border-border" },
  { inset: "inset-[7%]", duration: 38, direction: -1, style: "border-border/60" },
  { inset: "inset-[14%]", duration: 46, direction: 1, style: "border-dashed border-border/40" },
] as const;

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
    <div className="relative isolate mx-auto aspect-square w-full max-w-[21rem] lg:max-w-[23rem]">
      <div
        aria-hidden
        className="absolute inset-[-14%] -z-10 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--brand-primary),transparent_80%)_0%,transparent_65%)]"
      />

      {rings.map((ring) => (
        <motion.span
          key={ring.inset}
          aria-hidden
          {...spin(ring.duration, ring.direction)}
          className={`absolute ${ring.inset} rounded-full border ${ring.style}`}
        />
      ))}

      {/* A sweep around the rim, the way a radar hand tracks a dial. It is the
          one fast-moving element, which is why it is also the faintest. */}
      <motion.span
        aria-hidden
        {...spin(7, 1)}
        className="absolute inset-[3%] rounded-full opacity-70 [background:conic-gradient(from_0deg,transparent_0deg,color-mix(in_oklch,var(--brand-primary),transparent_55%)_28deg,transparent_96deg)] [mask-image:radial-gradient(circle,transparent_63%,black_66%,black_72%,transparent_75%)] [-webkit-mask-image:radial-gradient(circle,transparent_63%,black_66%,black_72%,transparent_75%)]"
      />

      {/* Two markers riding the outer ring in opposite directions. The dot is
          offset to the rim by its parent's size, so it tracks the ring exactly
          rather than being positioned by eye. */}
      {[
        { duration: 26, direction: 1, tone: "bg-brand-violet", inset: "inset-0" },
        { duration: 34, direction: -1, tone: "bg-primary", inset: "inset-[7%]" },
      ].map((marker) => (
        <motion.span
          key={marker.tone + marker.inset}
          aria-hidden
          {...spin(marker.duration, marker.direction)}
          className={`absolute ${marker.inset} rounded-full`}
        >
          <span
            className={`absolute top-0 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${marker.tone} shadow-[0_0_12px_currentColor]`}
          />
        </motion.span>
      ))}

      {/* The portrait itself. A 1px gradient ring rather than a border, so the
          edge runs sapphire to violet like the cards elsewhere. */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.7, ease: "easeOut" }}
        className="absolute inset-[21%] rounded-full bg-[linear-gradient(140deg,var(--brand-primary),var(--brand-violet))] p-px shadow-[0_28px_60px_-28px_rgba(0,0,0,0.9)]"
      >
        <div className="relative h-full w-full overflow-hidden rounded-full bg-card">
          <Image
            src={PORTRAIT}
            alt={`${founder.name}, founder of Docerity`}
            fill
            sizes="(min-width: 1024px) 15rem, 12rem"
            priority
            className="object-cover"
          />
        </div>
      </motion.div>
    </div>
  );
}

/*
  The band had a 64px background grid. It was removed for the same reason it
  was removed from the CTA: it reads as scaffolding, and a headline sitting on
  visible graph paper looks like a wireframe rather than a finished page. The
  blooms carry the depth instead.
*/
function AboutHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background">
      <Bloom className="top-0 right-0 translate-x-1/4 -translate-y-1/3" />
      <Bloom tone="violet" className="bottom-0 left-0 -translate-x-1/3 translate-y-1/2" />

      <Container className="relative grid grid-cols-1 items-center gap-10 pt-12 pb-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:pb-12">
        <div>
          <Eyebrow>
            <ScrambleText text="About Docerity" />
          </Eyebrow>

          {/*
            The three clauses arrive in sequence rather than all at once. It is
            a three-part claim — build, explain, teach — and staggering them
            lets the line land as three beats instead of a block of type
            appearing whole.
          */}
          <HeroTitle className="max-w-[20ch]">
            {["One engineer,", "three habits:"].map((line, index) => (
              <motion.span
                key={line}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.5,
                  delay: reduceMotion ? 0 : index * 0.09,
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
                delay: reduceMotion ? 0 : 0.18,
                ease: "easeOut",
              }}
              className="block text-brand-violet"
            >
              build, explain, teach.
            </motion.span>
          </HeroTitle>

          <Lede className="mt-6 max-w-[52ch] text-base">
            Docerity is the company around work I have been doing for years —
            shipping production software, writing the explanation that makes it
            make sense, and mentoring the engineers who will maintain it.
          </Lede>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
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
          <dl className="mt-7 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-6">
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

        {/* Held back to `sm`: on a phone the orbit would be most of the first
            screen before a word of the introduction. */}
        <div className="hidden sm:block">
          <PortraitOrbit />
        </div>
      </Container>

      {/* The strip spans the shell on the section's lower edge, so it reads as
          the floor of the band rather than a fifth element stacked beneath. */}
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
