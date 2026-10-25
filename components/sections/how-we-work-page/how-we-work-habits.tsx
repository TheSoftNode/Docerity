import { CheckIcon } from "lucide-react";

import type { SectionHeading } from "@/lib/content/blocks/source";
import type { HabitView } from "@/lib/content/blocks/views";

/**
 * What a client gets whichever option they pick: the NDA, ownership agreed
 * upfront, direct contact, weekly updates and something to try. A plain
 * checklist, since that is what it is.
 */
function HowWeWorkHabits({ heading, habits }: { heading: SectionHeading; habits: HabitView[] }) {
  const shown = habits.filter((habit) => habit.title?.trim());
  if (shown.length === 0) return null;

  return (
    <section aria-labelledby="habits-title" className="bg-white text-[var(--ld-ink)]">
      <div className="doc-shell py-[clamp(64px,8vw,104px)]">
        <h2 id="habits-title" className="ld-display max-w-[24ch] text-[clamp(34px,3.8vw,52px)] leading-none font-extrabold tracking-[-0.04em] text-balance">
          {heading.title}
        </h2>
        <ul className="mt-[clamp(32px,4vw,48px)] grid gap-x-12 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-10">
          {shown.map((habit) => (
            <li key={habit.title} className="flex gap-4">
              <span aria-hidden="true" className="grid size-[30px] shrink-0 place-items-center rounded-full bg-[var(--ld-ink)] text-[var(--ld-paper)]">
                <CheckIcon className="size-4" strokeWidth={2.5} />
              </span>
              <div>
                <h3 className="text-lg font-semibold tracking-[-0.01em]">{habit.title}</h3>
                {habit.description ? <p className="mt-1.5 text-base leading-[1.55] text-[var(--ld-text-2)]">{habit.description}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export { HowWeWorkHabits };
