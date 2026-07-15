import { Container } from "@/components/shared/container";
import { WorkBackground } from "@/components/sections/work/work-background";
import { WorkCard } from "@/components/sections/work/work-card";
import { projects } from "@/components/sections/work/work-data";

function Work() {
  return (
    <section
      id="work"
      className="relative overflow-hidden border-b border-border/80 py-24 sm:py-28"
    >
      <WorkBackground />

      <Container className="relative">
        <div className="max-w-xl">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            Selected Work
          </p>
          <h2 className="mt-4 font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Recent work, real outcomes.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            A few production systems, picked for what they solved, not
            just how they look.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <WorkCard key={project.name} project={project} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}

export { Work };
