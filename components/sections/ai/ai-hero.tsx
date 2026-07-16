import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { AiHeroBackground } from "@/components/sections/ai/ai-hero-background";

function AiHero() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background pt-16 pb-14 sm:pt-20 sm:pb-16">
      <AiHeroBackground />

      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            AI & LLM Engineering
          </p>
          <h1 className="mt-3 font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            AI systems that run in production, not a demo.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            LLM routing, RAG, multi-modal pipelines, and conversational
            agents — processing millions of real requests, plus the model
            evaluation work behind training data that actually improves a
            model.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              className="h-11 px-6 text-sm"
              nativeButton={false}
              render={<Link href="#projects" />}
            >
              See the systems
              <ArrowRightIcon />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 px-6 text-sm"
              nativeButton={false}
              render={<Link href="/contact" />}
            >
              Start a project
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

export { AiHero };
