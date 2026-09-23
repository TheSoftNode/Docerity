import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { HeroIllustration } from "@/components/sections/hero/hero-illustration";
import { HeroAura } from "@/components/sections/hero/hero-aura";
import { HeroFrame } from "@/components/shared/hero-frame";
import { HeroSpec } from "@/components/shared/hero-spec";
import { ScrambleText } from "@/components/shared/scramble-text";
import { projects } from "@/components/sections/work/work-data";
import { entries } from "@/components/sections/blog/blog-data";
import { checkpoints } from "@/components/sections/mentorship/mentorship-data";

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/80">
      <HeroFrame />
      {/* A single sapphire bloom behind the artwork. It is the only gradient
          on the page, sits at 7% behind a heavy blur, and exists to give the
          right-hand side depth so the illustration is lit rather than pasted
          onto a flat field. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-0 hidden h-[36rem] w-[36rem] -translate-y-1/2 translate-x-1/3 rounded-full bg-[radial-gradient(circle,var(--brand-primary)_0%,transparent_68%)] opacity-[0.07] blur-3xl lg:block"
      />

      {/*
        The grid stays single-column until `lg`. That is deliberate: it keeps
        the headline's available width moving in step with the viewport, so a
        `vw`-based type scale can never grow while its column shrinks. The old
        split at `md` did exactly that — 48px type at 640px, then 40px at 768px
        once the column halved — and at 1024px it left a five-line ragged
        headline with "Ideas" orphaned on its own line.

        Height comes from the content. Pinning the hero to `100dvh` minus the
        nav stretched it on tall screens and left dead bands around the text.
      */}
      <Container className="relative grid grid-cols-1 gap-12 pt-12 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10 lg:pt-20 lg:pb-24 xl:gap-12">
        <div className="flex flex-col">
          {/* No leading rule here: it indented the label ~44px while the
              headline began at the column edge, which read as a misalignment
              rather than as a flourish. */}
          <p className="font-mono text-xs tracking-[0.12em] text-brand-iris uppercase sm:tracking-[0.2em]">
            <ScrambleText text="Engineering · Mentorship · Tech Explainers" />
          </p>

          {/*
            Two fluid ranges rather than four fixed steps: one for the
            full-width single column, one for the narrower column at `lg`.
            Type shrinks when its column does, which is the only direction a
            step is ever allowed to go.
          */}
          <h1 className="mt-6 max-w-[20ch] text-balance font-heading text-[clamp(2rem,6vw,3rem)] font-semibold leading-[1.05] tracking-tight text-foreground lg:mt-7 lg:max-w-none lg:text-[clamp(2.75rem,3.6vw,3.6rem)]">
            {/* Three sentences, three lines — but only once the column is wide
                enough to hold them. Below `lg` they wrap naturally. */}
            <span className="lg:block">Software shipped.</span>{" "}
            <span className="lg:block">Engineers grown.</span>{" "}
            {/* Violet, not sapphire — the headline accent should not be the
                same colour as the button sitting directly under it. */}
            <span className="text-brand-violet lg:block">Ideas made simple.</span>
          </h1>

          <p className="mt-6 max-w-[46ch] text-pretty text-base leading-[1.75] text-muted-foreground lg:mt-8 lg:max-w-[38rem] 2xl:max-w-[40rem]">
            For teams that need production-ready software, engineers who want
            real mentorship, and anyone who&apos;d rather have complex ideas
            explained simply.
          </p>

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
              render={<Link href="#work" />}
            >
              See the work
            </Button>
          </div>

          <HeroSpec
            items={[
              { label: "Case studies", value: String(projects.length).padStart(2, "0") },
              { label: "Explainers", value: String(entries.length).padStart(2, "0") },
              { label: "Mentorship", value: `${checkpoints.length} stages` },
            ]}
          />
        </div>

        {/*
          Appears only once it is an actual column. Stacked beneath the copy on
          a tablet it added ~450px of scroll for pure decoration, taking the
          hero from 458px at 640 to 915px at 768. There is no blank half to
          fill below `lg` any more — the copy spans the full width there — so
          the artwork simply waits until the layout has room for it.
        */}
        {/*
          `isolate` keeps the aura's negative z-index inside this column, so it
          layers under the artwork instead of behind the page. The hairline
          sits in the gutter: the 64px gap read as an accidental hole because
          the lede wraps well short of the column edge, and a seam makes the
          split deliberate.
        */}
        <div className="relative isolate hidden w-full lg:block">
          <span
            aria-hidden
            className="absolute -left-5 top-10 bottom-10 w-px bg-[linear-gradient(to_bottom,transparent,var(--border),transparent)] xl:-left-6"
          />
          <HeroAura />
          <HeroIllustration />
        </div>
      </Container>
    </section>
  );
}

export { Hero };
