import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Container } from "@/components/shared/container";
import { Eyebrow, HoverCard, Lede, SectionTitle } from "@/components/shared/section-kit";
import { ContentIcon } from "@/components/shared/content-icon";
import { getBlock, getHeading } from "@/lib/content/blocks/source";
import type { ServiceLineView } from "@/lib/content/blocks/views";

/**
 * Every line of work, on one page.
 *
 * The capability grid on /work is the short version of this and stops at what
 * gets built. This is the page somebody lands on wanting to know whether the
 * thing they need is something we do at all, which for half the list was not
 * previously possible to find out anywhere on the site.
 */
async function ServicesLines() {
  const [block, heading] = await Promise.all([
    getBlock("services-page"),
    getHeading("services-page", "services-lines"),
  ]);

  const lines = block.lines as ServiceLineView[];

  return (
    <section
      id="services"
      className="relative scroll-mt-[var(--nav-h)] border-b border-border/80 bg-surface-raised py-16 sm:py-20 lg:py-24"
    >
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>{heading.eyebrow}</Eyebrow>
          <SectionTitle>{heading.title}</SectionTitle>
          {heading.lede ? <Lede>{heading.lede}</Lede> : null}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:mt-14 lg:gap-6">
          {lines.map((line, index) => (
            <HoverCard key={line.title} innerClassName="p-6 sm:p-7">
              <div className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-background text-primary">
                    <ContentIcon name={line.iconName} className="size-5" strokeWidth={1.75} />
                  </span>
                  <span
                    aria-hidden
                    className="font-heading text-3xl leading-none font-semibold text-foreground/[0.06]"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mt-5 font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  {line.title}
                </h3>
                <p className="mt-1.5 text-sm font-medium text-primary">{line.summary}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {line.description}
                </p>

                {/* Only where a page exists. A "see more" that goes nowhere is
                    worse than no link. */}
                {line.href ? (
                  <Link
                    href={line.href}
                    className="mt-5 inline-flex items-center gap-1.5 border-t border-border/80 pt-4 text-sm text-foreground transition-colors hover:text-primary"
                  >
                    See the projects
                    <ArrowRightIcon className="size-3.5 shrink-0" />
                  </Link>
                ) : null}
              </div>
            </HoverCard>
          ))}
        </div>
      </Container>
    </section>
  );
}

export { ServicesLines };
