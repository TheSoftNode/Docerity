import Link from "next/link";
import { ArrowRightIcon, MapPinIcon, ClockIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { ScrambleText } from "@/components/shared/scramble-text";
import { Button } from "@/components/ui/button";
import {
  Bloom,
  Eyebrow,
  FramedPanel,
  HeroTitle,
  Lede,
  MetricDot,
} from "@/components/shared/section-kit";
import { facts, founder } from "@/components/sections/about/about-data";

/*
  The right side is a facts panel rather than another self-dealing deck. The
  work and AI heroes already use decks, and the useful thing to put beside an
  introduction is the evidence for it — four numbers that the sections below
  substantiate.
*/
function AboutHero() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background">
      <Bloom className="top-1/2 right-0 translate-x-1/3 -translate-y-1/2" />
      <Bloom tone="violet" className="bottom-0 left-0 -translate-x-1/3 translate-y-1/3" />

      <Container className="relative grid grid-cols-1 gap-12 pt-12 pb-16 md:grid-cols-[1.1fr_0.9fr] md:items-center lg:gap-16 lg:pt-20 lg:pb-24">
        <div>
          <Eyebrow>
            <ScrambleText text="About Docerity" />
          </Eyebrow>
          <HeroTitle>
            One engineer, three habits:{" "}
            <span className="text-brand-violet">build, explain, teach.</span>
          </HeroTitle>
          <Lede className="mt-6 text-base lg:max-w-[42rem]">
            Docerity is the company around work I have been doing for years —
            shipping production software, writing the explanation that makes it
            make sense, and mentoring the engineers who will maintain it.
          </Lede>

          {/* Location and time zone: the two questions a distributed client
              asks first. Phone numbers deliberately live on /contact only. */}
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

        {/* Held back to `md`, where it is an actual column: stacked under the
            copy on a phone it would be four numbers with no context. */}
        <FramedPanel className="hidden md:block">
          <div className="p-7 lg:p-8">
            <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase">
              By the numbers
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-7">
              {facts.map((fact) => (
                <div key={fact.label} className="min-w-0">
                  <dd className="font-heading text-[clamp(1.75rem,2.4vw,2.25rem)] leading-none font-semibold text-foreground">
                    {fact.value}
                  </dd>
                  <dt className="mt-2 text-[0.8125rem] leading-snug text-foreground">
                    {fact.label}
                  </dt>
                  <p className="mt-1 flex items-start gap-1.5 text-xs leading-snug text-muted-foreground">
                    <span className="mt-1.5">
                      <MetricDot />
                    </span>
                    <span className="min-w-0">{fact.since}</span>
                  </p>
                </div>
              ))}
            </dl>
          </div>
        </FramedPanel>
      </Container>
    </section>
  );
}

export { AboutHero };
