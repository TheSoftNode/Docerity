import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { GrowthPath } from "@/components/sections/mentorship/growth-path";
import { stages } from "@/components/sections/mentorship-program/mentorship-program-data";

function MentorshipProgramHero() {
  return (
    <section className="border-b border-border/80 bg-background pt-16 pb-12 sm:pt-20 sm:pb-16">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            Mentorship
          </p>
          <h1 className="mt-3 font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            A clear path to your next level.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Weekly 1:1s, honest code review, and a real plan &mdash; not just
            office hours. For engineers who want someone invested in their
            growth, not a subscription to a video course.
          </p>

          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            <Button
              size="lg"
              className="h-11 w-full px-6 text-sm sm:w-auto"
              nativeButton={false}
              render={<Link href="/contact?type=mentorship" />}
            >
              Apply for mentorship
              <ArrowRightIcon />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 w-full px-6 text-sm sm:w-auto"
              nativeButton={false}
              render={<Link href="#how-it-works" />}
            >
              See how it works
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-12 hidden max-w-4xl sm:mt-16 sm:block">
          <GrowthPath />
        </div>

        <div className="mx-auto mt-10 flex max-w-xs flex-wrap items-center justify-center gap-x-2 gap-y-2 sm:hidden">
          {stages.map((stage, index) => (
            <span key={stage.label} className="flex items-center gap-2">
              {index > 0 && (
                <ArrowRightIcon className="size-3 shrink-0 text-primary/60" />
              )}
              <span className="font-mono text-xs text-foreground">
                {stage.label}
              </span>
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}

export { MentorshipProgramHero };
