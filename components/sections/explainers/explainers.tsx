import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { ExplainerBackground } from "@/components/sections/explainers/explainer-background";
import { ExplainerStage } from "@/components/sections/explainers/explainer-stage";

function Explainers() {
  return (
    <section
      id="blog"
      className="relative overflow-hidden border-b border-border/80 py-16 sm:py-20"
    >
      <ExplainerBackground />

      <Container className="relative">
        <div className="mx-auto max-w-xl text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            Tech Explainers
          </p>
          <h2 className="mt-3 font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Complex ideas, explained through things you already know.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Every post pairs a real technical concept with an everyday
            analogy &mdash; so it actually sticks.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl">
          <ExplainerStage />
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            variant="outline"
            className="h-11 px-6 text-sm"
            nativeButton={false}
            render={<Link href="#" />}
          >
            Read the blog
            <ArrowRightIcon />
          </Button>
        </div>
      </Container>
    </section>
  );
}

export { Explainers };
