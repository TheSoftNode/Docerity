import type { SectionHeading } from "@/lib/content/blocks/source";
import type { EducationView, ExperienceView, FactView } from "@/lib/content/blocks/views";
import { TitlePieces } from "@/components/sections/mentorship-page/title-pieces";
import { BranchGraph } from "@/components/sections/about-page/branch-graph";
import { initLabel, lanesFor } from "@/components/sections/about-page/about-content";

/**
 * The About page's hero: the career as a git branch graph, every role a
 * branch, all of the ongoing ones running into HEAD. The heading is HEAD's
 * message, and the headline numbers close it as a short log summary.
 */
function AboutHero({
  heading,
  experience,
  education,
  facts,
}: {
  heading: SectionHeading;
  experience: ExperienceView[];
  education: EducationView[];
  facts: FactView[];
}) {
  const lanes = lanesFor(experience, new Date().getFullYear());

  return (
    <section className="relative -mt-[76px] overflow-hidden bg-[radial-gradient(900px_520px_at_92%_30%,rgb(255_122_89/0.07),transparent_60%),radial-gradient(1200px_700px_at_50%_120%,rgb(28_58_140/0.55),transparent_60%),var(--ld-ink)] pt-[128px] text-[var(--ld-paper)]">
      <div className="doc-shell relative">
        <BranchGraph lanes={lanes} initLabel={initLabel(education)}>
          <p className="ld-up ld-delay-2 mb-4 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-tint)] uppercase">
            {heading.eyebrow} · HEAD → main
          </p>
          <h1 className="ld-display ld-up ld-delay-2 text-[clamp(42px,6vw,96px)] leading-[0.9] font-extrabold tracking-[-0.055em] text-balance">
            <TitlePieces title={heading.title} />
          </h1>
          {heading.lede ? (
            <p className="ld-up ld-delay-3 mt-5 max-w-[34rem] text-[clamp(15.5px,1.25vw,17.5px)] leading-relaxed text-[var(--ld-muted)]">{heading.lede}</p>
          ) : null}
        </BranchGraph>

        {facts.length > 0 ? (
          <div className="ld-up ld-delay-3 mt-[clamp(40px,5vw,64px)] flex flex-wrap items-baseline gap-y-3 border-t border-dashed border-[rgb(var(--ld-tint-rgb)/0.18)] pt-[18px] pb-[clamp(48px,6vw,80px)] font-mono text-[13px] text-[var(--ld-muted-3)]">
            <span aria-hidden="true" className="mr-3.5 text-[var(--ld-paper)]">
              git shortlog --summary
            </span>
            <dl className="flex flex-wrap gap-y-3">
              {facts.map((fact) => (
                <div key={fact.label} title={fact.since} className="flex flex-col-reverse border-l border-[rgb(var(--ld-tint-rgb)/0.16)] px-4 sm:flex-row-reverse sm:items-baseline sm:gap-2">
                  <dt>
                    {fact.label}
                    <span className="sr-only">: {fact.since}</span>
                  </dt>
                  <dd className="ld-display text-[26px] font-extrabold tracking-[-0.03em] text-[var(--ld-paper)]">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export { AboutHero };
