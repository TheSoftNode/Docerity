import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Bloom, Eyebrow, HeroTitle, Lede } from "@/components/shared/section-kit";
import { ScrambleText } from "@/components/shared/scramble-text";
import { ServicesIndex } from "@/components/sections/services/services-index";
import { getBlock, getHeading } from "@/lib/content/blocks/source";
import type { ServiceLineView } from "@/lib/content/blocks/views";

async function ServicesHero() {
  const [heading, block] = await Promise.all([
    getHeading("services-page", "services-hero"),
    getBlock("services-page"),
  ]);

  const lines = block.lines as ServiceLineView[];

  return (
    <section className="relative overflow-hidden border-b border-border/80 bg-background">
      <Bloom className="top-1/2 right-0 translate-x-1/3 -translate-y-1/2" />
      <Bloom tone="violet" className="bottom-0 left-0 -translate-x-1/3 translate-y-1/3" />

      {/* Two columns from `lg`, because the right half of this hero was empty
          and the question it now answers — "do you do the thing I need?" — is
          the one somebody arrives with. */}
      <Container className="relative grid items-center gap-10 py-14 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16 lg:py-20">
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

        {lines.length > 0 ? <ServicesIndex lines={lines} /> : null}
      </Container>
    </section>
  );
}

export { ServicesHero };
