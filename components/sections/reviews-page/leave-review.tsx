import type { SectionHeading } from "@/lib/content/blocks/source";
import { pad } from "@/components/sections/blog-page/blog-content";
import { ReviewForm } from "@/components/sections/reviews-page/review-form";

/** Where the homepage and the mentorship page link somebody to leave one. */
export const LEAVE_A_REVIEW_ID = "leave-a-review";

/**
 * Leaving a review: what happens to it on the left, the form on the right.
 * The middle step, the reading, is the one picked out, because it is the
 * part other sites skip.
 */
function LeaveReview({
  heading,
  title,
  process,
}: {
  heading: SectionHeading;
  /** The form heading, which changes before the first review. */
  title: string;
  process: { title: string; description: string }[];
}) {
  return (
    <section id={LEAVE_A_REVIEW_ID} aria-labelledby="leave-title" className="scroll-mt-24 bg-white text-[var(--ld-ink)]">
      <div className="doc-shell grid items-start gap-[clamp(32px,5vw,80px)] py-[clamp(64px,8vw,112px)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="lg:sticky lg:top-28">
          <p className="mb-3.5 flex flex-wrap items-center gap-2.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">
            <span className="rounded-full bg-[#dfe6fb] px-2.5 py-1 text-[var(--ld-deep)]">Add yours</span>
            {heading.eyebrow}
          </p>
          <h2 id="leave-title" className="ld-display max-w-[12ch] text-[clamp(36px,4.8vw,66px)] leading-[0.95] font-extrabold tracking-[-0.045em] text-balance">
            {title}
          </h2>
          {heading.lede ? <p className="mt-5 max-w-[26rem] text-[17px] leading-relaxed text-[var(--ld-text-2)]">{heading.lede}</p> : null}
          <ol className="mt-[30px]">
            {process.map((step, index) => {
              const reading = index === 1;
              return (
                <li key={step.title} className="grid grid-cols-[40px_minmax(0,1fr)] gap-3.5 pb-[22px] last:pb-0">
                  <span
                    aria-hidden="true"
                    className={`grid size-10 place-items-center rounded-xl font-mono text-xs ${reading ? "bg-[var(--ld-ink)] text-[var(--ld-paper)]" : "bg-[#eef1f8]"}`}
                  >
                    {pad(index + 1)}
                  </span>
                  <span>
                    <span className="ld-display block text-xl font-bold">{step.title}</span>
                    <span className="mt-1 block text-[15px] leading-normal text-[var(--ld-text-2)]">{step.description}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="rounded-[28px] border border-[var(--ld-line)] bg-[var(--ld-paper)] p-[clamp(20px,3vw,36px)]">
          <ReviewForm />
        </div>
      </div>
    </section>
  );
}

export { LeaveReview };
