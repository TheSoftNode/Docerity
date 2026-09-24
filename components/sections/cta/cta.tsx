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
      className="relative overflow-hidden bg-surface-deep pt-14 pb-20 sm:pt-16 sm:pb-24 lg:pt-16 lg:pb-28"
    >
      <CtaAurora />

      <Container className="relative">
        <CtaPanel>
          <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 md:grid-cols-[1.05fr_0.95fr] md:items-center lg:gap-12 lg:p-10">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/60 px-3 py-1 font-mono text-[0.6875rem] tracking-[0.16em] text-primary uppercase backdrop-blur-sm">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-teal opacity-70" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-brand-teal" />
                </span>
                Let&apos;s talk
              </p>

              <h2 className="mt-4 text-balance font-heading text-[clamp(1.75rem,3.4vw,2.65rem)] font-semibold leading-[1.06] tracking-tight text-foreground">
                Got something{" "}
                <span className="bg-[linear-gradient(120deg,var(--brand-primary),var(--brand-violet))] bg-clip-text text-transparent">
                  worth building
                </span>
                ?
              </h2>

              <p className="mt-4 max-w-[46ch] text-pretty text-[0.9375rem] leading-[1.75] text-muted-foreground">
                A project, mentorship, or just a question &mdash; I read every
                email myself.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  /* A filter, not a box-shadow: the chamfer clips anything
                     painted outside the element, so the old glow stopped
                     rendering the moment the silhouette changed. */
                  className="h-11 w-full px-6 text-sm [filter:drop-shadow(0_10px_22px_color-mix(in_oklch,var(--brand-primary),transparent_62%))] hover:[filter:drop-shadow(0_14px_28px_color-mix(in_oklch,var(--brand-primary),transparent_50%))] sm:w-auto"
                  nativeButton={false}
                  render={<Link href="/contact" />}
                >
                  Start the conversation
                  <ArrowRightIcon />
                </Button>
              </div>

              <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
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
