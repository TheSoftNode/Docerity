import Link from "next/link";

import { fillEmail, legalBlocks, summaryPoints } from "@/components/sections/legal-page/legal-content";

export type LegalText = { title: string; updated: string; summary: string; body: string };

/**
 * A legal page, made to be read: the title and when it last changed, the
 * short version in plain points, then the full text with its contents held
 * beside it on a wide screen. One layout for the privacy policy and the
 * terms, so they read the same.
 */
function LegalDocument({
  text,
  email,
  other,
}: {
  text: LegalText;
  email: string;
  /** The other legal page, linked at the end. */
  other: { href: string; label: string };
}) {
  const blocks = legalBlocks(fillEmail(text.body, email));
  const points = summaryPoints(fillEmail(text.summary, email));
  const headings = blocks.filter((block) => block.kind === "heading");

  return (
    <article aria-labelledby="legal-title" className="-mt-[76px] bg-white pt-[clamp(132px,13vw,160px)] pb-[clamp(64px,8vw,112px)] text-[var(--ld-ink)]">
      <div className="doc-shell">
        <header className="border-b border-[var(--ld-line)] pb-[clamp(28px,3.5vw,44px)]">
          <h1 id="legal-title" className="ld-display text-[clamp(42px,5.4vw,76px)] leading-[0.98] font-extrabold tracking-[-0.045em]">
            {text.title}
          </h1>
          {text.updated ? <p className="mt-4 text-base text-[var(--ld-text-muted)]">Last updated {text.updated}</p> : null}
        </header>

        <div className="grid items-start gap-10 pt-[clamp(32px,4vw,56px)] lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:gap-20">
          {headings.length > 2 ? (
            <nav aria-label="On this page" className="hidden lg:sticky lg:top-28 lg:block">
              <h2 className="mb-3 text-sm font-semibold">On this page</h2>
              <ol className="border-l border-[var(--ld-line)]">
                {headings.map((heading) => (
                  <li key={heading.id}>
                    <a
                      href={`#${heading.id}`}
                      className="-ml-px block border-l border-transparent py-1.5 pl-4 text-[15px] leading-snug text-[var(--ld-text-2)] transition-colors hover:border-[var(--ld-ink)] hover:text-[var(--ld-ink)]"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : (
            <div className="hidden lg:block" />
          )}

          <div className="max-w-[44rem]">
            {points.length > 0 ? (
              <section aria-labelledby="legal-summary" className="mb-12 rounded-[22px] bg-[var(--ld-paper)] px-6 py-6 sm:px-8 sm:py-7">
                <h2 id="legal-summary" className="ld-display text-2xl font-bold tracking-[-0.02em]">
                  The short version
                </h2>
                <ul className="mt-4 grid gap-3">
                  {points.map((point) => (
                    <li key={point} className="flex gap-3 text-[17px] leading-[1.55] text-[var(--ld-text-2)]">
                      <span aria-hidden="true" className="mt-[11px] size-1.5 shrink-0 rounded-full bg-[var(--ld-deep)]" />
                      {point}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {blocks.map((block, index) => {
              if (block.kind === "heading") {
                return (
                  <h2
                    key={block.id}
                    id={block.id}
                    className="ld-display mt-12 mb-4 scroll-mt-28 text-[clamp(24px,2.2vw,30px)] leading-tight font-bold tracking-[-0.025em] first:mt-0"
                  >
                    {block.text}
                  </h2>
                );
              }
              if (block.kind === "list") {
                return (
                  <ul key={index} className="mb-5 grid gap-2.5 pl-1">
                    {block.items.map((item) => (
                      <li key={item} className="flex gap-3 text-[17px] leading-[1.6] text-[var(--ld-text-2)]">
                        <span aria-hidden="true" className="mt-[11px] size-1.5 shrink-0 rounded-full bg-[var(--ld-text-muted)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={index} className="mb-5 text-[17px] leading-[1.7] text-[var(--ld-text-2)]">
                  {block.text}
                </p>
              );
            })}

            <p className="mt-12 border-t border-[var(--ld-line)] pt-6 text-base text-[var(--ld-text-2)]">
              Questions?{" "}
              <a href={`mailto:${email}`} className="border-b-[1.5px] border-[var(--ld-ink)] font-semibold text-[var(--ld-ink)]">
                {email}
              </a>
              <span className="mx-3 text-[var(--ld-line-2)]" aria-hidden="true">
                ·
              </span>
              <Link href={other.href} className="border-b-[1.5px] border-[var(--ld-ink)] font-semibold text-[var(--ld-ink)]">
                {other.label}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

export { LegalDocument };
