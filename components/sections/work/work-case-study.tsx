import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { MediaPlaceholder } from "@/components/shared/media-placeholder";
import { WorkPreview } from "@/components/sections/work/work-preview";
import { projects } from "@/components/sections/work/work-data";

function WorkCaseStudy({ project }: { project: (typeof projects)[number] }) {
  const currentIndex = projects.findIndex((p) => p.slug === project.slug);
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject =
    currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  return (
    <section className="border-b border-border/80 bg-background pt-12 pb-28 sm:pt-16 sm:pb-32">
      <Container>
        <Link
          href="/work"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          All work
        </Link>

        <div className="mx-auto mt-8 max-w-4xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xl">
              <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
                {project.category}
              </p>
              <h1 className="mt-3 font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                {project.name}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {project.description}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
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

            <div className="flex shrink-0 flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:min-w-52">
              <div>
                <p className="font-mono text-[11px] tracking-[0.15em] text-muted-foreground uppercase">
                  Outcome
                </p>
                <p className="mt-1 font-heading text-lg font-medium text-primary">
                  {project.metric}
                </p>
              </div>
              <div>
                <p className="font-mono text-[11px] tracking-[0.15em] text-muted-foreground uppercase">
                  Role
                </p>
                <p className="mt-1 text-sm text-foreground">{project.role}</p>
              </div>
              <div>
                <p className="font-mono text-[11px] tracking-[0.15em] text-muted-foreground uppercase">
                  Timeline
                </p>
                <p className="mt-1 text-sm text-foreground">{project.timeline}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-border">
            <WorkPreview variant={project.preview} />
          </div>

          <div className="mt-14">
            {project.body.map((section) => (
              <div key={section.heading} className="mb-10">
                <h2 className="font-heading text-xl font-medium text-foreground sm:text-2xl">
                  {section.heading}
                </h2>
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 24)}
                    className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.media && (
                  <MediaPlaceholder media={section.media} tone="dark" />
                )}
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
            <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
              Results
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {project.results.map((result) => (
                <li key={result} className="flex items-start gap-2.5 text-sm text-foreground/90">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  {result}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-14 flex flex-col items-center gap-4 border-t border-border pt-10 text-center">
            <p className="text-sm text-muted-foreground">
              Got something like this to build?
            </p>
            <Button
              size="lg"
              className="h-11 px-6 text-sm"
              nativeButton={false}
              render={<Link href="/contact" />}
            >
              Start a project
              <ArrowRightIcon />
            </Button>
          </div>

          {(prevProject || nextProject) && (
            <div className="mt-14 grid grid-cols-2 gap-4 border-t border-border pt-10">
              <div>
                {prevProject && (
                  <Link
                    href={`/work/${prevProject.slug}`}
                    className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
                  >
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ArrowLeftIcon className="size-3" />
                      Previous
                    </span>
                    <span className="font-heading text-sm font-medium text-foreground">
                      {prevProject.name}
                    </span>
                  </Link>
                )}
              </div>
              <div>
                {nextProject && (
                  <Link
                    href={`/work/${nextProject.slug}`}
                    className="flex flex-col items-end gap-1 rounded-xl border border-border bg-card p-4 text-right transition-colors hover:border-primary/40"
                  >
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      Next
                      <ArrowRightIcon className="size-3" />
                    </span>
                    <span className="font-heading text-sm font-medium text-foreground">
                      {nextProject.name}
                    </span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

export { WorkCaseStudy };
