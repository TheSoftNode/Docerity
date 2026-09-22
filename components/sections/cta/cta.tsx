import Link from "next/link";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  GraduationCapIcon,
  MailIcon,
  RocketIcon,
} from "lucide-react";

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

/* The three reasons someone reaches out, each routed where it belongs. */
const routes = [
  {
    Icon: RocketIcon,
    title: "A new project",
    body: "Scope, build and ship production software.",
    href: "/contact",
  },
  {
    Icon: GraduationCapIcon,
    title: "Mentorship",
    body: "Weekly 1:1s and honest code review.",
    href: "/contact?type=mentorship",
  },
] as const;

function Cta() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden bg-[#0a1020] pt-16 pb-32 sm:pt-20 sm:pb-36 lg:pt-24 lg:pb-40"
    >
      <CtaBackground />

      {corners.map((className) => (
        <span
          key={className}
          aria-hidden
          className={`pointer-events-none absolute size-6 border-primary/40 sm:size-7 ${className}`}
        />
      ))}

      <Container className="relative grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            Let&apos;s talk
          </p>
          <h2 className="mt-4 text-balance font-heading text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.05] tracking-tight text-foreground">
            Got something <span className="text-brand-violet">worth building</span>?
          </h2>
          <p className="mt-5 max-w-[42ch] text-pretty text-base leading-[1.75] text-muted-foreground">
            A project, mentorship, or just a question &mdash; I read every
            email myself.
          </p>

          <Button
            size="lg"
            className="mt-9 h-11 w-full px-6 text-sm sm:w-auto"
            nativeButton={false}
            render={<Link href="/contact" />}
          >
            Start the conversation
            <ArrowRightIcon />
          </Button>
        </div>

        {/* A routing panel rather than a lone button: the visitor picks what
            they came for, and each choice lands on the right form. */}
        <div className="rounded-2xl bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--brand-primary),transparent_50%),var(--border)_50%,color-mix(in_oklch,var(--brand-violet),transparent_55%))] p-px">
          <div className="rounded-[calc(1rem-1px)] bg-card/95 p-2 backdrop-blur-md">
            <ul className="divide-y divide-border/70">
              {routes.map(({ Icon, title, body, href }) => (
                <li key={title}>
                  <Link
                    href={href}
                    className="group flex items-center gap-4 rounded-xl px-4 py-5 transition-colors duration-300 hover:bg-muted/60"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary">
                      <Icon className="size-4.5" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-foreground">{title}</span>
                      <span className="block text-sm text-muted-foreground">{body}</span>
                    </span>
                    <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="group flex items-center gap-4 rounded-xl px-4 py-5 transition-colors duration-300 hover:bg-muted/60"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-brand-violet">
                    <MailIcon className="size-4.5" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">
                      {siteConfig.email}
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      Just a question? Email directly.
                    </span>
                  </span>
                  <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

export { Cta };
