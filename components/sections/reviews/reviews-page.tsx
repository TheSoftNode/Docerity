import { Container } from "@/components/shared/container";
import { Bloom, Eyebrow } from "@/components/shared/section-kit";
import { ScrambleText } from "@/components/shared/scramble-text";
import { ReviewCard } from "@/components/sections/reviews/review-card";
import { ReviewForm } from "@/components/sections/reviews/review-form";
import { StarDisplay } from "@/components/sections/reviews/star-rating";
import type { PublicReview } from "@/lib/reviews/display";

/** The average, to one decimal place, or null when there is nothing to average. */
function averageOf(reviews: PublicReview[]): number | null {
  if (reviews.length === 0) return null;
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}

function ReviewsPage({ reviews }: { reviews: PublicReview[] }) {
  const average = averageOf(reviews);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/80 bg-background pt-10 pb-12 sm:pt-12 lg:pt-14 lg:pb-16">
        <Bloom className="top-0 right-0 translate-x-1/3 -translate-y-1/3" />
        <Bloom tone="violet" className="bottom-0 left-0 -translate-x-1/3 translate-y-1/3" />

        <Container className="relative">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end lg:gap-12">
            <div>
              <Eyebrow>
                <ScrambleText text="Reviews" />
              </Eyebrow>
              <h1 className="mt-3 text-balance font-heading text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-[1.1] tracking-tight text-foreground">
                What it is like to{" "}
                <span className="bg-[linear-gradient(120deg,var(--brand-primary),var(--brand-violet))] bg-clip-text text-transparent">
                  work with me
                </span>
                .
              </h1>
              <p className="mt-4 max-w-[52ch] text-[0.9375rem] leading-[1.75] text-muted-foreground">
                From clients and the engineers I have mentored. If we have worked
                together, the form below goes straight to me.
              </p>
            </div>

            {average !== null ? (
              <dl className="flex shrink-0 items-center gap-5 rounded-xl border border-border bg-card/50 px-5 py-4">
                <div>
                  <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
                    Average
                  </dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <span className="font-heading text-2xl font-semibold tabular-nums text-foreground">
                      {average.toFixed(1)}
                    </span>
                    <StarDisplay rating={Math.round(average)} />
                  </dd>
                </div>
                <div className="border-l border-border pl-5">
                  <dt className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
                    Reviews
                  </dt>
                  <dd className="mt-1 font-heading text-2xl font-semibold tabular-nums text-foreground">
                    {reviews.length}
                  </dd>
                </div>
              </dl>
            ) : null}
          </div>
        </Container>
      </section>

      {reviews.length > 0 ? (
        <section
          id="published"
          className="border-b border-border/80 bg-background py-12 lg:py-16"
        >
          <Container>
            {/*
              `columns` rather than a grid. Reviews vary from two lines to two
              paragraphs, and a grid row is as tall as its tallest cell, so a
              single long review leaves a band of empty card next to it. A
              masonry column flow packs them by height instead.
            */}
            <div className="columns-1 gap-5 md:columns-2 lg:columns-3">
              {reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  /* `break-inside-avoid` stops a column break mid-card, which
                     would split one quote across two columns. */
                  className="mb-5 break-inside-avoid"
                />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      <section id="leave-a-review" className="bg-background py-12 lg:py-16">
        <Container>
          <div className="mx-auto max-w-[44rem]">
            <div className="text-center">
              <Eyebrow>
                <ScrambleText text="Leave a review" />
              </Eyebrow>
              <h2 className="mt-3 text-balance font-heading text-[clamp(1.5rem,2.4vw,2rem)] font-semibold leading-[1.15] tracking-tight text-foreground">
                {reviews.length > 0
                  ? "Worked together? I would like to hear it."
                  : "Be the first to leave one."}
              </h2>
              <p className="mx-auto mt-3 max-w-[48ch] text-sm leading-relaxed text-muted-foreground">
                Honest is more useful than flattering. If something could have
                gone better, say so.
              </p>
            </div>

            <div className="mt-8 rounded-2xl bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--brand-primary),transparent_55%),var(--border)_45%,color-mix(in_oklch,var(--brand-violet),transparent_60%))] p-px">
              <div className="rounded-2xl bg-card px-5 py-6 sm:px-7 sm:py-7">
                <ReviewForm />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

export { ReviewsPage };
