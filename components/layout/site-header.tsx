import { getBlock } from "@/lib/content/blocks/source";
import { getSiteSettings } from "@/lib/content/blocks/site";
import type { AboutContent } from "@/lib/content/blocks/views";
import { SiteHeaderView } from "@/components/layout/site-header-view";

/**
 * The site's floating header, on every public page: a pill over the dark
 * band each hero starts on, carrying the palette switcher. The links and the
 * name are the editable site settings, managed in one place. The founder's
 * photo comes from the About block, for the way through to the portfolio.
 */
async function SiteHeader() {
  const [site, about] = await Promise.all([getSiteSettings(), getBlock("about")]);
  const founder = (about as unknown as AboutContent).founder;

  return (
    <SiteHeaderView
      name={site.name}
      navLinks={site.navLinks}
      email={site.email}
      founder={{ name: founder.name, portrait: founder.portrait || "/about/headshot.webp" }}
    />
  );
}

export { SiteHeader };
