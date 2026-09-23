import { Container } from "@/components/shared/container";
import { Eyebrow, FramedPanel, Lede, SectionTitle } from "@/components/shared/section-kit";
import { Web3EcosystemsBackground } from "@/components/sections/web3/web3-ecosystems-background";
import { ecosystems, stack } from "@/components/sections/web3/web3-data";

function Web3Ecosystems() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background py-16 sm:py-20 lg:py-24">
      <Web3EcosystemsBackground />

      <Container className="relative grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <div>
          <Eyebrow>Ecosystems</Eyebrow>
          <SectionTitle>Cross-chain, not locked to one network.</SectionTitle>
          <Lede>
            The chain follows the problem. Contracts in Solidity, Clarity or
            Rust, depending on where the users and the liquidity already are.
          </Lede>
        </div>

        <FramedPanel innerClassName="divide-y divide-border/70">
          <div className="p-6 sm:p-8">
            <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-muted-foreground uppercase">
              Networks
            </p>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {ecosystems.map((eco) => (
                <li
                  key={eco}
                  className="rounded-full border border-brand-violet/35 bg-brand-violet/10 px-4 py-2 text-sm font-medium text-brand-violet"
                >
                  {eco}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 sm:p-8">
            <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-muted-foreground uppercase">
              Stack
            </p>
            <ul className="mt-5 flex flex-wrap gap-2.5">
              {stack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-full border border-border bg-background px-3.5 py-1.5 text-sm text-foreground/90"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        </FramedPanel>
      </Container>
    </section>
  );
}

export { Web3Ecosystems };
