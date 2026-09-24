import Link from "next/link";
import {
  ArrowRightIcon,
  ClockIcon,
  InboxIcon,
} from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { CtaAurora } from "@/components/sections/cta/cta-aurora";
import { CtaPanel } from "@/components/sections/cta/cta-panel";
import { CtaConsole } from "@/components/sections/cta/cta-console";

/* Reassurance, drawn from the same copy the contact page already promises. */
const assurances = [
  { Icon: ClockIcon, label: "Replies in 1–2 business days" },
  { Icon: InboxIcon, label: "Goes straight to me" },
] as const;

function Cta() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-surface-deep pt-16 pb-32 sm:pt-20 sm:pb-36 lg:pt-24 lg:pb-40"
    >
      <CtaAurora />

      <Container className="relative">
        <CtaPanel>
          <div className="grid grid-cols-1 gap-10 p-7 sm:p-10 md:grid-cols-[1.05fr_0.95fr] md:items-center lg:gap-14 lg:p-14">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/60 px-3 py-1 font-mono text-[0.6875rem] tracking-[0.16em] text-primary uppercase backdrop-blur-sm">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-teal opacity-70" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-brand-teal" />
                </span>
                Let&apos;s talk
              </p>

              <h2 className="mt-5 text-balance font-heading text-[clamp(2rem,4.2vw,3.4rem)] font-semibold leading-[1.04] tracking-tight text-foreground">
                Got something{" "}
                <span className="bg-[linear-gradient(120deg,var(--brand-primary),var(--brand-violet))] bg-clip-text text-transparent">
                  worth building
                </span>
                ?
              </h2>

              <p className="mt-5 max-w-[42ch] text-pretty text-base leading-[1.75] text-muted-foreground lg:max-w-[34rem]">
                A project, mentorship, or just a question &mdash; I read every
                email myself.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  className="h-12 w-full px-7 text-sm shadow-[0_18px_40px_-18px_var(--brand-primary)] transition-shadow duration-300 hover:shadow-[0_22px_50px_-16px_var(--brand-primary)] sm:w-auto"
                  nativeButton={false}
                  render={<Link href="/contact" />}
                >
                  Start the conversation
                  <ArrowRightIcon />
                </Button>
              </div>

              <ul className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
                {assurances.map(({ Icon, label }) => (
                  <li
                    key={label}
                    className="inline-flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <Icon className="size-3.5 text-brand-teal" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <CtaConsole />
          </div>
        </CtaPanel>
      </Container>
    </section>
  );
}

export { Cta };
