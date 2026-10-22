import { getSiteSettings } from "@/lib/content/blocks/site";
import { HomeNavView } from "@/components/sections/home/home-nav-view";

/**
 * The homepage's header.
 *
 * Its own component rather than the shared `Navbar`, because the homepage's
 * header floats over a dark hero as a pill and carries the palette switcher,
 * neither of which suits the inner pages as they stand. It reads the same
 * editable settings, so the links and the name are still managed in one place.
 */
async function HomeNav() {
  const site = await getSiteSettings();

  return <HomeNavView name={site.name} navLinks={site.navLinks} />;
}

export { HomeNav };
