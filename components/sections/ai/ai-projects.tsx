import { Container } from "@/components/shared/container";
import { Bloom, Eyebrow, HoverCard, MetricDot, SectionTitle } from "@/components/shared/section-kit";
import { projects } from "@/components/sections/ai/ai-data";

function AiProjects() {
  return (
    <section
      id="projects"
      className="relative scroll-mt-[var(--nav-h)] overflow-hidden border-b border-border/80 bg-surface-raised py-16 sm:py-20 lg:py-24"
    >
      <Bloom tone="violet" className="top-0 left-0 -translate-x-1/3 -translate-y-1/3" />

      <Container className="relative">
        <div className="max-w-2xl">
          <Eyebrow>Systems</Eyebrow>
          <SectionTitle>Built for real traffic, not a proof of concept.</SectionTitle>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:mt-14 lg:gap-6">
          {projects.map((project, index) => (
            <HoverCard key={project.slug} innerClassName="p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-background text-primary transition-colors duration-300 group-hover:border-primary/50">
                  <project.Icon className="size-5" strokeWidth={1.75} />
                </span>
                <span
                  aria-hidden
                  className="font-heading text-4xl leading-none font-semibold text-foreground/[0.06] transition-colors duration-500 group-hover:text-primary/20"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <h3 className="mt-6 font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {project.name}
              </h3>
              <p className="mt-2 flex items-center gap-2 font-heading text-sm font-semibold text-primary">
                <MetricDot />
                {project.stat}
              </p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                {project.description}
              </p>

              <ul className="mt-6 flex flex-wrap gap-2 border-t border-border/80 pt-5">
                {project.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-border/80 px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </HoverCard>
          ))}
        </div>
      </Container>
    </section>
  );
}

export { AiProjects };
