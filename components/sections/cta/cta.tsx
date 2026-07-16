import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config/site";
import { CtaBackground } from "@/components/sections/cta/cta-background";

const corners = [
  "top-6 left-6 border-t-2 border-l-2 rounded-tl-lg sm:top-8 sm:left-8",
  "top-6 right-6 border-t-2 border-r-2 rounded-tr-lg sm:top-8 sm:right-8",
  "bottom-6 left-6 border-b-2 border-l-2 rounded-bl-lg sm:bottom-8 sm:left-8",
  "bottom-6 right-6 border-b-2 border-r-2 rounded-br-lg sm:bottom-8 sm:right-8",
] as const;

function Cta() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[#241119] pt-14 pb-28 sm:pt-16 sm:pb-32"
    >
      <CtaBackground />

      {corners.map((className) => (
        <span
          key={className}
          aria-hidden
          className={`pointer-events-none absolute size-6 border-primary/40 sm:size-7 ${className}`}
        />
      ))}

      <Container className="relative">
        <div className="mx-auto max-w-xl text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            Let&apos;s talk
          </p>
          <h2 className="mt-3 font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Got something <span className="text-primary">worth building</span>?
          </h2>
          <p className="mt-3 text-sm text-foreground/65 sm:text-base">
            A project, mentorship, or just a question &mdash; I read every
            email myself.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-5">
            <Button
              size="lg"
              className="h-11 px-6 text-sm"
              nativeButton={false}
              render={<Link href="/contact" />}
            >
              Start the conversation
              <ArrowRightIcon />
            </Button>
            <Link
              href={`mailto:${siteConfig.email}`}
              className="text-sm font-medium text-foreground/80 underline underline-offset-4 hover:text-foreground"
            >
              {siteConfig.email}
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

export { Cta };
