import { Container } from "@/components/shared/container";
import { Web3CapabilitiesBackground } from "@/components/sections/web3/web3-capabilities-background";
import { capabilities } from "@/components/sections/web3/web3-data";

function Web3Capabilities() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-card py-16 sm:py-20">
      <Web3CapabilitiesBackground />

      <Container className="relative">
        <div className="mx-auto max-w-lg text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            What I build
          </p>
          <h2 className="mt-3 font-heading text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            On-chain systems that hold up under real use.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6">
          {capabilities.map((capability) => (
            <div
              key={capability.title}
              className="flex gap-4 rounded-xl border border-border/80 bg-background p-6"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <capability.Icon className="size-5" />
              </span>
              <div>
                <h3 className="font-heading text-base font-medium text-foreground">
                  {capability.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {capability.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export { Web3Capabilities };
