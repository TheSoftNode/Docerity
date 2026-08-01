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
      className="relative overflow-hidden border-b border-border/80 py-24 sm:py-28"
    >
      <WorkBackground />

      <Container className="relative">
        <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
              Selected Work
            </p>
            <h2 className="mt-4 font-heading text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
              Recent work, real outcomes.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              A few production systems, picked for what they solved, not
              just how they look.
            </p>
          </div>

          <Button
            size="lg"
            variant="outline"
            className="h-11 shrink-0 px-6 text-sm"
            nativeButton={false}
            render={<Link href="/work" />}
          >
            See all work
            <ArrowRightIcon />
          </Button>
        </div>

        <div className="mt-10 flex justify-center lg:hidden">
          <OrbitCluster icons={orbitIcons} size={200} duration={26} badgeSize={40} />
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <WorkCard key={project.name} project={project} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}

export { Work };
