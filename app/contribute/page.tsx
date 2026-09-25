import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { siteConfig } from "@/lib/config/site";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/shared/container";
import { Bloom } from "@/components/shared/section-kit";
import { ScrambleText } from "@/components/shared/scramble-text";
import { CornerBrackets } from "@/components/sections/explainers/explainer-corner-brackets";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Writing for Docerity",
  description:
    "How explainers get written here, and how the engineers I mentor end up with their name on one.",
  openGraph: {
    type: "website",
    title: `Writing for Docerity`,
    description: "How the engineers I mentor end up with their name on an explainer.",
    url: `${siteConfig.url}/contribute`,
  },
};

/*
  There is deliberately no submission form on this page.

  An open form on a site with any search presence collects AI-generated filler
  and link-building attempts, and every one of them is something that has to be
  read and refused. The people who should write here are ones already being
  mentored, and they get an account rather than a form.

  Saying that plainly is also more useful than a form would be: somebody who
  genuinely wants to write now knows what the route actually is.
*/

const STEPS = [
  {
    title: "We are already working together",
    detail:
      "Every explainer here has been written by somebody I know well enough to review honestly. That is the filter, and it is the only one.",
  },
  {
    title: "You get an account",
    detail:
      "An invitation link, a password you choose, and the same editor I use. Your drafts are private to you until you send them.",
  },
  {
    title: "I read it before anybody else does",
    detail:
      "Nothing publishes itself. I edit for clarity, we go back and forth if it needs it, and then it goes up with your name on it.",
  },
] as const;

export default function ContributePage() {
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
                    <ScrambleText text="Writing · Docerity" />
                  </span>
                  <span className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                    <span className="flex items-baseline gap-2">
                      <span className="text-muted-foreground">Open to</span>
                      <span className="text-foreground">People I mentor</span>
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-8 px-6 pt-8 pb-7 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-14 lg:pt-9 lg:pb-8">
                  <div className="min-w-0">
                    <h1 className="max-w-[24ch] text-balance font-heading text-[clamp(1.9rem,5vw,2.6rem)] leading-[1.14] font-semibold tracking-tight text-foreground md:text-[clamp(1.9rem,3vw,2.75rem)] lg:text-[clamp(2.1rem,2.9vw,3rem)]">
                      Getting your name on{" "}
                      <span className="bg-[linear-gradient(120deg,var(--brand-primary),var(--brand-violet))] bg-clip-text text-transparent">
                        an explainer
                      </span>
                      .
                    </h1>

                    <p className="mt-5 max-w-[56ch] text-[0.9375rem] leading-[1.75] text-muted-foreground">
                      There is no submit button on this page, and that is
                      deliberate. Explaining something clearly is hard, and the
                      value of these pieces comes from somebody having been
                      edited properly rather than from there being more of them.
                    </p>

                    <p className="mt-4 max-w-[56ch] text-[0.9375rem] leading-[1.75] text-muted-foreground">
                      If you are being mentored here, writing one is part of it.
                      If you are not and you want to be, that conversation starts
                      the same way everything else does.
                    </p>

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Button
                        size="lg"
                        className="h-11 w-full px-6 text-sm sm:w-auto"
                        nativeButton={false}
                        render={<Link href="/contact?type=mentorship" />}
                      >
                        Talk about mentorship
                        <ArrowRightIcon />
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-11 w-full px-6 text-sm sm:w-auto"
                        nativeButton={false}
                        render={<Link href="/blog" />}
                      >
                        Read what is here
                      </Button>
                    </div>
                  </div>

                  <div className="w-full lg:w-[20rem] lg:shrink-0 lg:border-l lg:border-border/70 lg:pl-10">
                    <ol className="space-y-5">
                      {STEPS.map((step, index) => (
                        <li key={step.title} className="flex gap-3">
                          <span className="mt-0.5 font-mono text-[0.625rem] tracking-[0.16em] text-primary">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-foreground">
                              {step.title}
                            </span>
                            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                              {step.detail}
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
                <ScrambleText text="What makes a good one" />
              </p>

              <h2 className="mt-3 text-balance font-heading text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.15] font-semibold tracking-tight text-foreground">
                One idea, one everyday thing it works like.
              </h2>

              <div className="mt-6 space-y-4 text-[0.9375rem] leading-[1.8] text-muted-foreground">
                <p>
                  The pieces that work here take a single concept somebody is
                  stuck on and pair it with something they already understand.
                  Caching is a sticky note on your monitor. Load balancing is a
                  host at a restaurant. The analogy is not decoration on top of
                  the explanation, it is the explanation.
                </p>
                <p>
                  The ones that do not work try to cover a whole area. An
                  explainer about &ldquo;databases&rdquo; is a textbook chapter
                  nobody finishes. One about why an index makes a query faster is
                  four minutes somebody remembers a year later.
                </p>
                <p>
                  Write it for the person you were six months before you
                  understood it. That person is the entire audience, and they are
                  not stupid, they just have not seen it yet.
                </p>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
