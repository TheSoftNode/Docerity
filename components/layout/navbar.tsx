import { NavbarView } from "@/components/layout/navbar-view";
import { getSiteSettings } from "@/lib/content/blocks/site";

/**
 * The header, read from the editable settings.
 *
 * A Server Component in front of a Client one, the same shape the animated
 * sections take. The bar tracks scroll and opens a mobile menu, so it runs in
 * the browser; the links and the name are read during the render.
 *
 * Fourteen pages render this, so reading here rather than threading props
 * through each of them is what keeps adding a page from being a chore.
 */
async function Navbar() {
  const site = await getSiteSettings();

  return <NavbarView site={site} />;
}

export { Navbar };
