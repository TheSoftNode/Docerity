import { experience } from "@/components/sections/about/about-data";

/*
  A spine with a node per role, so six entries read as one sequence rather
  than six unrelated cards.
*/
function ExperiencePanel() {
  return (
    <ol className="relative flex flex-col gap-4 sm:pl-8">
      <span
        aria-hidden
        className="pointer-events-none absolute top-4 bottom-4 left-[3px] hidden w-px bg-[linear-gradient(to_bottom,transparent,var(--border)_10%,var(--border)_90%,transparent)] sm:block"
      />

      {experience.map((job, index) => (
        <li key={`${job.org}-${job.role}`} className="group relative">
          <span
            aria-hidden
            className={
              "absolute top-7 -left-8 hidden size-[7px] rounded-full transition-colors duration-300 sm:block " +
              (index === 0
                ? "bg-primary shadow-[0_0_10px_var(--brand-primary)]"
                : "bg-border ring-4 ring-background group-hover:bg-primary/70")
            }
          />

          <div className="rounded-2xl border border-border bg-card p-5 transition-colors duration-300 hover:border-primary/40 lg:p-6">
            <div className="flex flex-col gap-x-8 gap-y-4 lg:grid lg:grid-cols-[minmax(0,15rem)_1fr]">
              <div className="min-w-0 lg:border-r lg:border-border/70 lg:pr-8">
                <h3 className="font-heading text-lg leading-snug font-semibold text-foreground">
                  {job.role}
                </h3>
                <p className="mt-1.5 text-sm text-primary">{job.org}</p>
                <p className="mt-3 font-mono text-xs tracking-wider text-muted-foreground uppercase">
                  {job.period}
                </p>
              </div>

              {/* Capped in `rem`, not `ch`: the bullets are `text-sm` while
                  this container is not, and `ch` resolves against the
                  container's font, so a `ch` cap let them run longer than it
                  claimed. */}
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
          </div>
        </li>
      ))}
    </ol>
  );
}

export { ExperiencePanel };
