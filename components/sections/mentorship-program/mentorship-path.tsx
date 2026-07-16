import { Container } from "@/components/shared/container";
import { MentorshipPathBackground } from "@/components/sections/mentorship-program/mentorship-path-background";
import { stages } from "@/components/sections/mentorship-program/mentorship-program-data";

function MentorshipPath() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-[var(--nav-h)] relative overflow-hidden border-b border-border/80 bg-background py-16 sm:py-20"
    >
      <MentorshipPathBackground />

      <Container className="relative">
        <div className="mx-auto max-w-lg text-center">
          <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
            How it works
          </p>
          <h2 className="mt-3 font-heading text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            One path, four stages.
          </h2>
        </div>

        <div className="relative mx-auto mt-12 max-w-2xl sm:mt-16">
          <div
            className="absolute top-5 bottom-5 left-5 w-px bg-border"
            aria-hidden
          />
          <ol className="flex flex-col gap-10">
            {stages.map((stage, index) => (
              <li key={stage.label} className="relative flex gap-5">
                <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-background font-mono text-sm text-primary">
                  {index + 1}
                </span>
                <div className="pt-1">
                  <p className="font-mono text-xs tracking-[0.15em] text-primary uppercase">
                    {stage.summary}
                  </p>
                  <h3 className="mt-1 font-heading text-xl font-medium text-foreground">
                    {stage.label}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {stage.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

export { MentorshipPath };
