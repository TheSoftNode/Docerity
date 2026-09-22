import Link from "next/link";
import {
  ArrowRightIcon,
  CalendarClockIcon,
  GitPullRequestIcon,
  MapIcon,
} from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { GrowthTimeline } from "@/components/sections/mentorship/growth-timeline";

/* The three promises from the lede, given room to breathe. */
const pillars = [
  { Icon: CalendarClockIcon, title: "Weekly 1:1s", body: "Protected time, every week." },
  { Icon: GitPullRequestIcon, title: "Honest code review", body: "Feedback on the code you actually ship." },
  { Icon: MapIcon, title: "A real plan", body: "Milestones, not open-ended office hours." },
] as const;

function Mentorship() {
  return (
    <section
      id="mentorship"
      className="relative overflow-hidden border-b border-border/80 bg-background py-16 sm:py-20 lg:py-24"
    >
      {/* Bloom behind the path card — right side, alternating with Work's
          left-hand bloom so the lighting moves down the page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-0 hidden h-[38rem] w-[38rem] translate-x-1/4 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,var(--brand-primary)_0%,transparent_68%)] opacity-[0.07] blur-3xl lg:block"
      />

      <Container className="relative grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            Mentorship
          </p>
          <h2 className="mt-4 text-balance font-heading text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold leading-[1.1] tracking-tight text-foreground">
            A clear path to your next level.
          </h2>
          <p className="mt-4 max-w-[46ch] text-pretty text-[0.9375rem] leading-[1.75] text-muted-foreground">
            Weekly 1:1s, honest code review, and a real plan &mdash; not just
            office hours.
          </p>

          <ul className="mt-8 grid gap-5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {pillars.map(({ Icon, title, body }) => (
              <li key={title} className="flex gap-3 xl:flex-col">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-primary">
                  <Icon className="size-4" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
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
              render={<Link href="/mentorship" />}
            >
              See the full program
            </Button>
          </div>
        </div>

        {/* Framed the same way as the Work cards — a gradient hairline around
            an opaque panel — so the two sections share one visual language. */}
        <div className="rounded-2xl bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--brand-primary),transparent_55%),var(--border)_45%,color-mix(in_oklch,var(--brand-violet),transparent_60%))] p-px">
          <div className="rounded-[calc(1rem-1px)] bg-card p-6 sm:p-8">
            <div className="mb-7 flex items-center justify-between border-b border-border/80 pb-5">
              <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-muted-foreground uppercase">
                Your growth path
              </p>
              <p className="font-mono text-[0.6875rem] text-muted-foreground">
                4 stages
              </p>
            </div>
            <GrowthTimeline />
          </div>
        </div>
      </Container>
    </section>
  );
}

export { Mentorship };
