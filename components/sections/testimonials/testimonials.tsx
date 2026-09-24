import { Container } from "@/components/shared/container";
import { TestimonialsBackground } from "@/components/sections/testimonials/testimonials-background";
import {
  TestimonialSpotlight,
  type SpotlightQuote,
} from "@/components/sections/testimonials/testimonial-spotlight";
import { getPublicReviews } from "@/lib/reviews/display";

/**
 * A Server Component, so the approved reviews are read during the render rather
 * than fetched from the browser. The spotlight below it stays a Client
 * Component because it animates, and receives the quotes as props.
 */
async function Testimonials() {
  /*
    Six, not all of them. The selector is a list of names beside the quote, and
    beyond about six it stops being a list and becomes a column of names.
    `/reviews` is where the full set lives.
  */
  const reviews = await getPublicReviews(6);

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
        <TestimonialSpotlight
          quotes={quotes}
          header={
            <>
              <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
                What people say
              </p>
              <h2 className="mt-4 font-heading text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold leading-[1.1] tracking-tight text-foreground">
                Trusted by teams, engineers and readers.
              </h2>
            </>
          }
        />
      </Container>
    </section>
  );
}

export { Testimonials };
