import { Container } from "@/components/shared/container";
import {
  Bloom,
  Eyebrow,
  HoverCard,
  Lede,
  SectionTitle,
} from "@/components/shared/section-kit";
import { experience } from "@/components/sections/about/about-data";

/*
  Each card is a two-column split from `lg`: the role identity on the left, the
  detail on the right.

  A single stacked column looked plausible in isolation but wasted roughly half
  the card — prose is capped near 64 characters for readability, so on a 1245px
  shell the right-hand 45% of every card was empty while the text wrapped
  early. Splitting the identity out fills the measure without lengthening the
  line.
*/
function AboutExperience() {
  return (
    <section
      id="experience"
      className="relative overflow-hidden border-b border-border/80 bg-background py-16 lg:py-24"
    >
      <Bloom className="top-1/3 left-0 -translate-x-1/2" />

      <Container className="relative">
        <div className="max-w-2xl">
          <Eyebrow>Track record</Eyebrow>
          <SectionTitle>Where the experience comes from.</SectionTitle>
          <Lede className="mt-5">
            Six roles, in the order they happened. The engineering came after
            the field work, which is why the debugging habits are the ones that
            stuck.
          </Lede>
        </div>

        {/*
          A spine down the left, with a node per role.

          Six unconnected cards read as six unrelated facts; the rule and the
          nodes say "these happened in this order", which is the whole point of
          listing them chronologically. It only appears from `lg`, where there
          is room for it outside the card.
        */}
        <ol className="relative mt-12 flex flex-col gap-5 lg:pl-10">
          <span
            aria-hidden
            className="pointer-events-none absolute top-3 bottom-3 left-[3px] hidden w-px bg-[linear-gradient(to_bottom,transparent,var(--border)_12%,var(--border)_88%,transparent)] lg:block"
          />

          {experience.map((job, index) => (
            <li key={`${job.org}-${job.role}`} className="relative">
              <span
                aria-hidden
                className={
                  "absolute top-8 -left-10 hidden size-[7px] rounded-full lg:block " +
                  (index === 0
                    ? "bg-primary shadow-[0_0_10px_var(--brand-primary)]"
                    : "bg-border ring-4 ring-background")
                }
              />
              <HoverCard>
                <div className="grid grid-cols-1 gap-x-10 gap-y-5 p-6 lg:grid-cols-[minmax(0,17rem)_1fr] lg:p-8">
                  {/* Identity column. `min-w-0` so a long role can wrap rather
                      than forcing the track wider than its declared max. */}
                  <div className="min-w-0 lg:border-r lg:border-border/70 lg:pr-8">
                    <h3 className="font-heading text-lg leading-snug font-semibold text-foreground">
                      {job.role}
                    </h3>
                    <p className="mt-1.5 text-sm text-primary">{job.org}</p>
                    <p className="mt-3 font-mono text-xs tracking-wider text-muted-foreground uppercase">
                      {job.period}
                    </p>
                  </div>

                  {/* Capped at a readable measure. The shell now grows with the
                      viewport, so without this the bullets run past 90
                      characters on a 16" screen.

                      The cap is in `rem`, not `ch`: the bullets are `text-sm`
                      while this container is not, and `ch` resolves against
                      the container's font — so a `ch` cap here let the smaller
                      text run several characters longer than it claimed. */}
                  <div className="min-w-0 lg:max-w-[44rem]">
                    <p className="text-pretty text-[0.9375rem] leading-relaxed text-foreground">
                      {job.summary}
                    </p>

                    <ul className="mt-4 flex flex-col gap-2">
                      {job.points.map((point) => (
                        <li
                          key={point}
                          className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                        >
                          <span
                            aria-hidden
                            className="mt-[0.5rem] size-1 shrink-0 rounded-full bg-primary/70"
                          />
                          <span className="min-w-0">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </HoverCard>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}

export { AboutExperience };
