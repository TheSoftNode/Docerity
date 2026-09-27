import "server-only";

import { getBlock } from "@/lib/content/blocks/source";
import { siteConfig } from "@/lib/config/site";
import type { BlockRecord } from "@/lib/content/blocks/schema";

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
  socials: { label: string; url: string; iconName: string }[];
  navLinks: { label: string; href: string }[];
  footerLinks: { label: string; href: string }[];
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const block = await getBlock("site");
  const identity = (block.identity ?? {}) as BlockRecord;

  return {
    /* `||` rather than `??`: a field cleaned to an empty string should fall
       back too, not render as nothing in the header of every page. */
    name: (identity.name as string) || siteConfig.name,
    url: siteConfig.url,
    tagline: (identity.tagline as string) || siteConfig.tagline,
    description: (identity.description as string) || siteConfig.description,
    email: (identity.email as string) || siteConfig.email,
    socials: (block.socials ?? []) as SiteSettings["socials"],
    navLinks: (block.navLinks ?? []) as SiteSettings["navLinks"],
    footerLinks: (block.footerLinks ?? []) as SiteSettings["footerLinks"],
  };
}
