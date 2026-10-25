import type { SectionHeading } from "@/lib/content/blocks/source";
import type { EngagementView } from "@/lib/content/blocks/views";

type Option = EngagementView & { id: string };

/**
 * Each option in full, one card apiece: who it is for and what it is good
 * for on one side, what happens, step by step, on the other. The steps are
 * numbered because their order is the point.
 */
function HowWeWorkOptions({
  heading,
  options,
  words,
}: {
  heading: SectionHeading;
  options: Option[];
  words: { goodFor: string; steps: string };
}) {
  if (options.length === 0) return null;

  return (
    <section aria-labelledby="options-title" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
      <div className="doc-shell py-[clamp(64px,8vw,104px)]">
        <h2 id="options-title" className="ld-display text-[clamp(34px,3.8vw,52px)] leading-none font-extrabold tracking-[-0.04em]">
          {heading.title}
        </h2>
        {heading.lede ? <p className="mt-3.5 max-w-[38rem] text-lg leading-[1.55] text-[var(--ld-text-2)]">{heading.lede}</p> : null}

        <div className="mt-[clamp(32px,4vw,48px)] grid gap-4 sm:gap-5">
          {options.map((option) => (
            <article
              key={option.id}
              id={option.id}
              aria-labelledby={`${option.id}-title`}
              className="grid scroll-mt-28 gap-2 rounded-3xl bg-white px-[22px] py-[26px] sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-14"
            >
              <div>
                <h3 id={`${option.id}-title`} className="ld-display text-[clamp(28px,2.6vw,34px)] leading-[1.05] font-extrabold tracking-[-0.03em]">
                  {option.title}
                </h3>
                {option.forWho ? <p className="mt-3 text-lg leading-normal font-medium">{option.forWho}</p> : null}
                {option.goodFor ? (
                  <>
                    <h4 className="mt-[26px] mb-2 text-sm font-semibold">{words.goodFor}</h4>
                    <p className="text-[16.5px] leading-relaxed text-[var(--ld-text-2)]">{option.goodFor}</p>
                  </>
                ) : null}
              </div>
              {option.steps.length > 0 ? (
                <div className="mt-4 lg:mt-0">
                  <h4 className="mb-4 text-sm font-semibold">{words.steps}</h4>
                  <ol>
                    {option.steps.map((step, index) => (
                      <li
                        key={step}
                        className="flex gap-4 border-t border-[#e8eaf0] py-4 text-[16.5px] leading-[1.55] text-[var(--ld-text-2)] first:border-t-0 first:pt-0"
                      >
                        <span
                          aria-hidden="true"
                          className="-mt-px grid size-7 shrink-0 place-items-center rounded-full bg-[#e9eefc] text-sm font-bold text-[var(--ld-deep)]"
                        >
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export { HowWeWorkOptions };
