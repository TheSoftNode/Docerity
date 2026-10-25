import type { SectionHeading } from "@/lib/content/blocks/source";
import type { HabitView } from "@/lib/content/blocks/views";

/**
 * What every engagement has, whichever one was picked: the NDA, ownership in
 * writing, the shared channel, the weekly update, the live previews. A dark
 * band, so it reads as the constant under the choices above it.
 */
function HowWeWorkHabits({ heading, habits }: { heading: SectionHeading; habits: HabitView[] }) {
  const shown = habits.filter((habit) => habit.title?.trim());
  if (shown.length === 0) return null;

  return (
    <section aria-labelledby="habits-title" className="bg-[var(--ld-ink)] text-[var(--ld-paper)]">
      <div className="doc-shell grid items-start gap-[clamp(32px,6vw,88px)] py-[clamp(64px,8vw,112px)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="lg:sticky lg:top-28">
          <p className="mb-3.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-muted-3)] uppercase">{heading.eyebrow}</p>
          <h2
            id="habits-title"
            className="ld-display max-w-[11ch] text-[clamp(36px,4.6vw,62px)] leading-[0.95] font-extrabold tracking-[-0.045em] text-balance"
          >
            {heading.title}
          </h2>
          {heading.lede ? <p className="mt-5 max-w-[24rem] text-[17px] leading-relaxed text-[var(--ld-muted)]">{heading.lede}</p> : null}
        </div>
        <dl className="border-t border-[rgb(var(--ld-paper-rgb)/0.18)]">
          {shown.map((habit) => (
            <div
              key={habit.title}
              className="grid gap-2 border-b border-[rgb(var(--ld-paper-rgb)/0.12)] py-6 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)] sm:gap-7"
            >
              <dt className="ld-display text-[22px] font-bold tracking-[-0.02em]">{habit.title}</dt>
              <dd className="text-[16.5px] leading-relaxed text-[var(--ld-muted)]">{habit.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export { HowWeWorkHabits };
