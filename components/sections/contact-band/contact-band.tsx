import { ArrowUpRightIcon } from "lucide-react";

import { getGroup, getHeading } from "@/lib/content/blocks/source";
import { getSiteSettings } from "@/lib/content/blocks/site";
import { splitEmphasis } from "@/components/sections/home/hero-content";

/**
 * The closing call to action of the redesigned pages: three ways to get in
 * touch. On a phone, slim rows under the words; on a laptop, one panel with
 * the words beside three tiles.
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

  /* The tile each option gets on a laptop: coral for the one we most want
     chosen, paper beside it, and a quiet tint for the email. */
  const tiles = {
    accent: { tile: "bg-[var(--ld-accent)] text-[var(--ld-ink)]", arrow: "bg-[var(--ld-ink)] text-[var(--ld-paper)]" },
    paper: { tile: "bg-[var(--ld-paper)] text-[var(--ld-ink)]", arrow: "bg-[var(--ld-ink)] text-[var(--ld-paper)]" },
    tint: {
      tile: "border border-[rgb(var(--ld-tint-rgb)/0.22)] bg-[rgb(var(--ld-tint-rgb)/0.1)] text-[var(--ld-paper)]",
      arrow: "bg-[var(--ld-tint)] text-[var(--ld-ink)]",
    },
  };
  /* The round arrow each option ends with in the phone rows. */
  const dots = {
    accent: "bg-[var(--ld-accent)]",
    paper: "bg-[var(--ld-paper)]",
    tint: "bg-[var(--ld-tint)]",
  };

  return (
    <section
      id="contact"
      aria-labelledby="contact-band-title"
      className="ld-stay-dark scroll-mt-24 bg-[var(--ld-ink)] text-[var(--ld-paper)]"
    >
      {/* Below laptop width: the words, then the three options as slim rows.
          From laptop width: one panel, words on the left and the options as
          three tiles beside them. */}
      <div className="doc-shell pt-16 pb-14 sm:pt-20 sm:pb-16 lg:py-24">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:items-center lg:gap-12 lg:rounded-[30px] lg:border lg:border-[rgb(var(--ld-tint-rgb)/0.14)] lg:bg-[linear-gradient(150deg,#0f1a42,#0b1433)] lg:p-11">
          <div>
            <h2
              id="contact-band-title"
              className="ld-display max-w-[12ch] text-[clamp(42px,7vw,66px)] leading-[0.94] font-extrabold tracking-[-0.05em] lg:text-[clamp(44px,4.4vw,66px)]"
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
            {heading.lede ? (
              <p className="mt-4 max-w-[26rem] text-base leading-relaxed text-[var(--ld-muted)] sm:text-[17px] lg:mt-[18px]">
                {heading.lede}
              </p>
            ) : null}
          </div>

          <ul className="mt-8 lg:hidden">
            {options.map((option) => (
              <li key={option.number} className="border-t border-[rgb(var(--ld-paper-rgb)/0.14)] last:border-b">
                <a
                  href={option.href}
                  className="group flex items-center justify-between gap-4 py-4 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)]"
                >
                  <span className="min-w-0">
                    <span className="ld-display block text-[21px] font-bold tracking-[-0.02em]">{option.title}</span>
                    <span
                      className={
                        option.mono
                          ? "font-mono text-[13.5px] break-all text-[var(--ld-muted-2)]"
                          : "text-[14.5px] text-[var(--ld-muted-2)]"
                      }
                    >
                      {option.detail}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`grid size-10 shrink-0 place-items-center rounded-full text-[var(--ld-ink)] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 ${dots[option.tone]}`}
                  >
                    <ArrowUpRightIcon className="size-[18px]" />
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <ul className="hidden grid-cols-3 gap-3 lg:grid">
            {options.map((option) => (
              <li key={option.number} className="flex">
                <a
                  href={option.href}
                  className={`group flex min-h-[176px] w-full flex-col justify-between rounded-[20px] p-5 outline-none transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)] ${tiles[option.tone].tile}`}
                >
                  <span className="min-w-0">
                    <span className="ld-display block text-[21px] leading-[1.1] font-bold tracking-[-0.02em]">{option.title}</span>
                    <span
                      className={
                        option.mono
                          ? "mt-1.5 block font-mono text-[12.5px] break-all opacity-75"
                          : "mt-1.5 block text-[13.5px] leading-[1.45] opacity-75"
                      }
                    >
                      {option.detail}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`grid size-[38px] self-end place-items-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${tiles[option.tone].arrow}`}
                  >
                    <ArrowUpRightIcon className="size-[18px]" />
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
