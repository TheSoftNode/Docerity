import { TrophyIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Bloom, Eyebrow, HoverCard, SectionTitle } from "@/components/shared/section-kit";
import { projects } from "@/components/sections/web3/web3-data";

function Web3Projects() {
  return (
    <section
      id="projects"
      className="relative scroll-mt-[var(--nav-h)] overflow-hidden border-b border-border/80 bg-[#0b1220] py-16 sm:py-20 lg:py-24"
    >
      <Bloom className="top-0 left-0 -translate-x-1/3 -translate-y-1/3" />

      <Container className="relative">
        <div className="max-w-2xl">
          <Eyebrow>Projects</Eyebrow>
          <SectionTitle>Built, shipped, and recognized.</SectionTitle>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-6">
          {projects.map((project, index) => (
            <HoverCard key={project.slug} innerClassName="p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-background text-brand-violet transition-colors duration-300 group-hover:border-brand-violet/50">
                  <project.Icon className="size-5" strokeWidth={1.75} />
                </span>
                <span
                  aria-hidden
                  className="font-heading text-4xl leading-none font-semibold text-foreground/[0.06] transition-colors duration-500 group-hover:text-brand-violet/25"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <p className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[0.6875rem] font-medium text-primary">
                <TrophyIcon className="size-3" />
                {project.badge}
              </p>

              <h3 className="mt-4 font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {project.name}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
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

export { Web3Projects };
