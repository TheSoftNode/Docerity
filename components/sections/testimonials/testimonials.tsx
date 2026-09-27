import Link from "next/link";
import { ArrowRightIcon, PenLineIcon, QuoteIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { TestimonialsBackground } from "@/components/sections/testimonials/testimonials-background";
import {
  TestimonialSpotlight,
  type SpotlightQuote,
} from "@/components/sections/testimonials/testimonial-spotlight";
import { getPublicReviews, TESTIMONIAL_MINIMUM } from "@/lib/reviews/display";
import { getHeading } from "@/lib/content/blocks/source";

/**
 * A Server Component, so the approved reviews are read during the render rather
 * than fetched from the browser. The spotlight below it stays a Client
 * Component because it animates, and receives the quotes as props.
 */

/*
  Shared by both states, so the band reads the same either way and the eyebrow
  stays put. The heading is a prop rather than a constant because "Trusted by
  teams, engineers and readers" is a claim, and a claim with no quotes under it
  is the kind of thing this whole change is getting rid of.
*/
function Header({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <>
      <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-4 font-heading text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold leading-[1.1] tracking-tight text-foreground">
        {title}
      </h2>
    </>
  );
}

function Actions() {
  return (
    <div className="mt-7 flex flex-col gap-3 border-t border-border/70 pt-6 sm:flex-row sm:items-center">
      <Button
        size="lg"
        className="h-10 w-full px-5 text-sm sm:w-auto"
        nativeButton={false}
        render={<Link href="/reviews#leave-a-review" />}
      >
        <PenLineIcon />
        Write a review
      </Button>
      <Button
        size="lg"
        variant="outline"
        className="h-10 w-full px-5 text-sm sm:w-auto"
        nativeButton={false}
        render={<Link href="/reviews" />}
      >
        Read all of them
        <ArrowRightIcon />
      </Button>
    </div>
  );
}

/**
 * What stands here before the reviews arrive.
 *
 * The spotlight used to fall back to six invented quotes from "Client Name"
 * and "Mentee Name". This says the true thing instead, and it says it in the
 * place a quote would go, so the band is still a band rather than a hole in
 * the page. It also does the one useful job the section has when there is
 * nothing to show: ask.
 */
function Invitation({ eyebrow }: { eyebrow: string }) {
  return (
    <div className="grid grid-cols-1 gap-12 md:grid-cols-[0.85fr_1.15fr] md:items-center lg:gap-16">
      <div>
        <Header eyebrow={eyebrow} title="This is where other people’s words go." />
        <p className="mt-5 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
          Reviews on this site are written by the people who left them and
          checked before they go up, so there is nothing here until someone
          does. If we have worked together, or you have sat through the
          mentorship, yours would be the first.
        </p>
        <Actions />
      </div>

      <div className="rounded-3xl bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--brand-primary),transparent_55%),var(--border)_50%,color-mix(in_oklch,var(--brand-violet),transparent_60%))] p-px">
        <figure className="relative overflow-hidden rounded-[calc(1.5rem-1px)] bg-card px-7 pt-10 pb-8 sm:px-10 sm:pt-12 sm:pb-10">
          <QuoteIcon
            aria-hidden
            className="pointer-events-none absolute top-6 right-6 size-16 text-primary/[0.12] sm:top-8 sm:right-8 sm:size-20"
            strokeWidth={1.25}
          />
          <div className="relative min-h-[12rem] sm:min-h-[10rem]">
            <p className="text-pretty font-heading text-xl leading-snug font-medium text-foreground sm:text-2xl">
              I would rather leave this empty than fill it with quotes nobody
              said.
            </p>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              Every other section of this site has something to fall back on
              when the database is away. This one does not, on purpose.
            </p>
          </div>
        </figure>
      </div>
    </div>
  );
}

async function Testimonials() {
  /*
    Six, not all of them. The selector is a list of names beside the quote, and
    beyond about six it stops being a list and becomes a column of names.
    `/reviews` is where the full set lives.
  */
  const [reviews, heading] = await Promise.all([
    getPublicReviews(6),
    getHeading("homepage", "home-testimonials"),
  ]);

  const quotes: SpotlightQuote[] = reviews.map((review) => ({
    quote: review.body,
    name: review.fullName,
    role: review.title,
  }));

  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-surface-raised py-16 sm:py-20 lg:py-24">
      {/* The pulsing rings sit behind the quote card rather than the middle of
          the band, now that the quote is the right-hand column. */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-full lg:w-[62%]">
        <TestimonialsBackground />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 hidden h-[34rem] w-[34rem] -translate-x-1/3 translate-y-1/3 rounded-full bg-[radial-gradient(circle,var(--brand-violet)_0%,transparent_68%)] opacity-[0.06] blur-3xl lg:block"
      />

      <Container className="relative">
        {quotes.length >= TESTIMONIAL_MINIMUM ? (
          <TestimonialSpotlight
            quotes={quotes}
            header={<Header eyebrow={heading.eyebrow} title={heading.title} />}
          />
        ) : (
          <Invitation eyebrow={heading.eyebrow} />
        )}
      </Container>
    </section>
  );
}

export { Testimonials };
