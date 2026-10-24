import Link from "next/link";

import { getGroup, getHeading } from "@/lib/content/blocks/source";
import type { PairView } from "@/lib/content/blocks/views";
import { FlipCard } from "@/components/sections/home/flip-card";

/**
 * Tech explainers, as a card that turns from a concept to the everyday thing
 * it works like.
 *
 * Reads the editable explainer pairs and heading, as the previous section did,
 * and walks through every pair rather than only the first.
 */
async function HomeExplainers() {
  const [heading, pairs] = await Promise.all([
    getHeading("explainers", "explainers"),
    getGroup<PairView[]>("explainers", "pairs"),
  ]);

  return (
    <section
      id="explainers"
      aria-labelledby="home-explainers-title"
      className="relative scroll-mt-24 overflow-hidden bg-[var(--ld-paper)] text-[var(--ld-ink)]"
    >
      <div
        aria-hidden="true"
        className="ld-drift absolute top-[120px] -left-20 size-[180px] rounded-[40px] border-2 border-dashed border-[var(--ld-line-2)]"
      />
      <div className="doc-shell relative flex flex-wrap items-center gap-14 py-16 sm:py-24 lg:py-28">
        <div className="flex-[1_1_400px]">
          <p className="mb-4 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">
            {heading.eyebrow}
          </p>
          <h2
            id="home-explainers-title"
            className="ld-display text-[clamp(40px,5.6vw,80px)] leading-[0.95] font-extrabold tracking-[-0.045em] text-balance"
          >
            {heading.title}
          </h2>
          {heading.lede ? (
            <p className="mt-7 max-w-[28rem] text-lg leading-relaxed text-[var(--ld-text-2)]">{heading.lede}</p>
          ) : null}
          <Link
            href="/blog"
            className="mt-8 inline-flex min-h-13 items-center rounded-full bg-[var(--ld-ink)] px-6 font-semibold text-[var(--ld-paper)] transition-transform hover:-translate-y-0.5"
          >
            Read the blog
          </Link>
        </div>

        <FlipCard pairs={pairs ?? []} />
      </div>
    </section>
  );
}

export { HomeExplainers };
