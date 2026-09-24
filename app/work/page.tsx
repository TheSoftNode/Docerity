import type { Metadata } from "next";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Cta } from "@/components/sections/cta/cta";
import { WorkHero } from "@/components/sections/work-program/work-hero";
import { WorkShowcase } from "@/components/sections/work-program/work-showcase";
import { WorkCapabilities } from "@/components/sections/work-program/work-capabilities";
import { WorkProcess } from "@/components/sections/work-program/work-process";
import { WorkStack } from "@/components/sections/work-program/work-stack";
import { WorkTestimonials } from "@/components/sections/work-program/work-testimonials";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Production software shipped for real teams: fintech dashboards, commerce platforms, offline-first mobile apps, and the process behind them.",
};

export default function WorkPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <WorkHero />
        <WorkShowcase />
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
