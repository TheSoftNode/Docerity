import Link from "next/link";
import { ArrowRightIcon, AwardIcon, LockIcon } from "lucide-react";

import type { Project } from "@/components/sections/work/work-data";
import { PROJECT_SHOWCASES, statusDot } from "@/lib/content/project-schema";
import { cn } from "@/lib/utils";

/**
 * The portfolio's case studies, grouped the way the projects editor places
 * them: leadership and professional work, Docerity, hackathons, prototypes.
 * Each card says plainly what state the work is in and what the author did,
 * and opens the full write-up.
 */
export function CaseStudies({ projects }: { projects: readonly Project[] }) {
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
                    className="group flex h-full flex-col rounded-[20px] bg-[rgb(var(--ld-tint-rgb)/0.06)] p-5 ring-1 ring-[rgb(var(--ld-tint-rgb)/0.12)] transition-colors hover:bg-[rgb(var(--ld-tint-rgb)/0.1)] sm:p-6"
                  >
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
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
}
