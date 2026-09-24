import type { Metadata } from "next";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Cta } from "@/components/sections/cta/cta";
import { AboutHero } from "@/components/sections/about/about-hero";
import { AboutWorkspace } from "@/components/sections/about/about-workspace";

export const metadata: Metadata = {
  title: "About",
  description:
    "The engineer behind Docerity: nine years teaching, production software in Python, Node and TypeScript, smart contracts across six blockchain ecosystems.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <AboutHero />
        <AboutWorkspace />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
