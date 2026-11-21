import { pageMetadata } from "@/lib/content/blocks/metadata";
import { getBlock, getHeading } from "@/lib/content/blocks/source";
import { getWork } from "@/lib/content/work";
import type { AboutContent, FactView } from "@/lib/content/blocks/views";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ContactBand } from "@/components/sections/contact-band/contact-band";
import { AboutTeam } from "@/components/sections/about-page/about-team";
import { FounderCard, StudioHero, StudioPillars } from "@/components/sections/about-page/studio";

/* Read per request rather than exported as a constant, so the title and
   description a search result shows can be edited without a deploy. */
export const generateMetadata = pageMetadata("about");

/* The copy is edited in the admin; saving revalidates, and this is the
   ceiling on staleness if that never lands. */
export const revalidate = 300;

/**
 * About the studio: what Docerity is and its numbers, the three things it
 * does, the team, and the founder, with the way through to his portfolio
 * at /theo, where the career, story, experience, stack and credentials live.
 */
export default async function AboutPage() {
  const [block, work, hero, build, explain, teach, team, founderHeading] = await Promise.all([
    getBlock("about"),
    getWork(),
    getHeading("about", "about-hero"),
    getHeading("about", "studio-build"),
    getHeading("about", "studio-explain"),
    getHeading("about", "studio-teach"),
    getHeading("about", "about-team"),
    getHeading("about", "studio-founder"),
  ]);
  const about = block as unknown as AboutContent;

  /* The shipped-project count is counted from what is published, not typed,
     so it can't drift from the projects page. */
  const facts: FactView[] = [{ value: String(work.projects.length), label: "Shipped projects", since: "every one listed on the projects page" }, ...about.facts];

  return (
    <div className="ld-page flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
      <SiteHeader />
      <main className="flex-1">
        <StudioHero heading={hero} facts={facts} />
        <StudioPillars headings={{ build, explain, teach }} />
        <FounderCard heading={founderHeading} founder={about.founder} />
        <AboutTeam heading={team} members={about.team ?? []} />
        <ContactBand />
      </main>
      <SiteFooter />
    </div>
  );
}
