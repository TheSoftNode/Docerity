import { Container } from "@/components/shared/container";
import { Bloom, Eyebrow, SectionTitle } from "@/components/shared/section-kit";
import { founder, story } from "@/components/sections/about/about-data";

/*
  Long-form prose, so the measure is the constraint that matters: the column is
  capped at 68 characters rather than filling the shell, because a 1400px line
  of body text is genuinely hard to track back from.
*/
function AboutStory() {
  return (
    <section
      id="story"
      className="relative overflow-hidden border-b border-border/80 bg-surface-raised py-16 lg:py-24"
    >
      <Bloom tone="violet" className="top-0 right-0 translate-x-1/3 -translate-y-1/2" />

      <Container className="relative">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Eyebrow>The short version</Eyebrow>
            <SectionTitle>How this started.</SectionTitle>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              {founder.name}
              <span className="mt-1 block text-muted-foreground/80">
                {founder.role}
              </span>
            </p>
          </div>

          <div className="max-w-[68ch]">
            {story.map((paragraph, index) => (
              <p
                key={index}
                className={
                  index === 0
                    ? "text-pretty text-[1.0625rem] leading-[1.8] text-foreground"
                    : "mt-5 text-pretty text-[0.9375rem] leading-[1.8] text-muted-foreground"
                }
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export { AboutStory };
