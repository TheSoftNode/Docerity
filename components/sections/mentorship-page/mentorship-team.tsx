import { getGroup, getHeading } from "@/lib/content/blocks/source";
import type { TitledView } from "@/lib/content/blocks/views";
import { TeamBench } from "@/components/sections/mentorship-page/team-bench";
import { pad } from "@/components/sections/mentorship-page/mentorship-content";

/**
 * Who reviews your code: the team, not one face.
 *
 * Mentorship runs through the Docerity team, so the section says how review
 * works (the editable principles) and shows the specialties around "You",
 * one lit at a time, rather than a portrait that would be wrong for most
 * mentees most weeks.
 */
async function MentorshipTeam() {
  const [heading, principles, specialties] = await Promise.all([
    getHeading("mentorship", "mentorship-team"),
    getGroup<TitledView[]>("mentorship", "teamPrinciples"),
    getGroup<string[]>("mentorship", "specialties"),
  ]);

  return (
    <section
      aria-labelledby="team-title"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#c9d6fd_0%,var(--ld-tint)_100%)] text-[var(--ld-ink)]"
    >
      <div className="doc-shell grid items-center gap-[clamp(36px,6vw,96px)] py-[clamp(64px,8vw,112px)] lg:grid-cols-2">
        <div>
          <p className="mb-3.5 flex items-center gap-2.5 font-mono text-[13px] tracking-[0.1em] text-[#2a3a72] uppercase">
            <span aria-hidden="true" className="size-[7px] rounded-[2px] bg-[var(--ld-accent)]" />
            {heading.eyebrow}
          </p>
          <h2
            id="team-title"
            className="ld-display max-w-[13ch] text-[clamp(38px,5.2vw,72px)] leading-[0.95] font-extrabold tracking-[-0.045em]"
          >
            {heading.title}
          </h2>
          {heading.lede ? (
            <p className="mt-5 max-w-[32rem] text-lg leading-relaxed text-[#1d2a55]">{heading.lede}</p>
          ) : null}
          {principles && principles.length > 0 ? (
            <ol className="mt-8 border-t border-[rgb(var(--ld-ink-rgb)/0.18)]">
              {principles.map((principle, index) => (
                <li key={principle.title} className="flex gap-[18px] border-b border-[rgb(var(--ld-ink-rgb)/0.18)] py-[18px]">
                  <span className="pt-1 font-mono text-xs text-[#2a3a72]">{pad(index + 1)}</span>
                  <span>
                    <span className="block text-lg font-bold">{principle.title}</span>
                    <span className="mt-1 block text-[15.5px] leading-normal text-[#1d2a55]">{principle.description}</span>
                  </span>
                </li>
              ))}
            </ol>
          ) : null}
        </div>

        {specialties && specialties.length > 0 ? <TeamBench specialties={specialties} /> : null}
      </div>
    </section>
  );
}

export { MentorshipTeam };
