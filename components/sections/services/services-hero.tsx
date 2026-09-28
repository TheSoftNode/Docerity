import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Bloom, Eyebrow, HeroTitle, Lede } from "@/components/shared/section-kit";
import { ScrambleText } from "@/components/shared/scramble-text";
import { getHeading } from "@/lib/content/blocks/source";

async function ServicesHero() {
  const heading = await getHeading("services-page", "services-hero");

  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background">
      <Bloom className="top-1/2 right-0 translate-x-1/3 -translate-y-1/2" />
      <Bloom tone="violet" className="bottom-0 left-0 -translate-x-1/3 translate-y-1/3" />

      <Container className="relative py-14 lg:py-20">
        <div className="max-w-3xl">
          <Eyebrow>
            <ScrambleText text={heading.eyebrow} />
          </Eyebrow>
          <HeroTitle>{heading.title}</HeroTitle>
          {heading.lede ? (
            <Lede className="mt-6 max-w-[58ch] text-base">{heading.lede}</Lede>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-10">
            <Button
              size="lg"
              className="h-11 w-full px-6 text-sm sm:w-auto"
              nativeButton={false}
              render={<Link href="/contact" />}
            >
              Start a project
              <ArrowRightIcon />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 w-full px-6 text-sm sm:w-auto"
              nativeButton={false}
              render={<Link href="#services" />}
            >
              See the list
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

export { ServicesHero };
