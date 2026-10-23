import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import { getHeading } from "@/lib/content/blocks/source";
import { getPublicReviews, TESTIMONIAL_MINIMUM } from "@/lib/reviews/display";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Real mentee reviews, or an honest invitation.
 *
 * Invented testimonials are a liability: the first prospect who asks who said
 * it is a bad moment. So below TESTIMONIAL_MINIMUM nobody is quoted; the
 * section says the first reviews are being collected and asks mentees for
 * theirs, rather than vanishing and leaving a gap where trust should be.
 *
 * At the minimum and above, the longest review leads, set large, and the rest
 * sit beside it, so the section reads as voices rather than a card grid.
 */
async function MentorshipReviews() {
  const [heading, reviews] = await Promise.all([
    getHeading("mentorship", "mentorship-testimonials"),
    getPublicReviews(4, "mentee"),
  ]);

  const enough = reviews.length >= TESTIMONIAL_MINIMUM;
  const [lead, ...rest] = enough ? [...reviews].sort((a, b) => b.body.length - a.body.length) : [];

  return (
    <section aria-labelledby="mentee-reviews-title" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
      <div className="doc-shell py-[clamp(64px,8vw,112px)]">
        <p className="mb-3.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">{heading.eyebrow}</p>
        <h2
          id="mentee-reviews-title"
          className="ld-display text-[clamp(38px,5.2vw,72px)] leading-[0.95] font-extrabold tracking-[-0.045em]"
        >
          {heading.title}
        </h2>

        {lead ? (
          <div className="mt-11 grid gap-[18px] lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
            <figure className="flex flex-col justify-between gap-8 rounded-[26px] bg-[var(--ld-ink)] p-[clamp(26px,3.4vw,48px)] text-[var(--ld-paper)]">
              <span aria-hidden="true" className="ld-display text-8xl leading-[0.5] text-[var(--ld-accent)]">
                &ldquo;
              </span>
              <blockquote className="ld-display text-[clamp(24px,2.4vw,34px)] leading-tight font-semibold tracking-[-0.02em]">
                {lead.body}
              </blockquote>
              <figcaption className="flex items-center gap-3 border-t border-[rgb(var(--ld-tint-rgb)/0.18)] pt-5">
                <span aria-hidden="true" className="grid size-[42px] place-items-center rounded-full bg-[var(--ld-tint)] font-mono text-[13px] text-[var(--ld-ink)]">
                  {initials(lead.fullName)}
                </span>
                <span>
                  <span className="block font-semibold">{lead.fullName}</span>
                  <span className="text-[13.5px] text-[var(--ld-muted-3)]">{lead.title}</span>
                </span>
              </figcaption>
            </figure>
            <div className="grid content-start gap-[18px]">
              {rest.map((review) => (
                <figure key={review.id} className="rounded-[22px] border border-[var(--ld-line)] bg-[var(--ld-card)] p-7">
                  <blockquote className="text-lg leading-normal font-medium">{review.body}</blockquote>
                  <figcaption className="mt-[18px] text-sm text-[var(--ld-text-muted)]">
                    <b className="text-[var(--ld-ink)]">{review.fullName}</b> · {review.title}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-11 grid items-center gap-7 rounded-[26px] border border-[var(--ld-line)] bg-[var(--ld-card)] p-[clamp(26px,3.4vw,44px)] md:grid-cols-[minmax(0,1fr)_auto]">
            <div className="flex items-center gap-[22px]">
              <span
                aria-hidden="true"
                className="ld-display grid size-[72px] shrink-0 place-items-center rounded-[22px] bg-[var(--ld-ink)] text-[52px] leading-none text-[var(--ld-accent)]"
              >
                &ldquo;
              </span>
              <span>
                <span className="ld-display block text-[clamp(22px,2.2vw,30px)] font-bold tracking-[-0.02em]">
                  The first reviews are being collected.
                </span>
                <span className="mt-1.5 block text-base leading-normal text-[var(--ld-text-2)]">
                  Mentored by Docerity? Your words go here, exactly as you write them, once they are approved.
                </span>
              </span>
            </div>
            <Link
              href="/reviews#leave-a-review"
              className="inline-flex min-h-12 items-center gap-2 justify-self-start rounded-full bg-[var(--ld-ink)] px-[22px] text-[15px] font-semibold whitespace-nowrap text-[var(--ld-paper)] transition-transform hover:-translate-y-0.5"
            >
              Leave a review
              <ArrowUpRightIcon aria-hidden="true" className="size-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export { MentorshipReviews };
