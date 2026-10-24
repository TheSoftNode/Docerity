import type { SectionHeading } from "@/lib/content/blocks/source";
import type { Project } from "@/components/sections/work/work-data";
import { CommandBar } from "@/components/sections/projects/command-bar";
import {
  groupCounts,
  statusCounts,
  wallColumns,
} from "@/components/sections/projects/projects-content";
import { splitPhrase } from "@/components/sections/home/hero-content";

/* Each column drifts at its own speed and direction, so the wall never lines
   up into a visible grid while it moves. */
const COLUMN_MOTION = ["ld-wall-up", "ld-wall-down", "ld-wall-up-slow", "ld-wall-down-slow", "ld-wall-up"];

const TILE_FILLS = ["bg-[var(--ld-panel)]", "bg-[var(--ld-deep)]", "bg-[var(--ld-ink-2)]", "bg-[var(--ld-row)]"];

function statusDot(status: Project["status"]) {
  if (status === "Live") return "bg-[#54D696]";
  if (status === "In progress") return "bg-[#FFC94A]";
  return "bg-[var(--ld-muted-3)]";
}

/**
 * The projects hero: every project on a tilted, drifting wall, with the
 * statement and a command bar in front of it.
 *
 * The wall is the whole body of work at a glance, which is what this page is
 * for, so it is real projects rather than decoration; featured ones are lit
 * in the accent. It is hidden from assistive technology because the same
 * projects are listed properly in the showcase, and it stops under reduced
 * motion. Rendered on the server: it moves with CSS alone.
 */
function ProjectsHero({ projects, heading }: { projects: Project[]; heading: SectionHeading }) {
  const columns = wallColumns(projects);
  const status = statusCounts(projects);
  /* The title's last word carries the accent, as on the homepage. */
  const title = splitPhrase(heading.title);

  return (
    <section className="relative -mt-[76px] h-[clamp(640px,62vw,860px)] overflow-hidden bg-[var(--ld-ink)] text-[var(--ld-paper)]">
      <div aria-hidden="true" className="absolute -inset-x-[10%] -inset-y-[20%] [perspective:1400px]">
        <div className="absolute inset-0 grid origin-[50%_40%] grid-cols-3 gap-[18px] [transform:rotateX(32deg)_rotateZ(-9deg)_scale(1.08)] md:grid-cols-5">
          {columns.map((column, index) => (
            <div key={index} className={index > 2 ? "hidden overflow-hidden md:block" : "overflow-hidden"}>
              <div className={`${COLUMN_MOTION[index % COLUMN_MOTION.length]} flex flex-col gap-[18px]`}>
                {column.map((project, position) => (
                  <div
                    key={`${project.slug}-${position}`}
                    className={`flex min-h-[150px] flex-col justify-between rounded-[18px] border border-[rgb(var(--ld-tint-rgb)/0.16)] p-[18px] ${
                      project.featured ? "bg-[var(--ld-accent)] text-[var(--ld-ink)]" : TILE_FILLS[(index + position) % TILE_FILLS.length]
                    }`}
                  >
                    <span className="flex justify-between font-mono text-[11px] opacity-70">
                      <span className="inline-flex items-center gap-1.5 uppercase">
                        <span className={`size-1.5 rounded-full ${statusDot(project.status)}`} />
                        {project.status}
                      </span>
                      <span>{project.index}</span>
                    </span>
                    <span>
                      <span className="ld-display block text-[26px] leading-none font-extrabold tracking-[-0.03em]">
                        {project.name}
                      </span>
                      <span className="mt-1.5 block font-mono text-[10.5px] uppercase opacity-60">
                        {project.category}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* The falloff that lets the wall recede behind the type. A legibility
          device rather than decoration: without it the statement sits on
          moving text. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_62%_58%_at_50%_56%,rgb(var(--ld-ink-rgb)/0.94)_0%,rgb(var(--ld-ink-rgb)/0.82)_45%,rgb(var(--ld-ink-rgb)/0.25)_100%)]"
      />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[var(--ld-ink)] to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[var(--ld-ink)] to-transparent" />

      <div className="doc-shell relative flex h-full flex-col items-center justify-center pt-28 pb-10 text-center">
        <p className="ld-fade mb-6 inline-flex items-center gap-2.5 rounded-full border border-[rgb(var(--ld-paper-rgb)/0.2)] bg-[rgb(var(--ld-ink-rgb)/0.6)] py-1.5 pr-4 pl-3 text-sm text-[var(--ld-muted)] backdrop-blur">
          <span aria-hidden="true" className="ld-live size-2 rounded-full bg-[#54D696]" />
          {projects.length} systems · {status.live} live right now
        </p>
        <h1 className="ld-display ld-up ld-delay-1 max-w-[15ch] text-[clamp(44px,7vw,108px)] leading-[0.94] font-extrabold tracking-[-0.05em] text-balance">
          {title.lead} <span className="text-[var(--ld-accent)]">{title.accent}</span>
        </h1>
        {heading.lede ? (
          <p className="ld-up ld-delay-2 mt-6 max-w-[36rem] text-lg leading-relaxed text-[var(--ld-muted)]">
            {heading.lede}
          </p>
        ) : null}

        <CommandBar total={projects.length} groups={groupCounts(projects).slice(0, 5)} />
      </div>
    </section>
  );
}

export { ProjectsHero };
