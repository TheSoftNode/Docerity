import { pageMetadata } from "@/lib/content/blocks/metadata";
import { getBlock, getGroup, getHeading } from "@/lib/content/blocks/source";
import { getWork } from "@/lib/content/work";
import type { AboutContent, FactView } from "@/lib/content/blocks/views";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ContactBand } from "@/components/sections/contact-band/contact-band";
import { AboutHero } from "@/components/sections/about-page/about-hero";
import { AboutStory } from "@/components/sections/about-page/about-story";
import { AboutTeam } from "@/components/sections/about-page/about-team";
import { AboutChangelog } from "@/components/sections/about-page/about-changelog";
import { AboutToolkit } from "@/components/sections/about-page/about-toolkit";
import { AboutCredentials } from "@/components/sections/about-page/about-credentials";

/* Read per request rather than exported as a constant, so the title and
   description a search result shows can be edited without a deploy. */
export const generateMetadata = pageMetadata("about");

/* The copy is edited in the admin; saving revalidates, and this is the
   ceiling on staleness if that never lands. */
export const revalidate = 300;

/**
 * The About page: the career as a branch graph, the story as the studio's
 * README, the team behind the work, the roles as a changelog, the stack as a terminal, and the
 * credentials with their scans.
 */
export default async function AboutPage() {
  /* Read once and handed down in slices: most of the sections are Client
     Components and cannot read the content themselves. */
  const [block, work, hero, story, team, experience, toolkit, credentials, specialties] = await Promise.all([
    getBlock("about"),
    getWork(),
    getHeading("about", "about-hero"),
    getHeading("about", "about-story"),
    getHeading("about", "about-team"),
    getHeading("about", "about-experience"),
    getHeading("about", "about-toolkit"),
    getHeading("about", "about-credentials"),
    /* The team section falls back to these until people are added. */
    getGroup<string[]>("mentorship", "specialties"),
  ]);
  const about = block as unknown as AboutContent;

  /*
    The shipped-project count is counted, not typed.

    A hand-written "20+" drifts the moment a project is added or removed, and a
    number nobody can reconcile with the projects page is worth less than no
    number at all. This counts what is actually published, and is appended
    rather than stored, so it is not offered for editing and cannot be edited
    into a lie.
  */
  const facts: FactView[] = [
    ...about.facts,
    { value: String(work.projects.length), label: "Shipped projects", since: "every one listed on the projects page" },
  ];

  return (
    <div className="flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
      <SiteHeader />
      <main className="flex-1">
        <AboutHero heading={hero} experience={about.experience} education={about.education} facts={facts} />
        <AboutStory heading={story} story={about.story} fullStory={about.fullStory} founder={about.founder} />
        <AboutTeam heading={team} members={about.team ?? []} specialties={specialties ?? []} />
        <AboutChangelog heading={experience} experience={about.experience} />
        <AboutToolkit heading={toolkit} groups={about.skillGroups} tools={about.tools} />
        <AboutCredentials heading={credentials} certifications={about.certifications} education={about.education} />
        <ContactBand />
      </main>
      <SiteFooter />
    </div>
  );
}
