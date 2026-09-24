import { Container } from "@/components/shared/container";
import { Bloom, Eyebrow, SectionTitle } from "@/components/shared/section-kit";
import { WorkCard } from "@/components/sections/work/work-card";
import { projects } from "@/components/sections/work/work-data";

function WorkShowcase() {
  return (
    <section
      id="showcase"
      className="relative scroll-mt-[var(--nav-h)] overflow-hidden border-b border-border/80 bg-surface-raised py-16 sm:py-20 lg:py-24"
    >
      <Bloom tone="violet" className="top-0 left-0 -translate-x-1/3 -translate-y-1/3" />

      <Container className="relative">
        <div className="max-w-2xl">
          <Eyebrow>Selected work</Eyebrow>
          <SectionTitle>Everything shipped, and where it runs.</SectionTitle>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-6">
          {projects.map((project, index) => (
            <WorkCard key={project.name} project={project} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}

export { WorkShowcase };
