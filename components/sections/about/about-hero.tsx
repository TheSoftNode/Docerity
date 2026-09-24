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
  The right-hand side is the person, not a panel of numbers.

  It was a bordered box of four statistics, which is the least interesting
  thing an About page can put next to an introduction — the page said "here is
  who I am" and then showed a table. A portrait answers that directly, and the
  numbers work harder orbiting it as evidence than they did stacked in a grid.
*/

/* Where each stat sits relative to the portrait. Percentages, so the badges
   track the image at every width instead of drifting off it. */
const badgePositions = [
  "left-[-6%] top-[14%]",
  "right-[-8%] top-[30%]",
  "left-[-10%] bottom-[26%]",
  "right-[-4%] bottom-[10%]",
];

function AboutHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background">
      <Bloom className="top-1/2 right-0 translate-x-1/3 -translate-y-1/2" />
      <Bloom tone="violet" className="bottom-0 left-0 -translate-x-1/3 translate-y-1/3" />

      <Container className="relative grid grid-cols-1 gap-12 pt-12 pb-16 md:grid-cols-[1.05fr_0.95fr] md:items-center lg:gap-16 lg:pb-24">
        <div>
          <Eyebrow>
            <ScrambleText text="About Docerity" />
          </Eyebrow>
          <HeroTitle>
            One engineer, three habits:{" "}
            <span className="text-brand-violet">build, explain, teach.</span>
          </HeroTitle>
          <Lede className="mt-6 text-base lg:max-w-[40rem]">
            Docerity is the company around work I have been doing for years —
            shipping production software, writing the explanation that makes it
            make sense, and mentoring the engineers who will maintain it.
          </Lede>

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

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-10">
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
              render={<Link href="#experience" />}
            >
              See the track record
            </Button>
          </div>
        </div>

        {/*
          Held back to `md`. Below that the badges would have nowhere to sit
          without overlapping the portrait, and a photo stacked under the copy
          adds scroll without adding information.
        */}
        <div className="relative isolate mx-auto hidden w-full max-w-[26rem] md:block">
          {/* A ring behind the portrait, so it is lit rather than pasted onto
              a flat field — the same device the landing hero uses. */}
          <div
            aria-hidden
            className="absolute inset-[-12%] -z-10 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--brand-primary),transparent_78%)_0%,transparent_68%)]"
          />
          <div
            aria-hidden
            className="absolute inset-[-4%] -z-10 rounded-full border border-dashed border-border/70"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.6, ease: "easeOut" }}
            className="relative"
          >
            {/* The cut-out ends in a flat horizontal edge where the original
                crop stopped, which reads as a photo sliced off rather than a
                figure standing in the page. The mask fades the last fifth into
                the background so the edge disappears. */}
            <Image
              src="/about/portrait.webp"
              alt={`${founder.name}, founder of Docerity`}
              width={589}
              height={885}
              priority
              sizes="(min-width: 768px) 26rem, 100vw"
              className="relative w-full object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)] [mask-image:linear-gradient(to_bottom,black_72%,transparent_98%)] [-webkit-mask-image:linear-gradient(to_bottom,black_72%,transparent_98%)]"
            />
          </motion.div>

          {facts.map((fact, index) => (
            <motion.div
              key={fact.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.45,
                delay: reduceMotion ? 0 : 0.25 + index * 0.12,
                ease: "easeOut",
              }}
              className={`absolute ${badgePositions[index]} rounded-xl border border-border bg-card/95 px-3 py-2 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)] backdrop-blur-sm`}
            >
              <p className="font-heading text-lg leading-none font-semibold text-foreground">
                {fact.value}
              </p>
              <p className="mt-1 max-w-[9rem] text-[0.6875rem] leading-snug text-muted-foreground">
                {fact.label}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export { AboutHero };
