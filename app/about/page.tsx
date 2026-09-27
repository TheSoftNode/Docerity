import type { Metadata } from "next";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Cta } from "@/components/sections/cta/cta";
import { AboutHero } from "@/components/sections/about/about-hero";
import { AboutWorkspace } from "@/components/sections/about/about-workspace";
import { getBlock } from "@/lib/content/blocks/source";
import { getWork } from "@/lib/content/work";
import type { AboutContent, FactView } from "@/lib/content/blocks/views";

export const metadata: Metadata = {
  title: "About",
  description:
    "The engineer behind Docerity: nine years teaching, production software in Python, Node and TypeScript, smart contracts across six blockchain ecosystems.",
};

export default async function AboutPage() {
  /*
    Read once here rather than in each panel. The workspace is a Client
    Component and its four panels render inside it, so none of them can read
    the content themselves; this is also one query instead of five.
  */
  const [block, work] = await Promise.all([getBlock("about"), getWork()]);
  const about = block as unknown as AboutContent;

  /*
    The shipped-project count is counted, not typed.

    A hand-written "20+" drifts the moment a project is added or removed, and a
    number nobody can reconcile with the work page is worth less than no number
    at all. It used to be derived from the static file, which stopped being the
    truth once projects moved into the database; this counts what is actually
    published. Appended rather than stored, so it is not offered for editing and
    cannot be edited into a lie.
  */
  const facts: FactView[] = [
    ...about.facts,
    {
      value: String(work.projects.length),
      label: "Shipped projects",
      since: "every one listed on the work page",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <AboutHero founder={about.founder} facts={facts} />
        <AboutWorkspace about={about} />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
