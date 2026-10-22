import { getSiteSettings } from "@/lib/content/blocks/site";
import { SiteHeaderView } from "@/components/layout/site-header-view";

/**
 * The floating header of the redesigned pages (the homepage and /projects).
 *
 * Separate from the older `Navbar`, which the pages not yet redesigned still
 * render: this one floats over a dark band as a pill and carries the palette
 * switcher. Both read the same editable settings, so the links and the name
 * are managed in one place.
 */
async function SiteHeader() {
  const site = await getSiteSettings();

  return <SiteHeaderView name={site.name} navLinks={site.navLinks} email={site.email} />;
}

export { SiteHeader };
