import { Container } from "@/components/shared/container";
import { WorkStackBackground } from "@/components/sections/work-program/work-stack-background";
import { stack } from "@/components/sections/work-program/work-program-data";

function WorkStack() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-card py-16 sm:py-20">
      <WorkStackBackground />

      <Container className="relative">
        <div className="mx-auto max-w-lg text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            The stack
          </p>
          <h2 className="mt-3 font-heading text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            Boring where it counts, sharp where it matters.
          </h2>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground/90"
            >
              {tech}
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}

export { WorkStack };
