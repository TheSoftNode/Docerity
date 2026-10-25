import type { SectionHeading } from "@/lib/content/blocks/source";
import type { FaqView } from "@/lib/content/blocks/views";
import { FaqList } from "@/components/sections/mentorship-page/faq-list";

/**
 * What clients ask before they write: the same open-one-at-a-time list the
 * mentorship page uses, with a way to ask what is not on it.
 */
function HowWeWorkFaq({ heading, faqs, email }: { heading: SectionHeading; faqs: FaqView[]; email: string }) {
  const shown = faqs.filter((faq) => faq.question?.trim() && faq.answer?.trim());
  if (shown.length === 0) return null;

  return (
    <section aria-labelledby="hww-faq-title" className="bg-[#eef1fa] text-[var(--ld-ink)]">
      <div className="doc-shell grid items-start gap-[clamp(32px,6vw,96px)] py-[clamp(64px,8vw,112px)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="lg:sticky lg:top-28">
          <p className="mb-3.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">{heading.eyebrow}</p>
          <h2
            id="hww-faq-title"
            className="ld-display max-w-[12ch] text-[clamp(38px,5.2vw,72px)] leading-[0.95] font-extrabold tracking-[-0.045em]"
          >
            {heading.title}
          </h2>
          {heading.lede ? <p className="mt-5 max-w-[24rem] text-[17px] leading-relaxed text-[var(--ld-text-2)]">{heading.lede}</p> : null}
          {email ? (
            <a
              href={`mailto:${email}`}
              className="mt-6 inline-flex flex-wrap items-center gap-2.5 rounded-2xl bg-[var(--ld-ink)] px-[18px] py-3.5 text-[15px] text-[var(--ld-paper)] transition-transform hover:-translate-y-0.5"
            >
              <span className="font-mono text-[11px] text-[var(--ld-muted-3)] uppercase">Something else?</span>
              {email}
            </a>
          ) : null}
        </div>
        <FaqList faqs={shown} />
      </div>
    </section>
  );
}

export { HowWeWorkFaq };
