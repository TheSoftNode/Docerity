import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { ExplainerBackground } from "@/components/sections/explainers/explainer-background";
import { ExplainerStage } from "@/components/sections/explainers/explainer-stage";

/* How every post is built — the two halves the stage on the right animates. */
const format = [
  { step: "01", title: "The concept", body: "A real engineering idea, named plainly." },
  { step: "02", title: "Like this", body: "Something you already know that works the same way." },
] as const;

function Explainers() {
  return (
    <section
      id="blog"
      className="relative overflow-hidden border-b border-border/80 py-16 sm:py-20 lg:py-24"
    >
      {/* The animated wave splits the band down the gutter between the two
          columns — dark behind the copy, raised behind the stage. Centred, it
          used to cut straight through the stage card. */}
      <ExplainerBackground />

      <Container className="relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <div>
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            Tech Explainers
          </p>
          <h2 className="mt-4 text-balance font-heading text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold leading-[1.1] tracking-tight text-foreground">
            Complex ideas, explained through things you already know.
          </h2>
          <p className="mt-4 max-w-[44ch] text-pretty text-[0.9375rem] leading-[1.75] text-muted-foreground">
            Every post pairs a real technical concept with an everyday analogy
            &mdash; so it actually sticks.
          </p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {format.map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-border/80 bg-card/60 p-4 backdrop-blur-sm"
              >
                <dt className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
                  <span className="font-mono text-[0.6875rem] text-primary">{item.step}</span>
                  {item.title}
                </dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </dd>
              </div>
            ))}
          </dl>

          <Button
            size="lg"
            variant="outline"
            className="mt-9 h-11 w-full px-6 text-sm sm:w-auto"
            nativeButton={false}
            render={<Link href="/blog" />}
          >
            Read the blog
            <ArrowRightIcon />
          </Button>
        </div>

        <ExplainerStage />
      </Container>
    </section>
  );
}

export { Explainers };
