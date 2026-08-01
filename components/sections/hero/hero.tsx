import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { HeroIllustration } from "@/components/sections/hero/hero-illustration";

function Hero() {
  return (
    <section className="border-b border-border/80 py-14 sm:h-[calc(100dvh-var(--nav-h)-72px)] sm:min-h-[560px] sm:py-0">
      <Container className="grid items-center gap-10 sm:h-full lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 2xl:gap-16">
        <div>
          <p className="font-mono text-xs tracking-[0.12em] text-primary uppercase sm:tracking-[0.2em]">
            Engineering · Mentorship · <span className="whitespace-nowrap">Tech Explainers</span>
          </p>

          <h1 className="mt-4 max-w-xl font-heading text-3xl font-medium leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
            Software shipped. Engineers grown. Ideas made simple.
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-lg">
            For teams that need production-ready software, engineers
            who want real mentorship, and anyone who&apos;d rather have
            complex ideas explained simply.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
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
        </div>

        <div className="hidden lg:block">
          <HeroIllustration />
        </div>
      </Container>
    </section>
  );
}

export { Hero };
