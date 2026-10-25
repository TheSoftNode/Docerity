import Image from "next/image";

import type { SectionHeading } from "@/lib/content/blocks/source";
import type { TeamMemberView } from "@/lib/content/blocks/views";
import { safeLink } from "@/lib/content/blocks/links";
import { initialsOf } from "@/components/sections/reviews-page/reviews-content";

/**
 * The team, after the founder's story, so the page is not one face.
 *
 * With people added in the admin, one card each: a photo or their initials,
 * the name, the role and a line on their focus. Until then, the specialties
 * the mentorship page already lists, so the section says what the team
 * covers without inventing anybody. Dark, between the story and the
 * changelog, so it reads as its own part of the page.
 */
function AboutTeam({ heading, members, specialties }: { heading: SectionHeading; members: TeamMemberView[]; specialties: string[] }) {
  const people = members.filter((member) => member.name?.trim() && member.role?.trim());
  const areas = specialties.filter((area) => area.trim());
  if (people.length === 0 && areas.length === 0) return null;

  return (
    <section id="team" aria-labelledby="team-title" className="scroll-mt-24 bg-[var(--ld-ink)] text-[var(--ld-paper)]">
      <div className="doc-shell py-[clamp(64px,8vw,112px)]">
        <div className="grid items-end gap-6 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="mb-3.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-muted-3)] uppercase">{heading.eyebrow}</p>
            <h2
              id="team-title"
              className="ld-display max-w-[14ch] text-[clamp(36px,4.8vw,66px)] leading-[0.95] font-extrabold tracking-[-0.045em] text-balance"
            >
              {heading.title}
            </h2>
          </div>
          {heading.lede ? <p className="max-w-[30rem] text-[17px] leading-relaxed text-[var(--ld-muted)]">{heading.lede}</p> : null}
        </div>

        {people.length > 0 ? (
          <ul className="mt-[clamp(36px,4vw,56px)] grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {people.map((person) => {
              const link = safeLink(person.link);
              return (
                <li key={`${person.name}-${person.role}`} className="rounded-[22px] border border-[rgb(var(--ld-paper-rgb)/0.12)] bg-[rgb(var(--ld-paper-rgb)/0.04)] p-6">
                  {person.photo ? (
                    <Image src={person.photo} alt="" width={64} height={64} className="size-16 rounded-full object-cover" />
                  ) : (
                    <span aria-hidden="true" className="grid size-16 place-items-center rounded-full bg-[var(--ld-deep)] text-lg font-bold text-[var(--ld-tint)]">
                      {initialsOf(person.name)}
                    </span>
                  )}
                  <h3 className="mt-5 text-lg font-semibold">{person.name}</h3>
                  <p className="mt-0.5 text-[15px] text-[var(--ld-tint)]">{person.role}</p>
                  {person.focus ? <p className="mt-3 text-[15px] leading-normal text-[var(--ld-muted)]">{person.focus}</p> : null}
                  {link ? (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block border-b border-[rgb(var(--ld-tint-rgb)/0.5)] text-sm font-semibold text-[var(--ld-paper)] hover:border-[var(--ld-paper)]"
                    >
                      Profile <span aria-hidden="true">↗</span>
                      <span className="sr-only"> for {person.name} (opens in a new tab)</span>
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-[clamp(36px,4vw,56px)]">
            <h3 className="mb-4 text-sm font-semibold text-[var(--ld-muted)]">What the team covers</h3>
            <ul className="grid border-t border-[rgb(var(--ld-paper-rgb)/0.14)] sm:grid-cols-2 lg:grid-cols-5">
              {areas.map((area) => (
                <li
                  key={area}
                  className="ld-display border-b border-[rgb(var(--ld-paper-rgb)/0.14)] py-5 text-[clamp(22px,2vw,26px)] font-bold tracking-[-0.02em] sm:pr-6 lg:border-b-0 lg:border-l lg:pl-6 lg:first:border-l-0 lg:first:pl-0"
                >
                  {area}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

export { AboutTeam };
