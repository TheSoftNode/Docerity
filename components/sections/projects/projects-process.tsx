import { getGroup, getHeading } from "@/lib/content/blocks/source";
import type { ProcessStepView } from "@/lib/content/blocks/views";
import { ProcessConsole, type ConsoleStage } from "@/components/sections/projects/process-console";
import { processLog, stageSlug } from "@/components/sections/projects/projects-content";

/**
 * How it works, as a deploy console: the editable process steps as a
 * pipeline beside a terminal that types out each stage. The steps and the
 * heading are read here; the console that plays them runs in the browser.
 */
async function ProjectsProcess() {
  const [heading, steps] = await Promise.all([
    getHeading("services", "work-process"),
    getGroup<ProcessStepView[]>("services", "process"),
  ]);

  const stages: ConsoleStage[] = (steps ?? []).map((step, position) => ({
    title: step.title,
    summary: step.summary,
    description: step.description,
    slug: stageSlug(step.title),
    log: processLog(position, step),
  }));

  return (
    <section
      aria-labelledby="process-title"
      className="relative overflow-hidden bg-[var(--ld-ink)] text-[var(--ld-paper)]"
    >
      <div
        aria-hidden="true"
        className="absolute top-[18%] -left-[12%] size-[min(46vw,640px)] rounded-full border border-[rgb(var(--ld-tint-rgb)/0.1)]"
      />
      <div className="doc-shell relative pb-16 sm:pb-24 lg:pb-28">
        <div className="mb-11 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-4 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-tint)] uppercase">
              {heading.eyebrow}
            </p>
            <h2
              id="process-title"
              className="ld-display max-w-[14ch] text-[clamp(38px,5.2vw,72px)] leading-[0.95] font-extrabold tracking-[-0.045em]"
            >
              {heading.title}
            </h2>
          </div>
          {heading.lede ? (
            <p className="max-w-[24rem] text-[17px] leading-relaxed text-[var(--ld-muted)]">{heading.lede}</p>
          ) : null}
        </div>

        <ProcessConsole stages={stages} />
      </div>
    </section>
  );
}

export { ProjectsProcess };
