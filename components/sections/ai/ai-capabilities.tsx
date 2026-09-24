import { Container } from "@/components/shared/container";
import { Eyebrow, FramedPanel, Lede, SectionTitle } from "@/components/shared/section-kit";
import { AiCapabilitiesBackground } from "@/components/sections/ai/ai-capabilities-background";
import { capabilities } from "@/components/sections/ai/ai-data";

function AiCapabilities() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background py-16 sm:py-20 lg:py-24">
      <AiCapabilitiesBackground />

      <Container className="relative grid grid-cols-1 gap-10 md:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        {/* The heading holds its place while the list scrolls past. */}
        <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)] lg:self-start">
          <Eyebrow>What I build</Eyebrow>
          <SectionTitle>The part after the demo works.</SectionTitle>
          <Lede>
            Getting a model to answer once is the easy part. These are the
            pieces that keep it answering &mdash; cheaply, reliably, and at
            real volume.
          </Lede>
        </div>

        <FramedPanel innerClassName="p-2">
          <ul className="divide-y divide-border/70">
            {capabilities.map((capability, index) => (
              <li key={capability.title} className="flex gap-5 px-5 py-6 sm:px-6">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-primary">
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

export { AiCapabilities };
