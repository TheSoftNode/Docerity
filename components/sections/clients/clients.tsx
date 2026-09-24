"use client";

import { useState } from "react";
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

  The first version was a static grid of chips with the context hidden until
  hover — which on a touch screen means hidden full stop, and on a desktop
  means a row of grey marks saying nothing. Here one logo is always expanded:
  hovering or focusing moves the selection, and the expanded card states what
  the work was, so the section reads as evidence at rest rather than only
  under a cursor.
*/

function LogoCard({
  logo,
  isActive,
  onActivate,
  index,
}: {
  logo: Logo;
  isActive: boolean;
  onActivate: () => void;
  index: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.li
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: reduceMotion ? 0 : 0.45,
        delay: reduceMotion ? 0 : index * 0.05,
        ease: "easeOut",
      }}
      /*
        The active card takes twice the width. `layout` animates that change
        rather than snapping, which is what makes the row feel like one
        mechanism instead of tiles popping.
      */
      layout={!reduceMotion}
      className={isActive ? "flex-[2.2]" : "flex-1"}
      onMouseEnter={onActivate}
      onFocusCapture={onActivate}
    >
      <button
        type="button"
        onClick={onActivate}
        aria-pressed={isActive}
        className={
          "group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border p-px text-left outline-none transition-colors duration-500 focus-visible:ring-3 focus-visible:ring-ring/50 " +
          (isActive
            ? "border-transparent bg-[linear-gradient(135deg,var(--brand-primary),var(--brand-violet))]"
            : "border-border bg-border/40 hover:bg-border/70")
        }
      >
        <span className="flex h-full flex-col rounded-[calc(1rem-1px)] bg-card">
          {/*
            A light chip for the mark. Most of these ship with a white
            background baked into the bitmap, so on a dark surface each sat in
            its own white rectangle; keying that out would chew the
            anti-aliased edges of marks like Hedera's, so they get the light
            field they were drawn for.
          */}
          <span className="flex h-16 items-center justify-center rounded-t-[calc(1rem-1px)] bg-white px-4">
            <Image
              src={logo.src}
              alt={logo.name}
              width={120}
              height={40}
              className="max-h-8 w-auto max-w-[6.5rem] object-contain"
            />
          </span>

          <span className="flex flex-1 flex-col justify-center px-3 py-3">
            <span
              className={
                "text-xs font-medium transition-colors duration-300 " +
                (isActive ? "text-foreground" : "text-muted-foreground")
              }
            >
              {logo.name}
            </span>

            {/* Only the active card shows its context, so the row has one
                thing to read rather than eight competing captions. */}
            <motion.span
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0,
                height: isActive ? "auto" : 0,
              }}
              transition={{ duration: reduceMotion ? 0 : 0.28, ease: "easeOut" }}
              className="block overflow-hidden text-[0.6875rem] leading-snug text-muted-foreground"
            >
              <span className="block pt-1">{logo.context}</span>
            </motion.span>
          </span>
        </span>
      </button>
    </motion.li>
  );
}

function LogoRow({ label, logos }: { label: string; logos: Logo[] }) {
  /* The first card starts expanded, so the row is never in a state where
     nothing is explained. */
  const [activeName, setActiveName] = useState(logos[0].name);

  return (
    <div>
      <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase">
        {label}
      </p>
      <ul className="mt-4 flex flex-wrap gap-3 sm:flex-nowrap">
        {logos.map((logo, index) => (
          <LogoCard
            key={logo.name}
            logo={logo}
            index={index}
            isActive={logo.name === activeName}
            onActivate={() => setActiveName(logo.name)}
          />
        ))}
      </ul>
    </div>
  );
}

function Clients() {
  return (
    <section
      id="clients"
      className="relative overflow-hidden border-b border-border/80 bg-surface-step-a py-14 lg:py-20"
    >
      <Bloom tone="violet" className="top-0 left-1/4 -translate-y-1/2" />

      <Container className="relative">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.6fr] lg:gap-14">
          <div className="lg:pt-1">
            <Eyebrow>Worked with</Eyebrow>
            <SectionTitle className="text-[clamp(1.5rem,2.6vw,2rem)]">
              Teams, and the ground it was built on.
            </SectionTitle>
            <p className="mt-4 max-w-[38ch] text-sm leading-relaxed text-muted-foreground">
              Two different things, kept apart on purpose: the organisations
              the work was for, and the protocols it was built on.
            </p>
          </div>

          <div className="flex min-w-0 flex-col gap-7">
            <LogoRow label="Organisations" logos={organisations} />
            <LogoRow label="Protocols & platforms" logos={ecosystems} />
          </div>
        </div>
      </Container>
    </section>
  );
}

export { Clients };
