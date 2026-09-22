import { Container } from "@/components/shared/container";
import { Eyebrow, Lede, SectionTitle } from "@/components/shared/section-kit";
import { MentorshipPathBackground } from "@/components/sections/mentorship-program/mentorship-path-background";
import { stages } from "@/components/sections/mentorship-program/mentorship-program-data";

function MentorshipPath() {
  const last = stages.length - 1;

  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-[var(--nav-h)] overflow-hidden border-b border-border/80 bg-background py-16 sm:py-20 lg:py-24"
    >
      <MentorshipPathBackground />

      <Container className="relative grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)] lg:self-start">
          <Eyebrow>How it works</Eyebrow>
          <SectionTitle>One path, four stages.</SectionTitle>
          <Lede>
            You start where you actually are, and move on when the work shows
            you are ready &mdash; not when a calendar says so.
          </Lede>
        </div>

        <ol className="relative">
          {/* The rail, lit from sapphire to violet like the growth path. */}
          <span
            aria-hidden
            className="absolute top-5 bottom-5 left-5 w-px -translate-x-1/2 bg-[linear-gradient(to_bottom,var(--brand-primary),var(--brand-violet))] opacity-60"
          />
          {stages.map((stage, index) => {
            const isGoal = index === last;
            return (
              <li key={stage.label} className="relative grid grid-cols-[2.5rem_1fr] gap-5 pb-12 last:pb-0">
                <span
                  className={
                    isGoal
                      ? "relative z-10 flex size-10 items-center justify-center rounded-full border border-brand-violet/60 bg-background font-mono text-xs text-brand-violet shadow-[0_0_24px_-6px_var(--brand-violet)]"
                      : "relative z-10 flex size-10 items-center justify-center rounded-full border border-primary/40 bg-background font-mono text-xs text-primary"
                  }
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="pt-1">
                  <p
                    className={
                      isGoal
                        ? "font-mono text-[0.6875rem] tracking-[0.15em] text-brand-violet uppercase"
                        : "font-mono text-[0.6875rem] tracking-[0.15em] text-primary uppercase"
                    }
                  >
                    {stage.summary}
                  </p>
                  <h3 className="mt-1.5 font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    {stage.label}
                  </h3>
                  <p className="mt-2.5 max-w-[58ch] text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
                    {stage.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}

export { MentorshipPath };
