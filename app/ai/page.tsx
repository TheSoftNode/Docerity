import type { Metadata } from "next";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Cta } from "@/components/sections/cta/cta";
import { AiHero } from "@/components/sections/ai/ai-hero";
import { AiProjects } from "@/components/sections/ai/ai-projects";
import { AiCapabilities } from "@/components/sections/ai/ai-capabilities";
import { AiModels } from "@/components/sections/ai/ai-models";

export const metadata: Metadata = {
  title: "AI Engineering",
  description:
    "Production LLM systems, RAG, multi-modal AI pipelines, and conversational agents, plus model evaluation and RLHF training data design.",
};

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
