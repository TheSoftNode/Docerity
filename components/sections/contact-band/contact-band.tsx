import { ArrowUpRightIcon } from "lucide-react";

import { getGroup, getHeading } from "@/lib/content/blocks/source";
import { getSiteSettings } from "@/lib/content/blocks/site";
import { splitEmphasis } from "@/components/sections/home/hero-content";

/**
 * The closing call to action of the redesigned pages: three ways to get in
 * touch, as large rows.
 *
 * The title and lede are the editable `home-cta` heading, emphasis included,
 * and the address is the site's own contact email from settings.
 */
async function ContactBand() {
  const [heading, site, stored] = await Promise.all([
    getHeading("homepage", "home-cta"),
    getSiteSettings(),
    getGroup<Record<string, { title?: string; detail?: string }>>("homepage", "contactOptions"),
  ]);
  /* The words are edited in the admin; where each one goes stays here. */
  const words = (key: string, title: string, detail: string) => ({
    title: stored?.[key]?.title || title,
    detail: stored?.[key]?.detail || detail,
  });

  const options = [
    {
      number: "01",
      ...words("project", "A new project", "Scope, build and ship production software."),
      href: "/contact",
      tone: "accent" as const,
      mono: false,
    },
    {
      number: "02",
      ...words("mentorship", "Mentorship", "Weekly 1:1s and honest code review."),
      href: "/contact?type=mentorship",
      tone: "paper" as const,
      mono: false,
    },
    {
      number: "03",
      ...words("question", "Just a question", site.email),
      href: `mailto:${site.email}`,
      tone: "tint" as const,
      mono: true,
    },
  ];

  const tones = {
    accent: "bg-[var(--ld-accent)]",
    paper: "bg-[var(--ld-paper)]",
    tint: "bg-[var(--ld-tint)]",
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-band-title"
      className="scroll-mt-24 bg-[var(--ld-ink)] text-[var(--ld-paper)]"
    >
      <div className="doc-shell pt-[clamp(72px,10vw,140px)]">
        <p className="mb-6 inline-flex items-center gap-2.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-tint)] uppercase">
          <span aria-hidden="true" className="ld-live size-2 rounded-full bg-[#54D696]" />
          {heading.eyebrow}
        </p>
        <h2
          id="contact-band-title"
          className="ld-display max-w-[14ch] text-[clamp(48px,10vw,156px)] leading-[0.9] font-extrabold tracking-[-0.055em]"
        >
          {splitEmphasis(heading.title).map((piece, index) =>
            piece.emphasis ? (
              <span key={index} className="text-[var(--ld-accent)]">
                {piece.text}
              </span>
            ) : (
              piece.text
            )
          )}
        </h2>

        <div className="mt-16 flex flex-wrap items-end gap-10">
          {heading.lede ? (
            <p className="max-w-[24rem] flex-[1_1_280px] text-lg leading-relaxed text-[var(--ld-muted)]">
              {heading.lede}
            </p>
          ) : null}

          <ul className="min-w-0 flex-[999_1_520px]">
            {options.map((option) => (
              <li key={option.number} className="border-t border-[rgb(var(--ld-paper-rgb)/0.16)] last:border-b">
                <a
                  href={option.href}
                  className="group flex items-center justify-between gap-4 py-6 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)]"
                >
                  <span className="flex min-w-0 items-baseline gap-4.5 transition-transform duration-300 group-hover:translate-x-2.5">
                    <span className="font-mono text-[13px] text-[var(--ld-tint)]">{option.number}</span>
                    <span className="min-w-0">
                      <span className="ld-display block text-[clamp(24px,3vw,38px)] font-bold tracking-[-0.02em]">
                        {option.title}
                      </span>
                      <span
                        className={
                          option.mono
                            ? "font-mono text-sm break-all text-[var(--ld-muted-2)]"
                            : "text-[15px] text-[var(--ld-muted-2)]"
                        }
                      >
                        {option.detail}
                      </span>
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`grid size-14 shrink-0 place-items-center rounded-full text-[var(--ld-ink)] transition-transform duration-300 group-hover:translate-x-2 group-hover:-translate-y-2 ${tones[option.tone]}`}
                  >
                    <ArrowUpRightIcon className="size-[22px]" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export { ContactBand };
