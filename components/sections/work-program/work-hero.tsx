import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { WorkHeroBackground } from "@/components/sections/work-program/work-hero-background";

function WorkHero() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background pt-16 pb-14 sm:pt-20 sm:pb-16">
      <WorkHeroBackground />

      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            Selected Work
          </p>
          <h1 className="mt-3 font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Software built for what happens after launch.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            A few production systems, picked for the problems they actually
            solved — plus how projects like these usually go, start to finish.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              className="h-11 px-6 text-sm"
              nativeButton={false}
              render={<Link href="#showcase" />}
            >
              See the work
              <ArrowRightIcon />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 px-6 text-sm"
              nativeButton={false}
              render={<Link href="/contact" />}
            >
              Start a project
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

export { WorkHero };
