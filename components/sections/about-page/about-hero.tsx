import Image from "next/image";

import type { SectionHeading } from "@/lib/content/blocks/source";
import type { EducationView, ExperienceView, FactView } from "@/lib/content/blocks/views";
import { TitlePieces } from "@/components/sections/mentorship-page/title-pieces";
import { BranchGraph } from "@/components/sections/about-page/branch-graph";
import { CurrentRoles, type CurrentRole } from "@/components/sections/about-page/current-roles";
import { initLabel, lanesFor } from "@/components/sections/about-page/about-content";

/**
 * The portfolio's hero. Who this is comes first (photo, name, what he does,
 * the ways to reach him) with the headline numbers right under it, so a phone
 * shows all of that before any scrolling. Then the career as a git branch
 * graph, every role a branch, the ongoing ones running into HEAD, with the
 * commit card for the branch in view.
 */
function AboutHero({
  heading,
  experience,
  education,
  facts,
  portrait,
  current = [],
  children,
}: {
  /** The roles held now, for the "Currently" card beside the heading. */
  current?: CurrentRole[];
  children?: React.ReactNode;
  /** The founder's photo, beside the name. */
  portrait?: string;
  heading: SectionHeading;
  experience: ExperienceView[];
  education: EducationView[];
  facts: FactView[];
}) {
  const lanes = lanesFor(experience, new Date().getFullYear());

  return (
    <section className="relative -mt-[76px] overflow-hidden bg-[radial-gradient(900px_520px_at_92%_30%,rgb(255_122_89/0.07),transparent_60%),radial-gradient(1200px_700px_at_50%_120%,rgb(28_58_140/0.55),transparent_60%),var(--ld-ink)] pt-[128px] text-[var(--ld-paper)]">
      <div className="doc-shell relative">
        <div className="grid items-end gap-[clamp(28px,4vw,64px)] lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        <div className="max-w-[46rem]">
          {portrait ? (
            <Image
              src={portrait}
              alt=""
              width={72}
              height={72}
              priority
              className="ld-up ld-delay-1 mb-5 size-16 rounded-full object-cover ring-2 ring-[rgb(var(--ld-paper-rgb)/0.18)] sm:size-[72px]"
            />
          ) : null}
          <h1 className="ld-display ld-up ld-delay-2 text-[clamp(32px,4vw,54px)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance">
            <TitlePieces title={heading.title} />
          </h1>
          {heading.lede ? (
            <p className="ld-up ld-delay-3 mt-5 max-w-[38rem] text-[clamp(15.5px,1.25vw,17.5px)] leading-relaxed text-[var(--ld-muted)]">{heading.lede}</p>
          ) : null}
          {children ? <div className="ld-up ld-delay-3">{children}</div> : null}
        </div>
        <CurrentRoles roles={current} />
        </div>

        {facts.length > 0 ? (
          <div className="ld-up ld-delay-3 mt-[clamp(28px,3.5vw,44px)] flex flex-wrap items-baseline gap-y-3 border-t border-dashed border-[rgb(var(--ld-tint-rgb)/0.18)] pt-[18px] font-mono text-[13px] text-[var(--ld-muted-3)]">
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
                  <dd className="ld-display text-[20px] font-semibold tracking-[-0.03em] text-[var(--ld-paper)]">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        <div className="mt-[clamp(44px,5vw,72px)] pb-[clamp(37px,4.2vw,51px)]">
          <BranchGraph lanes={lanes} initLabel={initLabel(education)} />
        </div>
      </div>
    </section>
  );
}

export { AboutHero };
