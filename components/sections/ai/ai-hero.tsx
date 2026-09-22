import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Bloom, Eyebrow, FramedPanel, HeroTitle, Lede, MetricDot } from "@/components/shared/section-kit";
import { AiHeroBackground } from "@/components/sections/ai/ai-hero-background";
import { projects } from "@/components/sections/ai/ai-data";

function AiHero() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background">
      <AiHeroBackground />
      <Bloom className="top-1/2 right-0 translate-x-1/3 -translate-y-1/2" />

      <Container className="relative grid gap-12 pt-12 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:pt-20 lg:pb-24">
        <div>
          <Eyebrow>AI &amp; LLM Engineering</Eyebrow>
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

        {/* The proof, up front: every system below with the one number that
            matters for it. */}
        <FramedPanel innerClassName="p-2">
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-muted-foreground uppercase">
              In production
            </p>
            <p className="flex items-center gap-2 font-mono text-[0.6875rem] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-brand-teal shadow-[0_0_8px_var(--brand-teal)]" />
              {projects.length} systems
            </p>
          </div>
          <ul className="divide-y divide-border/70">
            {projects.map((project) => (
              <li key={project.slug} className="flex items-center gap-4 px-4 py-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary">
                  <project.Icon className="size-4.5" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {project.name}
                  </span>
                  <span className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                    <MetricDot />
                    <span className="truncate">{project.stat}</span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </FramedPanel>
      </Container>
    </section>
  );
}

export { AiHero };
