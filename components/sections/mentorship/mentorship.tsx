import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { GrowthPath } from "@/components/sections/mentorship/growth-path";
import { checkpoints } from "@/components/sections/mentorship/mentorship-data";

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

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:shrink-0 sm:flex-row sm:items-center">
            <Button
              size="lg"
              variant="outline"
              className="h-11 w-full px-6 text-sm sm:w-auto"
              nativeButton={false}
              render={<Link href="/mentorship" />}
            >
              See the full program
            </Button>
            <Button
              size="lg"
              className="h-11 w-full px-6 text-sm sm:w-auto"
              nativeButton={false}
              render={<Link href="/contact?type=mentorship" />}
            >
              Apply for mentorship
              <ArrowRightIcon />
            </Button>
          </div>
        </div>

        <div className="mt-8 hidden sm:mt-10 sm:block">
          <GrowthPath />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 sm:hidden">
          {checkpoints.map((checkpoint, index) => (
            <span key={checkpoint.label} className="flex items-center gap-2">
              {index > 0 && (
                <ArrowRightIcon className="size-3 shrink-0 text-primary/60" />
              )}
              <span className="font-mono text-xs text-foreground">
                {checkpoint.label}
              </span>
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}

export { Mentorship };
