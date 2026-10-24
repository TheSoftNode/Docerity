import Link from "next/link";
import type { Metadata } from "next";

import { getGroup } from "@/lib/content/blocks/source";
import { getSiteSettings } from "@/lib/content/blocks/site";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { NotFoundShelf } from "@/components/sections/small-pages/not-found-shelf";
import { shelfFrom } from "@/components/sections/small-pages/shelf-content";
import { TitlePieces } from "@/components/sections/mentorship-page/title-pieces";

export const metadata: Metadata = {
  title: "Page not found",
};

type NotFoundCopy = {
  eyebrow: string;
  title: string;
  lede: string;
  primaryLabel: string;
  secondaryLabel: string;
  concept: string;
  conceptCaption: string;
  analogy: string;
  analogyCaption: string;
  shelfNote: string;
};

const LINK =
  "rounded-sm border-b border-[rgb(var(--ld-tint-rgb)/0.5)] text-[var(--ld-paper)] outline-none transition-colors hover:border-[var(--ld-paper)] focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)]";

/**
 * The page for an address that goes nowhere, explained the way an
 * explainer would: a 404 works like a gap on a bookshelf. The shelf is every
 * page in the menus, each one a link, with a gap where the missing one would
 * be. The words are edited in the admin (Small pages).
 */
export default async function NotFound() {
  const [copy, site] = await Promise.all([getGroup<NotFoundCopy>("pages", "notFound"), getSiteSettings()]);
  const pages = shelfFrom(site.navLinks, site.footerLinks);

  return (
    <div className="flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative -mt-[76px] overflow-hidden bg-[radial-gradient(1000px_560px_at_80%_10%,rgb(28_58_140/0.7),transparent_62%),var(--ld-ink)] pt-[132px] pb-[clamp(64px,7vw,100px)] text-[var(--ld-paper)]">
          <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
            <p className="ld-up inline-flex items-center gap-2.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-tint)] uppercase">
              <span className="rounded-full bg-[rgb(255_122_89/0.16)] px-2 py-0.5 text-[#ffb39c]">404</span>
              {copy.eyebrow}
            </p>
            <div className="mt-7 grid items-end gap-[clamp(28px,4vw,64px)] lg:grid-cols-2">
              <div>
                <h1 className="ld-display ld-up max-w-[13ch] text-[clamp(44px,6vw,96px)] leading-[0.92] font-extrabold tracking-[-0.055em] text-balance">
                  <TitlePieces title={copy.title} />
                </h1>
                <p className="ld-up ld-delay-1 mt-[22px] max-w-[30rem] text-[17.5px] leading-relaxed text-[var(--ld-muted)]">{copy.lede}</p>
              </div>
              <div className="ld-up ld-delay-2 grid gap-1.5 sm:grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] sm:gap-0">
                <div className="rounded-[18px] border border-[rgb(var(--ld-tint-rgb)/0.16)] bg-[rgb(var(--ld-paper-rgb)/0.06)] px-[18px] py-4">
                  <span className="font-mono text-[11px] text-[var(--ld-muted-3)] uppercase">The concept</span>
                  <span className="ld-display mt-2 block text-[22px] font-extrabold">{copy.concept}</span>
                  <span className="mt-1 block text-[13.5px] text-[var(--ld-muted)]">{copy.conceptCaption}</span>
                </div>
                <div aria-hidden="true" className="ld-display grid place-items-center py-1 text-[26px] font-extrabold text-[var(--ld-tint)]">
                  ≈
                </div>
                <div className="rounded-[18px] bg-[var(--ld-paper)] px-[18px] py-4 text-[var(--ld-ink)]">
                  <span className="font-mono text-[11px] text-[var(--ld-text-muted)] uppercase">Works like</span>
                  <span className="ld-display mt-2 block text-[22px] leading-[1.05] font-extrabold">{copy.analogy}</span>
                  <span className="mt-1 block text-[13.5px] text-[var(--ld-text-muted)]">{copy.analogyCaption}</span>
                </div>
              </div>
            </div>

            <NotFoundShelf pages={pages} note={copy.shelfNote} />

            <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
              <Link href="/" className={LINK}>
                {copy.primaryLabel}
              </Link>
              <Link href="/blog" className={LINK}>
                {copy.secondaryLabel}
              </Link>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
