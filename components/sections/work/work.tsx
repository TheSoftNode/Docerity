import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { WorkBackground, orbitIcons } from "@/components/sections/work/work-background";
import { OrbitCluster } from "@/components/sections/work/work-orbit";
import { WorkCard } from "@/components/sections/work/work-card";
import { projects } from "@/components/sections/work/work-data";

function Work() {
  return (
    <section
      id="work"
      className="relative overflow-hidden border-b border-border/80 py-16 sm:py-20 lg:py-24"
    >
      <WorkBackground />

      <Container className="relative">
        {/* The heading and its action share a baseline on wide screens and
            stack on narrow, rather than the action floating off on its own. */}
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl lg:flex-1">
            <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
              Selected Work
            </p>
            {/* Same fluid scale and weight as the hero's headline, one step
                down — so the page reads as one type system. */}
            <h2 className="mt-4 text-balance font-heading text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold leading-[1.1] tracking-tight text-foreground">
              Recent work, real outcomes.
            </h2>
            <p className="mt-4 max-w-[46ch] text-pretty text-[0.9375rem] leading-[1.75] text-muted-foreground lg:max-w-[38rem]">
              A few production systems, picked for what they solved, not just
              how they look.
            </p>
          </div>

          <Button
            size="lg"
            variant="outline"
            className="h-11 w-full shrink-0 px-6 text-sm sm:w-auto"
            nativeButton={false}
            render={<Link href="/work" />}
          >
            See all work
            <ArrowRightIcon />
          </Button>
        </div>

        {/* The small orbit stands in for the wide-screen background one, so it
            only runs where that is absent. Carrying it up to `2xl` stranded it
            in a ~220px empty band between the heading and the cards. */}
        <div className="mt-10 flex justify-center lg:hidden">
          <OrbitCluster icons={orbitIcons} size={200} duration={26} badgeSize={40} />
        </div>

        {/* Two columns arrive at `sm`, where a card is still wide enough to
            hold its media and a readable description. */}
        <div className="mt-10 grid gap-5 lg:mt-14 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {projects.map((project, index) => (
            <WorkCard key={project.name} project={project} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}

export { Work };
