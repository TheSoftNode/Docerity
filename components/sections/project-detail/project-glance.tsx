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
      <div className="doc-shell grid items-start gap-[clamp(24px,4vw,72px)] py-[clamp(44px,5.5vw,88px)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <h2
            id="glance-title"
            className="ld-display text-[clamp(28px,3.1vw,40px)] leading-[1.05] font-semibold tracking-[-0.03em]"
          >
            The short version.
          </h2>
          <div className="mt-5 rounded-[18px] border border-dashed border-[var(--ld-line-2)] p-5">
            <p className="text-[15px] leading-relaxed text-[var(--ld-text-2)]">
              The full story of {project.name} hasn&apos;t been written up yet. Want it sooner? We are happy to walk
              you through it.
            </p>
            <Link href="/contact" className="mt-2 inline-flex min-h-11 items-center">
              <span className="border-b-2 border-[var(--ld-accent)] pb-0.5 text-[15px] font-semibold">
                Ask about {project.name} →
              </span>
            </Link>
          </div>
        </div>

        <dl className="overflow-hidden rounded-[18px] bg-[var(--ld-card)] ring-1 ring-[rgb(8_16_46/0.06)]">
          {sheet.map((fact) => (
            <div
              key={fact.label}
              className="grid gap-1 border-b border-[var(--ld-line)] px-5 py-4 last:border-b-0 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-5"
            >
              <dt className="pt-0.5 text-[13px] text-[var(--ld-text-muted)]">{fact.label}</dt>
              <dd className="text-[15.5px] leading-normal font-medium [overflow-wrap:anywhere]">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export { ProjectGlance };
