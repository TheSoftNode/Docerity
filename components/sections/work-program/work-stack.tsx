import { Container } from "@/components/shared/container";
import { Bloom, Eyebrow, FramedPanel, Lede, SectionTitle } from "@/components/shared/section-kit";
import { WorkStackBackground } from "@/components/sections/work-program/work-stack-background";
import { stack } from "@/components/sections/work-program/work-program-data";

function WorkStack() {
  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background py-16 sm:py-20 lg:py-24">
      <WorkStackBackground />
      <Bloom className="right-0 bottom-0 translate-x-1/3 translate-y-1/3" />

      <Container className="relative grid grid-cols-1 gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center lg:gap-16">
        <div>
          <Eyebrow>The stack</Eyebrow>
          <SectionTitle>Boring where it counts, sharp where it matters.</SectionTitle>
          <Lede>
            Proven tools for the parts that must not surprise anyone, and newer
            ones only where they earn their place.
          </Lede>
        </div>

        <FramedPanel innerClassName="p-6 sm:p-8">
          <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-muted-foreground uppercase">
            Day to day
          </p>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {stack.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground/90"
              >
                {tech}
              </li>
            ))}
          </ul>
        </FramedPanel>
      </Container>
    </section>
  );
}

export { WorkStack };
