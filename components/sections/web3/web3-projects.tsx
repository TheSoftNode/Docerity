import { TrophyIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { projects } from "@/components/sections/web3/web3-data";

function Web3Projects() {
  return (
    <section
      id="projects"
      className="scroll-mt-[var(--nav-h)] border-b border-border/80 bg-card py-16 sm:py-20"
    >
      <Container>
        <div className="mx-auto max-w-lg text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            Projects
          </p>
          <h2 className="mt-3 font-heading text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            Built, shipped, and recognized.
          </h2>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.slug}
              className="flex flex-col rounded-2xl border border-border bg-background p-6"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <project.Icon className="size-5" />
              </span>

              <div className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                <TrophyIcon className="size-3" />
                {project.badge}
              </div>

              <h3 className="mt-4 font-heading text-xl font-medium text-foreground">
                {project.name}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {project.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export { Web3Projects };
