"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

import { Container } from "@/components/shared/container";
import { Bloom, Eyebrow, SectionTitle } from "@/components/shared/section-kit";
import {
  ecosystems,
  organisations,
  type Logo,
} from "@/components/sections/clients/clients-data";

/*
  A logo wall that earns its place.

  A bare row of greyed-out logos says "someone trusted me" and nothing else.
  Each logo here carries what it was for on hover and focus, so the row is
  evidence rather than decoration — and every line points at work that is
  listed elsewhere on the site.
*/
function LogoTile({ logo, index }: { logo: Logo; index: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: reduceMotion ? 0 : 0.45,
        delay: reduceMotion ? 0 : index * 0.05,
        ease: "easeOut",
      }}
      className="group relative w-[calc(50%-0.375rem)] sm:w-[10.5rem] lg:w-[11.5rem]"
    >
      {/*
        A light chip rather than the usual dark card.

        These marks come from eight different sources and most ship with a
        white background baked into the bitmap, so on a dark surface each one
        sat in its own white rectangle. Keying the white out would chew the
        anti-aliased edges of logos like Hedera's; giving them all the light
        field they were drawn for is both correct and consistent.

        `tabIndex` because the tile is not a link, so the context line would
        otherwise be unreachable without a pointer.
      */}
      <div
        tabIndex={0}
        className="flex h-[4.5rem] items-center justify-center rounded-xl border border-border bg-white px-4 outline-none ring-1 ring-black/5 transition-all duration-300 hover:border-primary/40 hover:ring-primary/20 focus-visible:border-primary/60 focus-visible:ring-3 focus-visible:ring-ring/40 sm:h-20"
      >
        <Image
          src={logo.src}
          alt={logo.name}
          width={120}
          height={40}
          /* Logos arrive in a dozen shapes; a fixed box with `object-contain`
             keeps the optical weight even without cropping anyone's mark. */
          className="max-h-9 w-auto max-w-[7rem] object-contain opacity-80 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
        />
      </div>

      <p className="mt-2 text-center text-[0.6875rem] leading-snug text-muted-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
        {logo.context}
      </p>
    </motion.li>
  );
}

function LogoRow({
  label,
  logos,
  offset = 0,
}: {
  label: string;
  logos: Logo[];
  offset?: number;
}) {
  return (
    <div>
      <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </p>
      {/* Flex rather than a grid: the two rows hold three and six logos, and
          a shared six-column grid left the first row half empty. Fixed-basis
          tiles keep both rows the same size and flush left. */}
      <ul className="mt-4 flex flex-wrap gap-3 lg:gap-4">
        {logos.map((logo, index) => (
          <LogoTile key={logo.name} logo={logo} index={offset + index} />
        ))}
      </ul>
    </div>
  );
}

function Clients() {
  return (
    <section
      id="clients"
      className="relative overflow-hidden border-b border-border/80 bg-surface-raised py-14 lg:py-20"
    >
      <Bloom tone="violet" className="top-0 left-1/4 -translate-y-1/2" />

      <Container className="relative">
        <div className="max-w-2xl">
          <Eyebrow>Worked with</Eyebrow>
          <SectionTitle>Teams, and the ground it was built on.</SectionTitle>
        </div>

        <div className="mt-10 flex flex-col gap-8 lg:mt-12 lg:gap-10">
          <LogoRow label="Organisations" logos={organisations} />
          <LogoRow label="Protocols & platforms" logos={ecosystems} offset={organisations.length} />
        </div>
      </Container>
    </section>
  );
}

export { Clients };
