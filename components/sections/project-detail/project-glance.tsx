import Link from "next/link";

import type { Project } from "@/components/sections/work/work-data";
import { extraGroups, hostOf, linkLabel, type Fact } from "@/components/sections/project-detail/project-detail-content";

/**
 * The short version, for a project with no write-up yet.
 *
 * Most of these projects have none, and the old placeholder case studies
 * filled the space with invented narrative. This says plainly that the
 * story is still being written, sets out what is known as a fact sheet, and
 * offers to tell the rest in person.
 */
function ProjectGlance({ project }: { project: Project }) {
  const groups = extraGroups(project);
  const host = hostOf(project.liveUrl);
  const sheet: Fact[] = [
    { label: "What it does", value: project.description },
    { label: "Category", value: [project.category, ...groups].join(" · ") },
    ...(project.tags.length > 0 ? [{ label: "Built with", value: project.tags.join(", ") }] : []),
    ...(host ? [{ label: "Live at", value: host }] : []),
    { label: "Source", value: project.repoUrl ? linkLabel(project.repoUrl) : "Private" },
  ];

  return (
    <section aria-labelledby="glance-title" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
      <div className="doc-shell grid items-start gap-[clamp(32px,6vw,96px)] py-[clamp(64px,8vw,112px)] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div>
          <p className="mb-3.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">At a glance</p>
          <h2
            id="glance-title"
            className="ld-display text-[clamp(38px,5.2vw,72px)] leading-[0.95] font-extrabold tracking-[-0.045em]"
          >
            The short version.
          </h2>
          <div className="mt-8 rounded-[20px] border border-dashed border-[var(--ld-line-2)] p-6">
            <p className="flex items-center gap-2.5 font-mono text-[11.5px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">
              <span aria-hidden="true" className="ld-blink size-[7px] rounded-full bg-[var(--ld-accent)]" />
              Write-up in progress
            </p>
            <p className="mt-3 text-base leading-normal text-[var(--ld-text-2)]">
              The full story of {project.name} hasn&apos;t been written up yet. Want it sooner? We are happy to walk
              you through it.
            </p>
            <Link
              href="/contact"
              className="mt-3.5 inline-flex border-b-2 border-[var(--ld-accent)] pb-0.5 text-[15px] font-semibold"
            >
              Ask about {project.name} →
            </Link>
          </div>
        </div>

        <dl className="border-t-2 border-[var(--ld-ink)]">
          {sheet.map((fact) => (
            <div
              key={fact.label}
              className="grid gap-1.5 border-b border-[var(--ld-line)] py-5 sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-5"
            >
              <dt className="pt-0.5 font-mono text-xs tracking-[0.08em] text-[var(--ld-text-muted)] uppercase">{fact.label}</dt>
              <dd className="text-[17px] leading-normal font-medium [overflow-wrap:anywhere]">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export { ProjectGlance };
