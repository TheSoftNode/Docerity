import { pageMetadata } from "@/lib/content/blocks/metadata";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Cta } from "@/components/sections/cta/cta";
import { AiHero } from "@/components/sections/ai/ai-hero";
import { AiProjects } from "@/components/sections/ai/ai-projects";
import { AiCapabilities } from "@/components/sections/ai/ai-capabilities";
import { AiModels } from "@/components/sections/ai/ai-models";

/* Read per request rather than exported as a constant, so the title and
   description a search result shows can be edited without a deploy. */
export const generateMetadata = pageMetadata("ai");

export default function AiPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <AiHero />
        <AiProjects />
        <AiCapabilities />
        <AiModels />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
