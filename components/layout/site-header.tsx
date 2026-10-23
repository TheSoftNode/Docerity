import { getSiteSettings } from "@/lib/content/blocks/site";
import { SiteHeaderView } from "@/components/layout/site-header-view";

/**
 * The site's floating header, on every public page: a pill over the dark
 * band each hero starts on, carrying the palette switcher. The links and the
 * name are the editable site settings, managed in one place.
 */
async function SiteHeader() {
  const site = await getSiteSettings();

  return <SiteHeaderView name={site.name} navLinks={site.navLinks} email={site.email} />;
}

export { SiteHeader };
