import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Bloom, Eyebrow, FramedPanel, HeroTitle, Lede } from "@/components/shared/section-kit";
import { GrowthTimeline } from "@/components/sections/mentorship/growth-timeline";

function MentorshipProgramHero() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background">
      <Bloom className="top-1/2 right-0 translate-x-1/3 -translate-y-1/2" />

      <Container className="relative grid gap-12 pt-12 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:pt-20 lg:pb-24">
        <div>
          <Eyebrow>Mentorship</Eyebrow>
          <HeroTitle>A clear path to your next level.</HeroTitle>
          <Lede className="mt-6 text-base">
            Weekly 1:1s, honest code review, and a real plan &mdash; not just
            office hours. For engineers who want someone invested in their
            growth, not a subscription to a video course.
          </Lede>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-10">
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

        {/* Same growth-path card as the homepage, so the program page opens
            on the picture the visitor clicked through from. */}
        <FramedPanel innerClassName="p-6 sm:p-8">
          <div className="mb-7 flex items-center justify-between border-b border-border/80 pb-5">
            <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-muted-foreground uppercase">
              Your growth path
            </p>
            <p className="font-mono text-[0.6875rem] text-muted-foreground">4 stages</p>
          </div>
          <GrowthTimeline />
        </FramedPanel>
      </Container>
    </section>
  );
}

export { MentorshipProgramHero };
