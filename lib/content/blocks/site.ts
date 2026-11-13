import "server-only";

import { getBlock } from "@/lib/content/blocks/source";
import { siteConfig } from "@/lib/config/site";
import { safeLink } from "@/lib/content/blocks/links";
import type { BlockRecord } from "@/lib/content/blocks/schema";
import { withAcademyLink } from "@/lib/content/blocks/nav-launch";
import { database } from "@/lib/config/env";
import { findBlock } from "@/lib/repositories/site-content.repository";

/**
 * The settings that appear on every page, read from the editable content.
 *
 * `lib/config/site.ts` is still here and still the fallback, and it keeps the
 * one field that is deliberately not editable: `url`. Everything derives
 * absolute links from it (the sitemap, the RSS feed, every canonical tag and
 * social card), so a typo there would not be a wrong heading on one page, it
 * would be every link off this site pointing somewhere that does not exist,
 * including the links search engines follow. That belongs in a deploy.
 */

export type SiteSettings = {
  name: string;
  url: string;
  tagline: string;
  description: string;
  email: string;
  /** A Cal.com or Calendly link; empty when none is set, and then nothing offers it. */
  booking: { url: string; label: string };
  socials: { label: string; url: string; iconName: string }[];
  navLinks: { label: string; href: string }[];
  footerLinks: { label: string; href: string }[];
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const [block, savedAt] = await Promise.all([getBlock("site"), siteSavedAt()]);
  const identity = (block.identity ?? {}) as BlockRecord;

  return {
    /* `||` rather than `??`: a field cleaned to an empty string should fall
       back too, not render as nothing in the header of every page. */
    name: (identity.name as string) || siteConfig.name,
    url: siteConfig.url,
    tagline: (identity.tagline as string) || siteConfig.tagline,
    description: (identity.description as string) || siteConfig.description,
    email: (identity.email as string) || siteConfig.email,
    booking: {
      url: safeLink(identity.bookingUrl as string),
      label: (identity.bookingLabel as string) || "Book a call",
    },
    socials: (block.socials ?? []) as SiteSettings["socials"],
    navLinks: withAcademyLink((block.navLinks ?? []) as SiteSettings["navLinks"], savedAt),
    footerLinks: withAcademyLink((block.footerLinks ?? []) as SiteSettings["footerLinks"], savedAt),
  };
}


/** When the site settings were last saved in the admin, or null when they never were (the defaults already list the Academy). */
async function siteSavedAt(): Promise<Date | null> {
  if (!database.isConfigured) return null;
  try {
    return (await findBlock("site"))?.updatedAt ?? null;
  } catch {
    return null;
  }
}
