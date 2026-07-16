import { Container } from "@/components/shared/container";
import { Web3EcosystemsBackground } from "@/components/sections/web3/web3-ecosystems-background";
import { ecosystems, stack } from "@/components/sections/web3/web3-data";

function Web3Ecosystems() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background py-16 sm:py-20">
      <Web3EcosystemsBackground />

      <Container className="relative">
        <div className="mx-auto max-w-lg text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            Ecosystems
          </p>
          <h2 className="mt-3 font-heading text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            Cross-chain, not locked to one network.
          </h2>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {ecosystems.map((eco) => (
            <span
              key={eco}
              className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
            >
              {eco}
            </span>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-lg border-t border-border/60 pt-8 text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
            Stack
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {stack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm text-foreground/90"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export { Web3Ecosystems };
