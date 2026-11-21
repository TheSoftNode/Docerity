import type { Metadata } from "next";

import { getBlock, getHeading } from "@/lib/content/blocks/source";
import { getSiteSettings } from "@/lib/content/blocks/site";
import { getFeaturedWork, getWork } from "@/lib/content/work";
import type { AboutContent, FactView } from "@/lib/content/blocks/views";
import { siteConfig } from "@/lib/config/site";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ContactBand } from "@/components/sections/contact-band/contact-band";
import { AboutHero } from "@/components/sections/about-page/about-hero";
import { AboutStory } from "@/components/sections/about-page/about-story";
import { AboutChangelog } from "@/components/sections/about-page/about-changelog";
import { AboutToolkit } from "@/components/sections/about-page/about-toolkit";
import { AboutCredentials } from "@/components/sections/about-page/about-credentials";
import { PortfolioActions } from "@/components/sections/about-page/studio";
import { WorkIndex } from "@/components/sections/home/work-index";
import { WorkRail } from "@/components/sections/home/work-rail";
import { CaseStudies } from "@/components/sections/about-page/case-studies";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const about = (await getBlock("about")) as unknown as AboutContent;
  const hero = await getHeading("about", "portfolio-hero");
  const name = about.founder.name;
  return {
    title: `${name} · ${about.founder.role}`,
    description: hero.lede || `${name}'s portfolio: career, selected work, experience, stack and credentials.`,
    alternates: { canonical: "/theo" },
    openGraph: { title: name, description: hero.lede, url: `${siteConfig.url}/theo`, type: "profile" },
  };
}

/**
 * The founder's portfolio: the career as a branch graph, the story, the
 * selected work, every role, the stack and the credentials. One link to send
 * to a recruiter, a partner or a client. Edited in the admin under About.
 */
export default async function PortfolioPage() {
  const [block, work, featured, site, hero, story, selected, experience, toolkit, credentials] = await Promise.all([
    getBlock("about"),
    getWork(),
    getFeaturedWork(),
    getSiteSettings(),
    getHeading("about", "portfolio-hero"),
    getHeading("about", "about-story"),
    getHeading("about", "portfolio-work"),
    getHeading("about", "about-experience"),
    getHeading("about", "about-toolkit"),
    getHeading("about", "about-credentials"),
  ]);
  const about = block as unknown as AboutContent;
  /* Projects placed on the portfolio in the projects editor; until there are
     any, the homepage's featured projects stand in. */
  const caseStudies = work.projects.filter((project) => project.showcase);
  const facts: FactView[] = [...about.facts, { value: String(work.projects.length), label: "Shipped projects", since: "every one listed on the projects page" }];

  return (
    <div className="ld-page flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
      <SiteHeader />
      <main className="flex-1">
        <AboutHero heading={hero} experience={about.experience} education={about.education} facts={facts}>
          <PortfolioActions founder={about.founder} socials={site.socials} />
        </AboutHero>
        <AboutStory heading={story} story={about.story} fullStory={about.fullStory} founder={about.founder} />
        <section id="work" aria-labelledby="portfolio-work-title" className="scroll-mt-24 bg-[var(--ld-ink)] text-[var(--ld-paper)]">
          <div className="doc-shell py-[clamp(44px,5vw,80px)]">
            <div className="mb-8 grid items-end gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
              <h2 id="portfolio-work-title" className="ld-display text-[clamp(28px,3.1vw,40px)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance">
                {selected.title}
              </h2>
              {selected.lede ? <p className="text-[15.5px] leading-relaxed text-[var(--ld-muted)]">{selected.lede}</p> : null}
            </div>
            {caseStudies.length ? (
              <CaseStudies projects={caseStudies} />
            ) : (
              <>
                <div className="md:hidden">
                  <WorkRail projects={featured.projects} media={featured.media} />
                </div>
                <div className="hidden md:block">
                  <WorkIndex projects={featured.projects} media={featured.media} />
                </div>
              </>
            )}
          </div>
        </section>
        <AboutChangelog heading={experience} experience={about.experience} />
        <AboutToolkit heading={toolkit} groups={about.skillGroups} tools={about.tools} />
        <AboutCredentials heading={credentials} certifications={about.certifications} education={about.education} />
        <ContactBand />
      </main>
      <SiteFooter />
    </div>
  );
}
