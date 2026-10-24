import type { SectionHeading } from "@/lib/content/blocks/source";
import type { PairView } from "@/lib/content/blocks/views";
import { CraftTools } from "@/components/sections/contribute-page/craft-tools";
import type { Size } from "@/components/sections/contribute-page/contribute-content";

/**
 * What makes a good explainer: the craft in a few paragraphs and a pull
 * quote, beside the two things to try, a concept and its pair, and how wide
 * a piece can get before it stops being one.
 */
function ContributeCraft({
  heading,
  paragraphs,
  quote,
  pairs,
  sizes,
}: {
  heading: SectionHeading;
  paragraphs: string[];
  quote: string;
  pairs: PairView[];
  sizes: Size[];
}) {
  return (
    <section aria-labelledby="craft-title" className="bg-white text-[var(--ld-ink)]">
      <div className="doc-shell grid items-start gap-[clamp(32px,5vw,88px)] py-[clamp(64px,8vw,112px)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <p className="mb-3.5 flex flex-wrap items-center gap-2.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">
            {heading.eyebrow}
          </p>
          <h2 id="craft-title" className="ld-display max-w-[13ch] text-[clamp(36px,4.8vw,66px)] leading-[0.95] font-extrabold tracking-[-0.045em] text-balance">
            {heading.title}
          </h2>
          {heading.lede ? <p className="mt-5 max-w-[34rem] text-[17px] leading-relaxed text-[var(--ld-text-2)]">{heading.lede}</p> : null}
          <div className="mt-6 grid max-w-[34rem] gap-4 text-[16.5px] leading-[1.75] text-[var(--ld-text-2)]">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {quote ? (
            <blockquote className="ld-display mt-[30px] border-l-[3px] border-[var(--ld-accent)] py-1 pl-5 text-[clamp(22px,2.2vw,28px)] leading-[1.2] font-bold tracking-[-0.02em]">
              {quote}
            </blockquote>
          ) : null}
        </div>
        <CraftTools pairs={pairs} sizes={sizes} />
      </div>
    </section>
  );
}

export { ContributeCraft };
