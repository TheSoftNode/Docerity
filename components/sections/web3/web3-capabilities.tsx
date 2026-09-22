import { Container } from "@/components/shared/container";
import { Bloom, Eyebrow, FramedPanel, Lede, SectionTitle } from "@/components/shared/section-kit";
import { Web3CapabilitiesBackground } from "@/components/sections/web3/web3-capabilities-background";
import { capabilities } from "@/components/sections/web3/web3-data";

function Web3Capabilities() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-[#0b1220] py-16 sm:py-20 lg:py-24">
      <Web3CapabilitiesBackground />
      <Bloom tone="violet" className="right-0 bottom-0 translate-x-1/3 translate-y-1/3" />

      <Container className="relative grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)] lg:self-start">
          <Eyebrow>What I build</Eyebrow>
          <SectionTitle>On-chain systems that hold up under real use.</SectionTitle>
          <Lede>
            Contracts are hard to change once they hold real value, so they are
            designed for security and maintenance from the first line.
          </Lede>
        </div>

        <FramedPanel innerClassName="p-2">
          <ul className="divide-y divide-border/70">
            {capabilities.map((capability, index) => (
              <li key={capability.title} className="flex gap-5 px-5 py-6 sm:px-6">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-brand-violet">
                  <capability.Icon className="size-5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-heading text-base font-semibold tracking-tight text-foreground sm:text-lg">
                      {capability.title}
                    </h3>
                    <span className="font-mono text-[0.6875rem] text-muted-foreground/70">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {capability.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </FramedPanel>
      </Container>
    </section>
  );
}

export { Web3Capabilities };
