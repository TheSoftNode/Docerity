import Link from "next/link";
import { ArrowRightIcon, AwardIcon, LockIcon } from "lucide-react";

import type { Project, ProjectMedia } from "@/components/sections/work/work-data";
import { ProjectMediaFill } from "@/components/sections/work/project-media-fill";
import { PROJECT_SHOWCASES, statusDot } from "@/lib/content/project-schema";
import { cn } from "@/lib/utils";

/**
 * The portfolio's case studies, grouped the way the projects editor places
 * them: leadership and professional work, Docerity, hackathons, prototypes.
 * Each card leads with the project's screenshot, says plainly what state the
 * work is in and what the author did, and opens the full write-up.
 */
const CARD_SIZES = "(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw";

export function CaseStudies({
  projects,
  media,
}: {
  projects: readonly Project[];
  media: Partial<Record<string, ProjectMedia>>;
}) {
  const groups = PROJECT_SHOWCASES.filter((group) => group.value).map((group) => ({
    ...group,
    items: projects.filter((project) => project.showcase === group.value),
  }));

  return (
    <div className="grid gap-10">
      {groups
        .filter((group) => group.items.length)
        .map((group) => (
          <div key={group.value}>
            <h3 className="mb-4 text-[14px] font-semibold text-[var(--ld-muted)]">{group.label}</h3>
            <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {group.items.map((project) => (
                <li key={project.slug}>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-[20px] bg-[rgb(var(--ld-tint-rgb)/0.06)] ring-1 ring-[rgb(var(--ld-tint-rgb)/0.12)] transition-colors hover:bg-[rgb(var(--ld-tint-rgb)/0.1)] hover:ring-[rgb(var(--ld-accent-rgb)/0.5)]"
                  >
                    <div aria-hidden="true" className="relative aspect-[16/9] overflow-hidden bg-[var(--ld-ink)]">
                      <ProjectMediaFill project={project} media={media[project.slug]} reduceMotion={false} sizes={CARD_SIZES} tour="hover" compact />
                    </div>
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-[var(--ld-muted)]">
                        <span aria-hidden="true" className={cn("size-1.5 rounded-full", statusDot(project.status))} />
                        {project.status}
                        {project.role ? (
                          <>
                            <span aria-hidden="true">·</span>
                            {project.role}
                          </>
                        ) : null}
                      </p>
                      <p className="ld-display mt-2 text-[20px] leading-tight font-semibold tracking-[-0.02em]">{project.name}</p>
                      {project.client ? (
                        <p className="mt-1 inline-flex items-center gap-1.5 text-[13.5px] text-[var(--ld-muted)]">
                          {project.confidential ? <LockIcon className="size-3.5" /> : null}
                          {project.client}
                        </p>
                      ) : null}
                      <p className="mt-3 line-clamp-3 text-[14.5px] leading-relaxed text-[var(--ld-muted)]">{project.description}</p>
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                        {project.recognition ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ff7a59] px-3 py-1 text-[12.5px] font-semibold text-[#08102e]">
                            <AwardIcon className="size-3.5" /> {project.recognition}
                          </span>
                        ) : (
                          <span />
                        )}
                        <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--ld-accent)]">
                          Case study <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}
