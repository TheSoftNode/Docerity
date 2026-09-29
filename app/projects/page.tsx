import { pageMetadata } from "@/lib/content/blocks/metadata";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Cta } from "@/components/sections/cta/cta";
import { WorkHero } from "@/components/sections/work-program/work-hero";
import { WorkShowcase } from "@/components/sections/work-program/work-showcase";
import { getWork } from "@/lib/content/work";
import { getHeading } from "@/lib/content/blocks/source";
import { WorkCapabilities } from "@/components/sections/work-program/work-capabilities";
import { WorkProcess } from "@/components/sections/work-program/work-process";
import { WorkStack } from "@/components/sections/work-program/work-stack";
import { WorkTestimonials } from "@/components/sections/work-program/work-testimonials";

/* Read per request rather than exported as a constant, so the title and
   description a search result shows can be edited without a deploy. */
export const generateMetadata = pageMetadata("work");

/*
  Revalidated, because the projects come from the database now. Editing one
  calls `revalidatePath("/projects")`, so a change appears immediately; this is the
  ceiling on staleness if that invalidation never lands.
*/
export const revalidate = 300;

export default async function WorkPage() {
  const [{ projects, media }, showcaseHeading] = await Promise.all([
    getWork(),
    getHeading("services", "work-showcase"),
  ]);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <WorkHero />
        <WorkShowcase projects={projects} media={media} heading={showcaseHeading} />
        <WorkCapabilities />
        <WorkProcess />
        <WorkStack />
        <WorkTestimonials />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
