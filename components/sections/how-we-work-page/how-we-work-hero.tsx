import Link from "next/link";
import { ArrowDownIcon } from "lucide-react";

import type { SectionHeading } from "@/lib/content/blocks/source";
import type { EngagementView } from "@/lib/content/blocks/views";

type Option = EngagementView & { id: string };

/**
 * The top of the page: what the options are, said plainly, and one card per
 * option saying who it is for. Each card goes down to that option's full
 * description. Under the cards, a way to ask for anyone still unsure.
 */
function HowWeWorkHero({
  heading,
  options,
  words,
}: {
  heading: SectionHeading;
  options: Option[];
  words: { cardLink: string; unsure: string; ask: string };
}) {
  return (
    <section aria-labelledby="hww-title" className="-mt-[76px] bg-white pt-[clamp(132px,13vw,160px)] pb-[clamp(56px,7vw,96px)] text-[var(--ld-ink)]">
      <div className="doc-shell">
        <h1
          id="hww-title"
          className="ld-display ld-up max-w-[13ch] text-[clamp(42px,5.4vw,76px)] leading-[0.98] font-extrabold tracking-[-0.045em] text-balance"
        >
          {heading.title}
        </h1>
        {heading.lede ? (
          <p className="ld-up ld-delay-1 mt-[22px] max-w-[40rem] text-[clamp(17.5px,1.4vw,20px)] leading-[1.55] text-[var(--ld-text-2)]">{heading.lede}</p>
        ) : null}

        {options.length > 0 ? (
          <ul className="mt-[clamp(36px,4vw,56px)] grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            {options.map((option) => (
              <li key={option.id}>
                <a
                  href={`#${option.id}`}
                  className="group flex h-full min-h-[200px] flex-col rounded-[20px] border border-[var(--ld-line)] bg-white px-6 pt-[26px] pb-[22px] outline-none transition-colors duration-300 hover:border-[var(--ld-ink)] focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)]"
                >
                  <h2 className="ld-display text-2xl leading-[1.1] font-bold tracking-[-0.02em]">{option.title}</h2>
                  {option.forWho ? <p className="mt-2.5 text-base leading-normal text-[var(--ld-text-2)]">{option.forWho}</p> : null}
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[15px] font-semibold text-[var(--ld-deep)]">
                    {words.cardLink}
                    <ArrowDownIcon aria-hidden="true" className="size-3.5 transition-transform duration-300 group-hover:translate-y-0.5" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}

        {words.unsure ? (
          <p className="mt-[26px] text-base text-[var(--ld-text-2)]">
            {words.unsure}{" "}
            <Link
              href="/contact"
              className="border-b-[1.5px] border-[var(--ld-ink)] pb-0.5 font-semibold text-[var(--ld-ink)] outline-none transition-colors hover:text-[var(--ld-deep)] focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)]"
            >
              {words.ask}
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}

export { HowWeWorkHero };
