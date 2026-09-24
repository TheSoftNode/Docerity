import { Container } from "@/components/shared/container";
import { Eyebrow, FramedPanel, Lede, SectionTitle } from "@/components/shared/section-kit";
import { WorkCapabilitiesBackground } from "@/components/sections/work-program/work-capabilities-background";
import { capabilities } from "@/components/sections/work-program/work-program-data";

function WorkCapabilities() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background py-16 sm:py-20 lg:py-24">
      <WorkCapabilitiesBackground />

      <Container className="relative grid grid-cols-1 gap-10 md:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)] lg:self-start">
          <Eyebrow>What I build</Eyebrow>
          <SectionTitle>Four kinds of problems, one way of working.</SectionTitle>
          <Lede>
            Different surfaces, same discipline: understand the problem, design
            for the version after this one, and ship it in pieces you can
            review.
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

export { WorkCapabilities };
