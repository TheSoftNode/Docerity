import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Web3HeroBackground } from "@/components/sections/web3/web3-hero-background";

function Web3Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background pt-16 pb-14 sm:pt-20 sm:pb-16">
      <Web3HeroBackground />

      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            Web3 & Blockchain
          </p>
          <h1 className="mt-3 font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Hackathon-winning dApps, shipped on real chains.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Smart contract systems, DeFi automation, and real-world asset
            tokenization across Solana, Stacks, and beyond — three hackathon
            wins, not just prototypes.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              className="h-11 px-6 text-sm"
              nativeButton={false}
              render={<Link href="#projects" />}
            >
              See the projects
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

export { Web3Hero };
