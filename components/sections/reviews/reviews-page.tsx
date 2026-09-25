"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownIcon, PenLineIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Bloom } from "@/components/shared/section-kit";
import { ScrambleText } from "@/components/shared/scramble-text";
import { CornerBrackets } from "@/components/sections/explainers/explainer-corner-brackets";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/components/sections/reviews/review-card";
import { ReviewForm } from "@/components/sections/reviews/review-form";
import { RatingSummary } from "@/components/sections/reviews/rating-summary";
import type { PublicReview } from "@/lib/reviews/display";

/**
 * The reviews page, built as a record rather than a landing page.
 *
 * The first version was a thin hero with an empty right half, then a centred
 * heading over a centred single-column form. That is the generic shape, and it
 * is the same dead-space problem the About hero had before it became a dossier
 * panel. This uses the language the rest of the site already speaks: a gradient
 * hairline panel, corner brackets, a mono header rail carrying metadata, and a
 * figure that is real data rather than a decorative stat.
 */

/** A small labelled value for the header rails. */
function RailItem({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-baseline gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </span>
  );
}

/*
  What happens to a submission, stated plainly.

  It is here because the honest answer is a selling point: on a page where every
  other site publishes whatever it is sent, saying "I read these first" is the
  difference between a testimonial wall and a record.
*/
const PROCESS = [
  {
    title: "You write it",
    detail: "Two minutes. Honest is more useful to the next person than flattering.",
  },
  {
    title: "I read it",
    detail: "Every one, myself. If something needs checking I email you before it goes up.",
  },
  {
    title: "It goes up",
    detail: "With your name and role, and a link to your work if you gave one.",
  },
] as const;

function distributionOf(reviews: PublicReview[]): Record<number, number> {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const review of reviews) counts[review.rating] = (counts[review.rating] ?? 0) + 1;
  return counts;
}

function ReviewsPage({ reviews }: { reviews: PublicReview[] }) {
  const reduceMotion = useReducedMotion();

  const total = reviews.length;
  const average =
    total > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / total : 0;

  /* The most recent one, for the rail. A record shows when it was last added
     to; a testimonial wall pretends time does not pass. */
  const latest = reviews[0]?.publishedAt
    ? new Date(reviews[0].publishedAt).toLocaleDateString("en-GB", {
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/80 bg-background">
        <Bloom className="top-0 right-0 translate-x-1/3 -translate-y-1/2" />
        <Bloom tone="violet" className="bottom-0 left-0 -translate-x-1/3 translate-y-1/2" />

        <Container className="relative pt-8 pb-12 lg:pt-10 lg:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.6, ease: "easeOut" }}
            className="relative rounded-3xl bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--brand-primary),transparent_62%),var(--border)_38%,color-mix(in_oklch,var(--brand-violet),transparent_66%))] p-px shadow-[0_40px_90px_-50px_rgba(0,0,0,0.95)]"
          >
            <div className="relative rounded-[calc(1.5rem-1px)] bg-card">
              <CornerBrackets />

              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5 border-b border-border/70 px-6 py-3 font-mono text-[0.625rem] tracking-[0.16em] uppercase sm:px-8">
                <span className="text-primary">
                  <ScrambleText text="Record · Reviews" />
                </span>
                <span className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
                  <RailItem label="Entries" value={String(total).padStart(2, "0")} />
                  <RailItem label="Moderated" value="Every one" />
                  {latest ? <RailItem label="Latest" value={latest} /> : null}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-8 px-6 pt-8 pb-7 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-14 lg:pt-9 lg:pb-8">
                <div className="min-w-0">
                  <h1 className="max-w-[24ch] text-balance font-heading text-[clamp(1.9rem,5vw,2.6rem)] leading-[1.14] font-semibold tracking-tight text-foreground md:text-[clamp(1.9rem,3vw,2.75rem)] lg:text-[clamp(2.1rem,2.9vw,3rem)]">
                    The people who{" "}
                    <span className="bg-[linear-gradient(120deg,var(--brand-primary),var(--brand-violet))] bg-clip-text text-transparent">
                      paid for the work
                    </span>
                    , in their words.
                  </h1>

                  <p className="mt-5 max-w-[54ch] text-[0.9375rem] leading-[1.75] text-muted-foreground">
                    {total > 0
                      ? "Clients and the engineers I have mentored. Nothing here was written by me, and nothing appears until I have read it."
                      : "Clients and the engineers I have mentored. There is nothing here yet, which is the honest state of a page that only publishes what people actually send."}
                  </p>

                  <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      size="lg"
                      className="h-11 w-full px-6 text-sm sm:w-auto"
                      nativeButton={false}
                      render={<Link href="#leave-a-review" />}
                    >
                      <PenLineIcon />
                      Write a review
                    </Button>

                    {total > 0 ? (
                      <Button
                        size="lg"
                        variant="outline"
                        className="h-11 w-full px-6 text-sm sm:w-auto"
                        nativeButton={false}
                        render={<Link href="#record" />}
                      >
                        Read them
                        <ArrowDownIcon />
                      </Button>
                    ) : null}
                  </div>
                </div>

                {/*
                  The right column, which in the first version was empty space.

                  With reviews it holds the rating and its distribution. Without
                  them it says so, rather than repeating the three steps that sit
                  beside the form a screen below: both lists were visible at once
                  on a 1440px viewport, which reads as padding.
                */}
                <div className="w-full lg:w-[19rem] lg:shrink-0 lg:border-l lg:border-border/70 lg:pl-10">
                  {total > 0 ? (
                    <RatingSummary
                      average={average}
                      total={total}
                      distribution={distributionOf(reviews)}
                    />
                  ) : (
                    <div className="rounded-xl border border-dashed border-border px-5 py-6">
                      <p className="font-mono text-[0.625rem] tracking-[0.16em] uppercase text-muted-foreground">
                        No entries
                      </p>
                      <p className="mt-2.5 text-sm leading-relaxed text-foreground">
                        The first one appears here once somebody sends it and I
                        have read it.
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        An empty page is the honest state. Filling it with
                        invented quotes would be the alternative.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {total > 0 ? (
        <section
          id="record"
          className="scroll-mt-20 border-b border-border/80 bg-surface-raised py-12 lg:py-16"
        >
          <Container>
            {/*
              Two columns with the second offset down, rather than a uniform
              grid or a masonry flow. A grid row is as tall as its tallest cell,
              so one long review leaves a band of empty card beside it; the
              offset also stops the two columns reading as a table of identical
              boxes.
            */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:items-start lg:gap-6">
              <div className="flex flex-col gap-5 lg:gap-6">
                {reviews
                  .filter((_, index) => index % 2 === 0)
                  .map((review, column) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      index={column * 2}
                    />
                  ))}
              </div>

              <div className="flex flex-col gap-5 md:mt-10 lg:gap-6">
                {reviews
                  .filter((_, index) => index % 2 === 1)
                  .map((review, column) => (
                    <ReviewCard
                      key={review.id}
                      review={review}
                      index={column * 2 + 1}
                    />
                  ))}
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      <section
        id="leave-a-review"
        className="scroll-mt-20 bg-background py-12 lg:py-16"
      >
        <Container>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-14">
            {/*
              The process on the left, the form on the right. A centred heading
              above a centred form is the shape this page had, and it wastes the
              width while telling the reader nothing while they scroll past it.
            */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="font-mono text-[0.625rem] tracking-[0.16em] uppercase text-primary">
                <ScrambleText text="Leave a review" />
              </p>
              <h2 className="mt-3 text-balance font-heading text-[clamp(1.5rem,2.4vw,2rem)] leading-[1.15] font-semibold tracking-tight text-foreground">
                {total > 0
                  ? "Worked together? Add yours."
                  : "Worked together? Be the first."}
              </h2>

              <ol className="mt-7 space-y-5 border-t border-border/70 pt-6">
                {PROCESS.map((step, index) => (
                  <li key={step.title} className="flex gap-3">
                    <span className="mt-0.5 font-mono text-[0.625rem] tracking-[0.16em] text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-foreground">
                        {step.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                        {step.detail}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="relative rounded-3xl bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--brand-primary),transparent_62%),var(--border)_38%,color-mix(in_oklch,var(--brand-violet),transparent_66%))] p-px shadow-[0_40px_90px_-50px_rgba(0,0,0,0.95)]">
              <div className="rounded-[calc(1.5rem-1px)] bg-card">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5 border-b border-border/70 px-5 py-3 font-mono text-[0.625rem] tracking-[0.16em] uppercase sm:px-7">
                  <span className="text-primary">Submission</span>
                  <RailItem label="Published" value="After review" />
                </div>

                <div className="px-5 py-6 sm:px-7 sm:py-7">
                  <ReviewForm />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

export { ReviewsPage };
