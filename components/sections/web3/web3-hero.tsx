import Link from "next/link";
import { ArrowRightIcon, TrophyIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { ScrambleText } from "@/components/shared/scramble-text";
import { Button } from "@/components/ui/button";
import { Bloom, Eyebrow, HeroTitle, Lede } from "@/components/shared/section-kit";
import { HeroDeck } from "@/components/shared/hero-deck";
import { ContentIcon } from "@/components/shared/content-icon";
import { getGroup, getHeading } from "@/lib/content/blocks/source";
import type { Web3ProjectView } from "@/lib/content/blocks/views";

async function Web3Hero() {
  const heading = await getHeading("web3", "web3-hero");
  const projects = await getGroup<Web3ProjectView[]>("web3", "projects");

  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background">
      <Bloom tone="violet" className="top-1/2 right-0 translate-x-1/3 -translate-y-1/2" />
      <Bloom className="bottom-0 left-0 -translate-x-1/3 translate-y-1/3" />

      <Container className="relative grid grid-cols-1 gap-12 pt-12 pb-16 md:grid-cols-[1.1fr_0.9fr] md:items-center lg:gap-16 lg:pt-20 lg:pb-24">
        <div>
          <Eyebrow><ScrambleText text={heading.eyebrow} /></Eyebrow>
          <HeroTitle>{heading.title}</HeroTitle>
          {heading.lede ? <Lede className="mt-6 text-base">{heading.lede}</Lede> : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-10">
            <Button
              size="lg"
              className="h-11 w-full px-6 text-sm sm:w-auto"
              nativeButton={false}
              render={<Link href="#projects" />}
            >
              See the projects
              <ArrowRightIcon />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 w-full px-6 text-sm sm:w-auto"
              nativeButton={false}
              render={<Link href="/contact" />}
            >
              Start a project
            </Button>
          </div>
        </div>

        <HeroDeck
          label="Shipped &amp; recognised"
          countLabel={`${projects.length} protocols`}
          accent="violet"
          items={projects.map((project) => ({
            key: project.slug,
            icon: <ContentIcon name={project.iconName} className="size-7" strokeWidth={1.5} />,
            title: project.name,
            meta: (
              <span className="flex items-center gap-1.5">
                <TrophyIcon className="size-3.5 shrink-0 text-primary" />
                <span className="truncate">{project.badge}</span>
              </span>
            ),
            tags: project.tags,
            href: "#projects",
          }))}
        />
      </Container>
    </section>
  );
}

export { Web3Hero };
