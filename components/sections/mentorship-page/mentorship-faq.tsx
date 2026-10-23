import { getGroup, getHeading } from "@/lib/content/blocks/source";
import { getSiteSettings } from "@/lib/content/blocks/site";
import type { FaqView } from "@/lib/content/blocks/views";
import { FaqList } from "@/components/sections/mentorship-page/faq-list";

/**
 * Questions before applying: the heading and an "ask us" line held on the
 * left while the answers open on the right.
 */
async function MentorshipFaq() {
  const [heading, faqs, site] = await Promise.all([
    getHeading("mentorship", "mentorship-faq"),
    getGroup<FaqView[]>("mentorship", "faqs"),
    getSiteSettings(),
  ]);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section aria-labelledby="faq-title" className="bg-[#eef1fa] text-[var(--ld-ink)]">
      <div className="doc-shell grid items-start gap-[clamp(32px,6vw,96px)] py-[clamp(64px,8vw,112px)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="lg:sticky lg:top-28">
          <p className="mb-3.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">{heading.eyebrow}</p>
          <h2
            id="faq-title"
            className="ld-display max-w-[12ch] text-[clamp(38px,5.2vw,72px)] leading-[0.95] font-extrabold tracking-[-0.045em]"
          >
            {heading.title}
          </h2>
          {heading.lede ? <p className="mt-5 max-w-[24rem] text-[17px] leading-relaxed text-[var(--ld-text-2)]">{heading.lede}</p> : null}
          <a
            href={`mailto:${site.email}`}
            className="mt-6 inline-flex flex-wrap items-center gap-2.5 rounded-2xl bg-[var(--ld-ink)] px-[18px] py-3.5 text-[15px] text-[var(--ld-paper)] transition-transform hover:-translate-y-0.5"
          >
            <span className="font-mono text-[11px] text-[var(--ld-muted-3)] uppercase">Still unsure?</span>
            {site.email}
          </a>
        </div>
        <FaqList faqs={faqs} />
      </div>
    </section>
  );
}

export { MentorshipFaq };
