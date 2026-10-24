import { pageMetadata } from "@/lib/content/blocks/metadata";
import { getWork } from "@/lib/content/work";
import { getHeading } from "@/lib/content/blocks/source";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ContactBand } from "@/components/sections/contact-band/contact-band";
import { ProjectsFilterProvider } from "@/components/sections/projects/filter-context";
import { ProjectsHero } from "@/components/sections/projects/projects-hero";
import { ProjectsShowcase } from "@/components/sections/projects/projects-showcase";
import { ProjectsCapabilities } from "@/components/sections/projects/projects-capabilities";
import { ProjectsProcess } from "@/components/sections/projects/projects-process";
import { ProjectsStack } from "@/components/sections/projects/projects-stack";
import { ProjectsReviews } from "@/components/sections/projects/projects-reviews";

/* Read per request rather than exported as a constant, so the title and
   description a search result shows can be edited without a deploy. */
export const generateMetadata = pageMetadata("work");

/*
  Revalidated, because the projects come from the database. Editing one calls
  `revalidatePath("/projects")`, so a change appears immediately; this is the
  ceiling on staleness if that invalidation never lands.
*/
export const revalidate = 300;

export default async function ProjectsPage() {
  const [{ projects, media }, heroHeading, showcaseHeading] = await Promise.all([
    getWork(),
    getHeading("services", "work-hero"),
    getHeading("services", "work-showcase"),
  ]);

  return (
    <div className="flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
      <SiteHeader />
      <main className="flex-1">
        {/* The hero's command bar and the showcase share one filter. */}
        <ProjectsFilterProvider>
          <ProjectsHero projects={projects} heading={heroHeading} />
          <ProjectsShowcase projects={projects} media={media} heading={showcaseHeading} />
        </ProjectsFilterProvider>
        <ProjectsCapabilities />
        <ProjectsProcess />
        <ProjectsStack />
        <ProjectsReviews />
        <ContactBand />
      </main>
      <SiteFooter />
    </div>
  );
}
