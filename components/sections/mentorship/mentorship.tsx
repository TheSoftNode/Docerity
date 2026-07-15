import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { GrowthPath } from "@/components/sections/mentorship/growth-path";

function Mentorship() {
  return (
    <section
      id="mentorship"
      className="relative border-b border-border/80 bg-background py-16 sm:py-20"
    >
      <Container className="relative">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-lg">
            <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
              Mentorship
            </p>
            <h2 className="mt-3 font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              A clear path to your next level.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Weekly 1:1s, honest code review, and a real plan &mdash; not
              just office hours.
            </p>
          </div>

          <Button
            size="lg"
            className="h-11 shrink-0 px-6 text-sm"
            nativeButton={false}
            render={<Link href="#contact" />}
          >
            Apply for mentorship
            <ArrowRightIcon />
          </Button>
        </div>

        <div className="mt-8 sm:mt-10">
          <GrowthPath />
        </div>
      </Container>
    </section>
  );
}

export { Mentorship };
