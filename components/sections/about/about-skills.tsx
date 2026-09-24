import { Container } from "@/components/shared/container";
import {
  Bloom,
  Eyebrow,
  HoverCard,
  Lede,
  SectionTitle,
} from "@/components/shared/section-kit";
import { skillGroups } from "@/components/sections/about/about-data";

/*
  Grouped rather than one long list. The portfolio rendered 36 unordered
  keywords, which conveys volume but nothing about depth — "REACT" next to
  "and even more" reads as filler. Categories let someone scan for the part
  they actually care about.
*/
function AboutSkills() {
  return (
    <section
      id="skills"
      className="relative overflow-hidden border-b border-border/80 bg-surface-step-a py-16 lg:py-24"
    >
      <Bloom tone="violet" className="bottom-0 right-0 translate-x-1/4 translate-y-1/3" />

      <Container className="relative">
        <div className="max-w-2xl">
          <Eyebrow>Toolkit</Eyebrow>
          <SectionTitle>What I build with.</SectionTitle>
          <Lede className="mt-5">
            Grouped by what it is for rather than listed alphabetically. The
            depth varies — these are the things I have shipped with, not the
            things I have read about.
          </Lede>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {skillGroups.map((group) => (
            <HoverCard key={group.title}>
              <div className="flex h-full flex-col p-5">
                <h3 className="font-mono text-[0.6875rem] tracking-[0.16em] text-primary uppercase">
                  {group.title}
                </h3>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </HoverCard>
          ))}
        </div>
      </Container>
    </section>
  );
}

export { AboutSkills };
