import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { HeroIllustration } from "@/components/sections/hero/hero-illustration";

function Hero() {
  return (
    <section className="h-[calc(100dvh-var(--nav-h))] border-b border-border/80">
      <Container className="grid h-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            Engineering · Mentorship · Technical Writing
          </p>

          <h1 className="mt-5 max-w-2xl font-heading text-3xl font-medium leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
            Docerity builds software, grows engineers, and makes hard
            ideas easy to hold.
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base lg:text-lg">
            A practice for teams that need production-ready systems,
            engineers who want real mentorship, and anyone who wants
            technical concepts explained without the fluff.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              size="lg"
              className="h-11 px-6 text-sm"
              nativeButton={false}
              render={<Link href="#contact" />}
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
