import { Container } from "@/components/shared/container";
import { WorkCard } from "@/components/sections/work/work-card";
import { projects } from "@/components/sections/work/work-data";

function WorkShowcase() {
  return (
    <section
      id="showcase"
      className="scroll-mt-[var(--nav-h)] border-b border-border/80 bg-background py-16 sm:py-20"
    >
      <Container>
        <div className="mx-auto max-w-lg text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            Case studies
          </p>
          <h2 className="mt-3 font-heading text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            A few systems, and what they actually solved.
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <WorkCard key={project.name} project={project} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}

export { WorkShowcase };
