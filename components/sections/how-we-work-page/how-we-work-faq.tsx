import type { SectionHeading } from "@/lib/content/blocks/source";
import type { FaqView } from "@/lib/content/blocks/views";
import { FaqList } from "@/components/sections/mentorship-page/faq-list";

/**
 * What clients ask before they write, in the same open-one-at-a-time list
 * the mentorship page uses. The line under the heading ends in the site's
 * email address, for anything the list does not cover.
 */
function HowWeWorkFaq({ heading, faqs, email }: { heading: SectionHeading; faqs: FaqView[]; email: string }) {
  const shown = faqs.filter((faq) => faq.question?.trim() && faq.answer?.trim());
  if (shown.length === 0) return null;

  return (
    <section aria-labelledby="hww-faq-title" className="bg-[#eef1fa] text-[var(--ld-ink)]">
      <div className="doc-shell grid items-start gap-[clamp(32px,6vw,88px)] py-[clamp(64px,8vw,104px)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="lg:sticky lg:top-28">
          <h2 id="hww-faq-title" className="ld-display text-[clamp(34px,3.8vw,52px)] leading-none font-extrabold tracking-[-0.04em]">
            {heading.title}
          </h2>
          {heading.lede || email ? (
            <p className="mt-3.5 text-lg leading-[1.55] text-[var(--ld-text-2)]">
              {heading.lede}
              {email ? (
                <>
                  {heading.lede ? " " : null}
                  <a href={`mailto:${email}`} className="border-b-[1.5px] border-[var(--ld-ink)] font-semibold text-[var(--ld-ink)] hover:text-[var(--ld-deep)]">
                    {email}
                  </a>
                </>
              ) : null}
            </p>
          ) : null}
        </div>
        <FaqList faqs={shown} />
      </div>
    </section>
  );
}

export { HowWeWorkFaq };
