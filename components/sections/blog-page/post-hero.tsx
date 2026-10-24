import Link from "next/link";

import type { BlogElement } from "@/components/sections/blog-page/blog-content";
import { pad, titleParts } from "@/components/sections/blog-page/blog-content";
import type { PostByline } from "@/components/sections/blog/blog-data";
import { Byline } from "@/components/sections/blog-page/byline";

/**
 * A piece's hero: its element card, tilted, beside the title.
 *
 * The card is the piece as an element: its number, its symbol set very large,
 * the concept and its one-line meaning (an explainer) or the topic (an
 * article). The heading is the everyday title for an explainer, introduced
 * by "≈ in everyday life", and the article's own title otherwise.
 */
function PostHero({ element, author }: { element: BlogElement; author?: PostByline }) {
  const explainer = element.type === "explainer";
  const title = titleParts(element.line);

  return (
    <section className="relative -mt-[76px] overflow-hidden bg-[var(--ld-paper)] pt-[118px] text-[var(--ld-ink)]">
      <span
        aria-hidden="true"
        className="absolute top-[10%] -left-[10%] aspect-square w-[min(70vw,900px)] rounded-full bg-[radial-gradient(circle,rgb(var(--ld-tint-rgb)/0.45),transparent_65%)]"
      />
      <div className="doc-shell relative">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2.5 border-b-2 border-[var(--ld-ink)] pb-3.5 font-mono text-[11.5px] tracking-[0.1em] uppercase">
          <Link href="/blog" className="text-[var(--ld-ink)] transition-colors hover:text-[var(--ld-deep)]">
            ← The table of explainers
          </Link>
          <span className="text-[var(--ld-text-muted)]">
            <time dateTime={element.publishedAt}>{element.date}</time> · {element.read} read
          </span>
        </div>

        <div className="grid items-end gap-[clamp(28px,4.5vw,72px)] py-[clamp(40px,5.5vw,76px)] md:grid-cols-[auto_minmax(0,1fr)]">
          <div
            aria-hidden="true"
            className={`ld-up relative aspect-[4/5] w-[clamp(180px,24vw,320px)] -rotate-2 rounded-[26px] p-[22px] text-[var(--ld-paper)] shadow-[0_50px_90px_-50px_rgb(var(--ld-ink-rgb)/0.75)] ${
              explainer ? "bg-[var(--ld-ink)]" : "bg-[var(--ld-deep)]"
            }`}
          >
            <span className="flex justify-between font-mono text-[13px] opacity-70">
              <span>{pad(element.number)}</span>
              <span>{element.read}</span>
            </span>
            <span className="ld-display absolute top-1/2 left-[22px] -translate-y-[62%] text-[clamp(80px,11vw,150px)] leading-none font-extrabold tracking-[-0.06em]">
              {element.symbol}
            </span>
            <span className="absolute inset-x-[22px] bottom-[22px]">
              <span className="ld-display block text-[22px] font-bold tracking-[-0.02em]">{explainer ? element.name : element.kind}</span>
              <span className="mt-1 block text-sm opacity-70">{explainer ? element.caption : "An article"}</span>
            </span>
            <span className="absolute right-[18px] bottom-[18px] size-2 rounded-full bg-[var(--ld-accent)]" />
          </div>

          <div>
            <p className="ld-up flex items-center gap-3 font-mono text-[12.5px] tracking-[0.1em] text-[var(--ld-deep)] uppercase">
              {explainer ? (
                <>
                  Explainer · {element.name}
                  <span aria-hidden="true" className="h-px w-9 bg-[#9aa6c8]" />
                  ≈ in everyday life
                </>
              ) : (
                <>Article · {element.kind}</>
              )}
            </p>
            <h1 className="ld-display ld-up ld-delay-1 mt-4 max-w-[16ch] text-[clamp(40px,5.8vw,92px)] leading-[0.9] font-extrabold tracking-[-0.055em] text-balance">
              {title.text}
              <span className="text-[var(--ld-accent)]">{title.stop}</span>
            </h1>
            <p className="ld-up ld-delay-2 mt-6 max-w-[38rem] text-[clamp(18px,1.55vw,21px)] leading-relaxed text-[var(--ld-text-2)]">
              {element.hook}
            </p>
          </div>
        </div>

        <div className="ld-up ld-delay-3 flex flex-wrap items-center gap-x-[22px] gap-y-3.5 border-t border-[var(--ld-line)] pt-5 pb-[26px]">
          <Byline author={author} />
          <span className="flex-1" />
          <ul aria-label="Topics" className="flex flex-wrap gap-2">
            {element.tags.map((tag) => (
              <li key={tag} className="rounded-full border border-[var(--ld-line-2)] px-3 py-1.5 text-[13px] text-[var(--ld-text-2)]">
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export { PostHero };
