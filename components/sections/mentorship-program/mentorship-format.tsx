import {
  GitPullRequestIcon,
  MessageCircleIcon,
  RouteIcon,
  VideoIcon,
} from "lucide-react";

import { Container } from "@/components/shared/container";
import { Bloom, Eyebrow, FramedPanel, Lede, SectionTitle } from "@/components/shared/section-kit";
import { MentorshipFormatBackground } from "@/components/sections/mentorship-program/mentorship-format-background";
import { formatSteps } from "@/components/sections/mentorship-program/mentorship-program-data";

const icons = [VideoIcon, GitPullRequestIcon, RouteIcon, MessageCircleIcon];

function MentorshipFormat() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-surface-raised py-16 sm:py-20 lg:py-24">
      <MentorshipFormatBackground />
      <Bloom tone="violet" className="top-1/2 left-0 -translate-x-1/2 -translate-y-1/2" />

      <Container className="relative grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <div>
          <Eyebrow>What you get</Eyebrow>
          <SectionTitle>Not just office hours.</SectionTitle>
          <Lede>
            A standing session, feedback between sessions, a plan that moves
            with you, and a way to reach out when something can&apos;t wait.
          </Lede>
        </div>

        <FramedPanel innerClassName="p-2">
          <ul className="divide-y divide-border/70">
            {formatSteps.map((step, index) => {
              const Icon = icons[index];
              return (
                <li key={step.title} className="flex gap-5 px-5 py-6 sm:px-6">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-primary">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-heading text-base font-semibold tracking-tight text-foreground sm:text-lg">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </FramedPanel>
      </Container>
    </section>
  );
}

export { MentorshipFormat };
