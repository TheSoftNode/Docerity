import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { HeroIllustration } from "@/components/sections/hero/hero-illustration";

function Hero() {
  return (
    <section className="h-[calc(100dvh-var(--nav-h)-72px)] min-h-[560px] border-b border-border/80">
      <Container className="grid h-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 2xl:max-w-[86rem] 2xl:gap-16">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            Engineering · Mentorship · Tech Explainers
          </p>

          <h1 className="mt-4 max-w-xl font-heading text-3xl font-medium leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
            Software shipped. Engineers grown. Ideas made simple.
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-lg">
            For teams that need production-ready software, engineers
            who want real mentorship, and anyone who&apos;d rather have
            complex ideas explained simply.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button
              size="lg"
              className="h-11 px-6 text-sm"
              nativeButton={false}
              render={<Link href="/contact" />}
            >
              Start a project
              <ArrowRightIcon />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 px-6 text-sm"
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
