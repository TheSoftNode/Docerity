"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import type { SectionHeading } from "@/lib/content/blocks/source";
import type { EngagementView } from "@/lib/content/blocks/views";
import { withArticle } from "@/components/sections/how-we-work-page/how-we-work-content";

type Engagement = EngagementView & { id: string };
type Sentence = { lead: string; answer: string; more: string; or: string };

/**
 * The hero and the engagements, which share one choice.
 *
 * The hero is a sentence the visitor finishes: "I need" and then, very large,
 * what they need. Picking a need under it swaps the words and names the
 * engagement that fits, with a link down to its row; that row is the one lit
 * in the list below, so the two read as one decision. Nothing moves on its
 * own: the words change only when a choice is made, and under reduced motion
 * they change without the rise.
 */
function EngagementPicker({
  hero,
  heading,
  sentence,
  engagements,
}: {
  hero: SectionHeading;
  heading: SectionHeading;
  sentence: Sentence;
  engagements: Engagement[];
}) {
  const [picked, setPicked] = useState(0);
  const current = engagements[picked] ?? engagements[0];
  if (!current) return null;

  return (
    <>
      <section
        aria-labelledby="hww-title"
        className="relative -mt-[76px] flex min-h-[100svh] flex-col bg-white pt-[104px] pb-7 text-[var(--ld-ink)]"
      >
        <div className="doc-shell grid min-h-0 w-full flex-1 grid-rows-[auto_minmax(0,1fr)_auto]">
          <div className="flex flex-col gap-2.5 border-b border-[var(--ld-line)] pb-[18px] md:flex-row md:items-baseline md:justify-between md:gap-10">
            <h1 id="hww-title" className="ld-display ld-up order-2 max-w-[26ch] text-[clamp(24px,2.2vw,32px)] leading-[1.12] font-bold tracking-[-0.025em] md:order-1">
              {hero.title}
            </h1>
            <p className="order-1 font-mono text-[12.5px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase md:order-2">{hero.eyebrow}</p>
          </div>

          <div className="flex flex-col justify-center py-[clamp(28px,5vh,56px)]">
            {/* Read as one sentence: "I need a product built, start to finish." */}
            <p
              aria-live="polite"
              className="ld-display m-0 text-[clamp(44px,7.4vw,112px)] leading-[0.98] font-extrabold tracking-[-0.05em]"
            >
              {sentence.lead}{" "}
              <br aria-hidden="true" />
              <span
                key={current.id}
                className="ld-up inline-block border-b-[clamp(4px,0.45vw,6px)] border-[var(--ld-ink)] text-[var(--ld-deep)] md:whitespace-nowrap"
              >
                {current.need}
              </span>
            </p>

            <div className="mt-[clamp(28px,4.5vh,44px)] grid max-w-[1100px] gap-3 md:grid-cols-[auto_1fr] md:gap-7">
              <p className="pt-2.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">
                {withArticle(sentence.answer, current.title)}
              </p>
              <div key={current.id} className="ld-up">
                <p className="ld-display text-[clamp(26px,2.4vw,34px)] leading-tight font-extrabold tracking-[-0.03em]">{current.title}</p>
                {current.summary ? <p className="mt-1.5 max-w-[46ch] text-[17px] leading-[1.55] text-[var(--ld-text-2)]">{current.summary}</p> : null}
                <a
                  href={`#${current.id}`}
                  className="mt-4 inline-block border-b-[1.5px] border-[var(--ld-ink)] pb-[3px] text-base font-semibold outline-none transition-colors hover:text-[var(--ld-deep)] focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)]"
                >
                  {sentence.more} <span aria-hidden="true">↓</span>
                </a>
              </div>
            </div>
          </div>

          {engagements.length > 1 ? (
            <div className="flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-[var(--ld-line)] pt-[18px]">
              {sentence.or ? (
                <span aria-hidden="true" className="font-mono text-xs tracking-[0.1em] text-[#9aa0b1] uppercase">
                  {sentence.or}
                </span>
              ) : null}
              <div role="group" aria-label={`${sentence.lead}…`} className="flex flex-wrap gap-x-7 gap-y-3">
                {engagements.map((engagement, index) => {
                  const on = index === picked;
                  return (
                    <button
                      key={engagement.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setPicked(index)}
                      className={cn(
                        "border-b-[1.5px] py-0.5 text-[15px] outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)]",
                        on ? "border-[var(--ld-ink)] text-[var(--ld-ink)]" : "border-transparent text-[#8a90a3] hover:text-[var(--ld-ink)]"
                      )}
                    >
                      {engagement.choice}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="engagements-title" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
        <div className="doc-shell py-[clamp(64px,8vw,112px)]">
          <div className="mb-[clamp(36px,4vw,56px)] grid items-end gap-6 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="mb-3.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">{heading.eyebrow}</p>
              <h2
                id="engagements-title"
                className="ld-display max-w-[12ch] text-[clamp(36px,4.8vw,66px)] leading-[0.95] font-extrabold tracking-[-0.045em] text-balance"
              >
                {heading.title}
              </h2>
            </div>
            {heading.lede ? <p className="max-w-[30rem] text-[17px] leading-relaxed text-[var(--ld-text-2)]">{heading.lede}</p> : null}
          </div>

          <ol className="border-t-2 border-[var(--ld-ink)]">
            {engagements.map((engagement, index) => {
              const on = index === picked;
              return (
                <li
                  key={engagement.id}
                  id={engagement.id}
                  aria-current={on ? "true" : undefined}
                  className={cn(
                    "grid scroll-mt-28 gap-x-10 gap-y-5 border-b py-10 transition-colors duration-500 md:grid-cols-[88px_minmax(0,1fr)] lg:grid-cols-[110px_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,1.1fr)]",
                    on
                      ? "-mx-4 rounded-[22px] border-transparent bg-white px-4 sm:-mx-7 sm:px-7"
                      : "border-[var(--ld-line)]"
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="ld-display text-[clamp(64px,6vw,88px)] leading-[0.8] font-extrabold tracking-[-0.05em] text-transparent [-webkit-text-stroke:1.5px_var(--ld-deep)] md:row-span-3 lg:row-span-1"
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="ld-display text-[clamp(26px,2.3vw,32px)] leading-none font-extrabold tracking-[-0.03em]">{engagement.title}</h3>
                    {engagement.summary ? <p className="mt-2.5 text-[17px] leading-[1.55] text-[var(--ld-text-2)]">{engagement.summary}</p> : null}
                  </div>
                  {engagement.bestWhen ? (
                    <div>
                      <h4 className="mb-2.5 font-mono text-[11.5px] font-normal tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">Best when</h4>
                      <p className="text-base leading-relaxed text-[var(--ld-text-2)]">{engagement.bestWhen}</p>
                    </div>
                  ) : null}
                  {engagement.steps.length > 0 ? (
                    <div>
                      <h4 className="mb-2.5 font-mono text-[11.5px] font-normal tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">How it runs</h4>
                      <ol>
                        {engagement.steps.map((step) => (
                          <li
                            key={step}
                            className="flex gap-3 border-t border-[#e3e6ee] py-2.5 text-base leading-normal text-[var(--ld-text-2)] first:border-t-0 first:pt-0"
                          >
                            <span aria-hidden="true" className="pt-0.5 font-mono text-xs text-[var(--ld-deep)]">
                              →
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </>
  );
}

export { EngagementPicker };
