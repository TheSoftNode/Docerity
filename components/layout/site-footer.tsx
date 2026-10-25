import Link from "next/link";

import { getSiteSettings } from "@/lib/content/blocks/site";
import { SocialIcon } from "@/components/shared/social-icon";
import { PaletteLogo } from "@/components/shared/palette/palette-logo";

/**
 * The footer of the redesigned pages, continuing the contact band's ink.
 *
 * The same editable footer links, socials and address the shared footer reads,
 * so the two never disagree about where the site's pages are. It ends on the
 * outlined wordmark beside the palette-matched mark: decoration, hidden from
 * assistive technology, since the name is already in the copyright line.
 */
async function SiteFooter() {
  const site = await getSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--ld-ink)] text-[var(--ld-muted-2)]">
      <div className="doc-shell pt-20 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-5 text-sm">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
            {site.footerLinks.map((link) => (
              <Link key={link.label} href={link.href} className="transition-opacity hover:opacity-65">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Hidden entirely when there are none, rather than a row of dead
              marks, as in the shared footer. */}
          {site.socials.length > 0 ? (
            <div className="flex items-center gap-5">
              {site.socials.map((social) => (
                <Link key={social.url} href={social.url} className="transition-opacity hover:opacity-65">
                  <SocialIcon label={social.label} className="size-4" />
                  <span className="sr-only">{social.label}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-[rgb(var(--ld-paper-rgb)/0.12)] pt-5 text-xs sm:flex-row sm:justify-between">
          <p className="flex flex-wrap gap-x-5 gap-y-1">
            <span>
              &copy; {year} {site.name}. All rights reserved.
            </span>
            <Link href="/privacy" className="transition-opacity hover:opacity-65">
              Privacy
            </Link>
            <Link href="/terms" className="transition-opacity hover:opacity-65">
              Terms
            </Link>
          </p>
          <a href={`mailto:${site.email}`} className="transition-opacity hover:opacity-65">
            {site.email}
          </a>
        </div>

        <div aria-hidden="true" className="mt-10 flex items-end justify-center gap-[2vw] whitespace-nowrap">
          <PaletteLogo className="size-[clamp(56px,13vw,200px)]" />
          <span className="ld-display text-[clamp(64px,16vw,260px)] leading-[0.78] font-extrabold tracking-[-0.06em] text-transparent [-webkit-text-stroke:1.5px_rgb(var(--ld-tint-rgb)/0.4)]">
            {site.name.toLowerCase()}
          </span>
        </div>
      </div>
    </footer>
  );
}

export { SiteFooter };
