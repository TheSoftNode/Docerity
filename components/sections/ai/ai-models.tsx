import { Container } from "@/components/shared/container";
import { Bloom, Eyebrow, FramedPanel, Lede, SectionTitle } from "@/components/shared/section-kit";
import { AiModelsBackground } from "@/components/sections/ai/ai-models-background";
import { models } from "@/components/sections/ai/ai-data";

function AiModels() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-surface-raised py-16 sm:py-20 lg:py-24">
      <AiModelsBackground />
      <Bloom className="right-0 bottom-0 translate-x-1/3 translate-y-1/3" />

      <Container className="relative grid grid-cols-1 gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
        <div>
          <Eyebrow>Models &amp; platforms</Eyebrow>
          <SectionTitle>Picked per task, not one model for everything.</SectionTitle>
          <Lede>
            Each call goes to the model that fits it, weighing quality against
            cost instead of paying top price for every request.
          </Lede>
        </div>

        <FramedPanel innerClassName="p-6 sm:p-8">
          <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-muted-foreground uppercase">
            In the toolbox
          </p>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {models.map((model) => (
              <li
                key={model}
                className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
              >
                {model}
              </li>
            ))}
          </ul>
        </FramedPanel>
      </Container>
    </section>
  );
}

export { AiModels };
