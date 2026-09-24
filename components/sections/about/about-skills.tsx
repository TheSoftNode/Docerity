import Image from "next/image";

import { Container } from "@/components/shared/container";
import {
  Bloom,
  Eyebrow,
  HoverCard,
  Lede,
  SectionTitle,
} from "@/components/shared/section-kit";
import { skillGroups, tools } from "@/components/sections/about/about-data";

/*
  Grouped, and then shown twice over: what I build with as words, what I work
  in as marks.

  The portfolio rendered 36 unordered keywords ending in "and even more",
  which conveys volume but nothing about depth. Categories let someone scan
  for the part they care about, and the tool row gives the section something
  to look at rather than a nineteenth line of text.
*/
function AboutSkills() {
  return (
    <section
      id="skills"
      className="relative overflow-hidden border-b border-border/80 bg-surface-step-a py-16 lg:py-24"
    >
      <Bloom tone="violet" className="right-0 bottom-0 translate-x-1/4 translate-y-1/3" />

      <Container className="relative">
        <div className="max-w-2xl">
          <Eyebrow>Toolkit</Eyebrow>
          <SectionTitle>What I build with.</SectionTitle>
          <Lede className="mt-5">
            Grouped by what it is for rather than listed alphabetically. These
            are the things I have shipped with, not the things I have read
            about.
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

        <div className="mt-10 lg:mt-12">
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-muted-foreground uppercase">
            Day to day
          </p>
          <ul className="mt-4 flex flex-wrap gap-2.5">
            {tools.map((tool) => (
              <li key={tool.name}>
                {/* `title` and the visually hidden label together: the mark
                    alone names nothing to a screen reader, and a tooltip alone
                    names nothing to a keyboard. */}
                <span
                  title={tool.name}
                  className="group flex size-14 items-center justify-center rounded-xl border border-border bg-card transition-colors duration-300 hover:border-primary/40"
                >
                  <Image
                    src={tool.src}
                    alt=""
                    aria-hidden
                    width={28}
                    height={28}
                    className="size-7 object-contain opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <span className="sr-only">{tool.name}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

export { AboutSkills };
