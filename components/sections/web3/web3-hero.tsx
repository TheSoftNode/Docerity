import Link from "next/link";
import { ArrowRightIcon, TrophyIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Bloom, Eyebrow, FramedPanel, HeroTitle, Lede } from "@/components/shared/section-kit";
import { Web3HeroBackground } from "@/components/sections/web3/web3-hero-background";
import { projects } from "@/components/sections/web3/web3-data";

function Web3Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background">
      <Web3HeroBackground />
      <Bloom tone="violet" className="top-1/2 right-0 translate-x-1/3 -translate-y-1/2" />

      <Container className="relative grid gap-12 pt-12 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16 lg:pt-20 lg:pb-24">
        <div>
          <Eyebrow>Web3 &amp; Blockchain</Eyebrow>
          <HeroTitle>Hackathon-winning dApps, shipped on real chains.</HeroTitle>
          <Lede className="mt-6 text-base">
            Smart contract systems, DeFi automation, and real-world asset
            tokenization across Solana, Stacks, and beyond &mdash; three
            hackathon wins, not just prototypes.
          </Lede>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-10">
            <Button
              size="lg"
              className="h-11 w-full px-6 text-sm sm:w-auto"
              nativeButton={false}
              render={<Link href="#projects" />}
            >
              See the projects
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

        <FramedPanel innerClassName="p-2">
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-muted-foreground uppercase">
              Shipped &amp; recognised
            </p>
            <p className="font-mono text-[0.6875rem] text-muted-foreground">
              {projects.length} protocols
            </p>
          </div>
          <ul className="divide-y divide-border/70">
            {projects.map((project) => (
              <li key={project.slug} className="flex items-center gap-4 px-4 py-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-brand-violet">
                  <project.Icon className="size-4.5" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {project.name}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <TrophyIcon className="size-3.5 shrink-0 text-primary" />
                    <span className="truncate">{project.badge}</span>
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

export { Web3Hero };
