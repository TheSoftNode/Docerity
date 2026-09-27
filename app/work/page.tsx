import type { Metadata } from "next";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Cta } from "@/components/sections/cta/cta";
import { WorkHero } from "@/components/sections/work-program/work-hero";
import { WorkShowcase } from "@/components/sections/work-program/work-showcase";
import { getWork } from "@/lib/content/work";
import { WorkCapabilities } from "@/components/sections/work-program/work-capabilities";
import { WorkProcess } from "@/components/sections/work-program/work-process";
import { WorkStack } from "@/components/sections/work-program/work-stack";
import { WorkTestimonials } from "@/components/sections/work-program/work-testimonials";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Production software shipped for real teams: fintech dashboards, commerce platforms, offline-first mobile apps, and the process behind them.",
};

/*
  Revalidated, because the projects come from the database now. Editing one
  calls `revalidatePath("/work")`, so a change appears immediately; this is the
  ceiling on staleness if that invalidation never lands.
*/
export const revalidate = 300;

export default async function WorkPage() {
  const { projects, media } = await getWork();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <WorkHero />
        <WorkShowcase projects={projects} media={media} />
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
