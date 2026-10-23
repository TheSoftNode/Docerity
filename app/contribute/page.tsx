import { pageMetadata } from "@/lib/content/blocks/metadata";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/shared/container";
import { Bloom } from "@/components/shared/section-kit";
import { ScrambleText } from "@/components/shared/scramble-text";
import { CornerBrackets } from "@/components/sections/explainers/explainer-corner-brackets";
import { Button } from "@/components/ui/button";
import { getGroup, getHeading } from "@/lib/content/blocks/source";
import { splitEmphasis } from "@/components/sections/home/hero-content";

/* Read per request rather than exported as a constant, so the title and
   description a search result shows can be edited without a deploy. */
export const generateMetadata = pageMetadata("contribute", "/contribute");

/*
  There is deliberately no submission form on this page.

  An open form on a site with any search presence collects AI-generated filler
  and link-building attempts, and every one of them is something that has to be
  read and refused. The people who should write here are ones already being
  mentored, and they get an account rather than a form.

  Saying that plainly is also more useful than a form would be: somebody who
  genuinely wants to write now knows what the route actually is.
*/

type Stage = { status: string; title: string; description: string; cardNote: string };

/* Every word on the page is edited in the admin (Write for us). */
export default async function ContributePage() {
  const [hero, craftHeading, route, invite, craft] = await Promise.all([
    getHeading("contribute", "contribute-hero"),
    getHeading("contribute", "contribute-craft"),
    getGroup<Stage[]>("contribute", "route"),
    getGroup<{ note: string; primaryLabel: string; secondaryLabel: string }>("contribute", "invite"),
    getGroup<string[]>("contribute", "craft"),
  ]);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/80 bg-background">
          <Bloom className="top-0 right-0 translate-x-1/3 -translate-y-1/2" />
          <Bloom tone="violet" className="bottom-0 left-0 -translate-x-1/3 translate-y-1/2" />

          <Container className="relative pt-8 pb-12 lg:pt-10 lg:pb-16">
            <div className="relative rounded-3xl bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--brand-primary),transparent_62%),var(--border)_38%,color-mix(in_oklch,var(--brand-violet),transparent_66%))] p-px shadow-[0_40px_90px_-50px_rgba(0,0,0,0.95)]">
              <div className="relative rounded-[calc(1.5rem-1px)] bg-card">
                <CornerBrackets />

                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5 border-b border-border/70 px-6 py-3 font-mono text-[0.625rem] tracking-[0.16em] uppercase sm:px-8">
                  <span className="text-primary">
                    <ScrambleText text={hero.eyebrow} />
                  </span>
                  <span className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                    <span className="flex items-baseline gap-2">
                      <span className="text-muted-foreground">Open to</span>
                      <span className="text-foreground">People we mentor</span>
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-8 px-6 pt-8 pb-7 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-14 lg:pt-9 lg:pb-8">
                  <div className="min-w-0">
                    <h1 className="max-w-[24ch] text-balance font-heading text-[clamp(1.9rem,5vw,2.6rem)] leading-[1.14] font-semibold tracking-tight text-foreground md:text-[clamp(1.9rem,3vw,2.75rem)] lg:text-[clamp(2.1rem,2.9vw,3rem)]">
                      {splitEmphasis(hero.title).map((piece, index) =>
                        piece.emphasis ? (
                          <span
                            key={index}
                            className="bg-[linear-gradient(120deg,var(--brand-primary),var(--brand-violet))] bg-clip-text text-transparent"
                          >
                            {piece.text}
                          </span>
                        ) : (
                          piece.text
                        )
                      )}
                    </h1>

                    <p className="mt-5 max-w-[56ch] text-[0.9375rem] leading-[1.75] text-muted-foreground">
                      {hero.lede}
                    </p>

                    <p className="mt-4 max-w-[56ch] text-[0.9375rem] leading-[1.75] text-muted-foreground">
                      {invite.note}
                    </p>

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Button
                        size="lg"
                        className="h-11 w-full px-6 text-sm sm:w-auto"
                        nativeButton={false}
                        render={<Link href="/contact?type=mentorship" />}
                      >
                        {invite.primaryLabel}
                        <ArrowRightIcon />
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-11 w-full px-6 text-sm sm:w-auto"
                        nativeButton={false}
                        render={<Link href="/blog" />}
                      >
                        {invite.secondaryLabel}
                      </Button>
                    </div>
                  </div>

                  <div className="w-full lg:w-[20rem] lg:shrink-0 lg:border-l lg:border-border/70 lg:pl-10">
                    <ol className="space-y-5">
                      {route.map((step, index) => (
                        <li key={step.title} className="flex gap-3">
                          <span className="mt-0.5 font-mono text-[0.625rem] tracking-[0.16em] text-primary">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-foreground">
                              {step.title}
                            </span>
                            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                              {step.description}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-background py-12 lg:py-16">
          <Container>
            <div className="mx-auto max-w-[48rem]">
              <p className="font-mono text-[0.625rem] tracking-[0.16em] uppercase text-primary">
                <ScrambleText text={craftHeading.eyebrow} />
              </p>

              <h2 className="mt-3 text-balance font-heading text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.15] font-semibold tracking-tight text-foreground">
                {craftHeading.title}
              </h2>

              <div className="mt-6 space-y-4 text-[0.9375rem] leading-[1.8] text-muted-foreground">
                {craft.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
