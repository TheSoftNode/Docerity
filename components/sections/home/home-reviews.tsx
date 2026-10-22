import Link from "next/link";

import { getHeading } from "@/lib/content/blocks/source";
import { getPublicReviews, TESTIMONIAL_MINIMUM } from "@/lib/reviews/display";

/** How many reviews the section reads: one to feature, the rest named. */
const REVIEWS_SHOWN = 6;

/**
 * Reviews, honestly.
 *
 * Once there are enough to stand as a set (`TESTIMONIAL_MINIMUM`, the same
 * rule the previous testimonials section followed), it features the newest
 * approved review in full and names the people behind the next few, each name
 * leading to the reviews page. Until then it shows an empty slot that says so,
 * because an empty slot is the truth and a placeholder quote is not.
 *
 * The page revalidates every five minutes and approving a review revalidates
 * it at once, so a newly approved review appears here without a deploy.
 */
async function HomeReviews() {
  const [heading, reviews] = await Promise.all([
    getHeading("homepage", "home-testimonials"),
    getPublicReviews(REVIEWS_SHOWN),
  ]);

  const featured = reviews.length >= TESTIMONIAL_MINIMUM ? reviews[0] : null;
  const others = featured ? reviews.slice(1) : [];

  return (
    <section
      id="reviews"
      aria-labelledby="home-reviews-title"
      className="scroll-mt-24 bg-[var(--ld-paper)] text-[var(--ld-ink)]"
    >
      <div className="doc-shell pb-16 sm:pb-24 lg:pb-28">
        <div
          className={
            featured
              ? "flex flex-wrap items-center justify-between gap-7 rounded-[28px] bg-[var(--ld-card)] p-[clamp(24px,4vw,48px)] shadow-[0_30px_60px_-40px_rgb(var(--ld-ink-rgb)/0.35)]"
              : "flex flex-wrap items-center justify-between gap-7 rounded-[28px] border-2 border-dashed border-[var(--ld-line-2)] p-[clamp(24px,4vw,48px)]"
          }
        >
          <div className="flex-[1_1_480px]">
            <h2
              id="home-reviews-title"
              className="font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase"
            >
              {heading.eyebrow}
            </h2>

            {featured ? (
              <>
                <figure className="mt-4">
                  <blockquote className="ld-display text-[clamp(24px,3vw,38px)] leading-[1.15] font-bold tracking-[-0.025em] text-balance">
                    “{featured.body}”
                  </blockquote>
                  <figcaption className="mt-4 text-base text-[var(--ld-text-2)]">
                    <span className="font-semibold text-[var(--ld-ink)]">{featured.fullName}</span>
                    {featured.title ? <>, {featured.title}</> : null}
                  </figcaption>
                </figure>
                {others.length > 0 ? (
                  <p className="mt-5 text-sm text-[var(--ld-text-muted)]">
                    Also from{" "}
                    {others.map((review, index) => (
                      <span key={review.id}>
                        <Link
                          href="/reviews"
                          className="font-medium text-[var(--ld-ink)] underline decoration-[var(--ld-line-2)] underline-offset-4 hover:decoration-current"
                        >
                          {review.fullName}
                        </Link>
                        {index < others.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <p className="ld-display mt-4 text-[clamp(28px,3.4vw,44px)] leading-[1.1] font-bold tracking-[-0.03em]">
                  “Your review goes here
                  <span aria-hidden="true" className="ld-blink text-[var(--ld-accent)]">
                    ▍
                  </span>
                  ”
                </p>
                <p className="mt-4 max-w-[35rem] text-base leading-relaxed text-[var(--ld-text-2)]">
                  Every review is written by a real client or mentee and checked before it goes up.
                  We would rather leave this empty than fill it with quotes nobody said.
                </p>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/reviews#leave-a-review"
              className="inline-flex min-h-13 items-center rounded-full bg-[var(--ld-ink)] px-6 font-semibold text-[var(--ld-paper)] transition-transform hover:-translate-y-0.5"
            >
              {featured ? "Write a review" : "Write the first one"}
            </Link>
            {featured ? (
              <Link
                href="/reviews"
                className="inline-flex min-h-13 items-center rounded-full border-[1.5px] border-[var(--ld-ink)] px-6 font-semibold transition-transform hover:-translate-y-0.5"
              >
                Read all of them
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export { HomeReviews };
