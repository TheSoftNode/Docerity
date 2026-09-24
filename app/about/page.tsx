import type { Metadata } from "next";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Cta } from "@/components/sections/cta/cta";
import { AboutHero } from "@/components/sections/about/about-hero";
import { AboutStory } from "@/components/sections/about/about-story";
import { AboutExperience } from "@/components/sections/about/about-experience";
import { AboutSkills } from "@/components/sections/about/about-skills";
import { AboutCredentials } from "@/components/sections/about/about-credentials";

export const metadata: Metadata = {
  title: "About",
  description:
    "The engineer behind Docerity: nine years teaching, production software in Python, Node and TypeScript, smart contracts across five blockchain ecosystems.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <AboutHero />
        <AboutStory />
        <AboutExperience />
        <AboutSkills />
        <AboutCredentials />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
