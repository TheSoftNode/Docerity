import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { ScrambleText } from "@/components/shared/scramble-text";
import { Button } from "@/components/ui/button";
import { Bloom, Eyebrow, HeroTitle, Lede } from "@/components/shared/section-kit";
import { HeroDeck } from "@/components/shared/hero-deck";
import { projects } from "@/components/sections/ai/ai-data";

function AiHero() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background">
      <Bloom className="top-1/2 right-0 translate-x-1/3 -translate-y-1/2" />
      <Bloom tone="violet" className="bottom-0 left-0 -translate-x-1/3 translate-y-1/3" />

      <Container className="relative grid grid-cols-1 gap-12 pt-12 pb-16 md:grid-cols-[1.1fr_0.9fr] md:items-center lg:gap-16 lg:pt-20 lg:pb-24">
        <div>
          <Eyebrow><ScrambleText text="AI & LLM Engineering" /></Eyebrow>
          <HeroTitle>AI systems that run in production, not a demo.</HeroTitle>
          <Lede className="mt-6 text-base">
            LLM routing, RAG, multi-modal pipelines, and conversational agents
            &mdash; processing millions of real requests, plus the model
            evaluation work behind training data that actually improves a model.
          </Lede>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-10">
            <Button
              size="lg"
              className="h-11 w-full px-6 text-sm sm:w-auto"
              nativeButton={false}
              render={<Link href="#projects" />}
            >
              See the systems
              <ArrowRightIcon />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 w-full px-6 text-sm sm:w-auto"
              nativeButton={false}
              render={<Link href="/contact" />}
            >
              Start a project
            </Button>
          </div>
        </div>

        <HeroDeck
          label="In production"
          countLabel={`${projects.length} systems`}
          accent="primary"
          items={projects.map((project) => ({
            key: project.slug,
            icon: <project.Icon className="size-7" strokeWidth={1.5} />,
            title: project.name,
            meta: project.stat,
            tags: project.tags,
            href: "#projects",
          }))}
        />
      </Container>
    </section>
  );
}

export { AiHero };
