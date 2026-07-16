import {
  GitPullRequestIcon,
  MessageCircleIcon,
  RouteIcon,
  VideoIcon,
} from "lucide-react";

import { Container } from "@/components/shared/container";
import { MentorshipFormatBackground } from "@/components/sections/mentorship-program/mentorship-format-background";
import { formatSteps } from "@/components/sections/mentorship-program/mentorship-program-data";

const icons = [VideoIcon, GitPullRequestIcon, RouteIcon, MessageCircleIcon];

function MentorshipFormat() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-card py-16 sm:py-20">
      <MentorshipFormatBackground />

      <Container className="relative">
        <div className="mx-auto max-w-lg text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            What you get
          </p>
          <h2 className="mt-3 font-heading text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            Not just office hours.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6">
          {formatSteps.map((step, index) => {
            const Icon = icons[index];
            return (
              <div
                key={step.title}
                className="flex gap-4 rounded-xl border border-border/80 bg-background p-6"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-heading text-base font-medium text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export { MentorshipFormat };
