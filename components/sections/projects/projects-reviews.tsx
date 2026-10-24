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
 * Reviews from people we built something for, or nothing at all.
 *
 * Who left a review is a field on the review (`kind`), chosen by the person
 * writing it. Below the minimum the section is absent rather than padded with
 * placeholders; see TESTIMONIAL_MINIMUM.
 */
async function ProjectsReviews() {
  const [heading, reviews] = await Promise.all([
    getHeading("services", "work-testimonials"),
    getPublicReviews(4, "client"),
  ]);

  if (reviews.length < TESTIMONIAL_MINIMUM) return null;

  return (
    <section aria-labelledby="project-reviews-title" className="bg-[var(--ld-paper-2)] text-[var(--ld-ink)]">
      <div className="doc-shell py-16 sm:py-24 lg:py-28">
        <p className="mb-4 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">
          {heading.eyebrow}
        </p>
        <h2
          id="project-reviews-title"
          className="ld-display max-w-[18ch] text-[clamp(38px,5.2vw,72px)] leading-[0.95] font-extrabold tracking-[-0.045em]"
        >
          {heading.title}
        </h2>

        <ul className="mt-11 grid gap-5 md:grid-cols-2">
          {reviews.map((review) => (
            <li key={review.id}>
              <figure className="flex h-full flex-col rounded-[22px] bg-[var(--ld-paper)] p-[clamp(22px,3vw,36px)]">
                <span aria-hidden="true" className="ld-display text-6xl leading-[0.6] text-[var(--ld-accent)]">
                  &ldquo;
                </span>
                <blockquote className="mt-4 flex-1 text-[clamp(18px,1.6vw,21px)] leading-snug font-medium tracking-[-0.01em]">
                  {review.body}
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-3 border-t border-[var(--ld-line)] pt-5">
                  <span
                    aria-hidden="true"
                    className="grid size-10 place-items-center rounded-full bg-[var(--ld-ink)] font-mono text-xs text-[var(--ld-tint)]"
                  >
                    {initials(review.fullName)}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{review.fullName}</span>
                    <span className="block text-[13px] text-[var(--ld-text-muted)]">{review.title}</span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export { ProjectsReviews };
