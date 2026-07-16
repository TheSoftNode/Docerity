import { Container } from "@/components/shared/container";
import { AiModelsBackground } from "@/components/sections/ai/ai-models-background";
import { models } from "@/components/sections/ai/ai-data";

function AiModels() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-card py-16 sm:py-20">
      <AiModelsBackground />

      <Container className="relative">
        <div className="mx-auto max-w-lg text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            Models & platforms
          </p>
          <h2 className="mt-3 font-heading text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            Picked per task, not one model for everything.
          </h2>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {models.map((model) => (
            <span
              key={model}
              className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
            >
              {model}
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}

export { AiModels };
