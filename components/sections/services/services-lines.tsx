import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Container } from "@/components/shared/container";
import { Eyebrow, HoverCard, Lede, SectionTitle } from "@/components/shared/section-kit";
import { ContentIcon } from "@/components/shared/content-icon";
import { anchorFor } from "@/components/sections/services/services-index";
import { getBlock, getHeading } from "@/lib/content/blocks/source";
import type { ServiceLineView } from "@/lib/content/blocks/views";

/*
  How many lines are treated as the ones we build.

  The section's own heading is "What we build, and what we run alongside it" —
  two groups — and the page used to render one undifferentiated grid of seven
  identical boxes, which contradicted it and left a dangling card in a
  two-column layout. The first three are the build disciplines; the rest run
  alongside them. Taken from the front of the list rather than flagged per
  line, so the order set in the admin is what decides, and nothing has to be
  re-tagged when a line is added or moved.
*/
const BUILD_LINES = 3;

/* One accent per build card. Seven cards in the same blue read as a
   spreadsheet: the colour is what makes them look at the second one. */
const ACCENTS = [
  {
    ring: "hover:border-primary/40",
    glow: "bg-primary/[0.07]",
    chip: "border-primary/30 bg-primary/10 text-primary",
    rule: "bg-gradient-to-r from-primary/60 to-transparent",
  },
  {
    ring: "hover:border-brand-violet/40",
    glow: "bg-brand-violet/[0.07]",
    chip: "border-brand-violet/30 bg-brand-violet/10 text-brand-violet",
    rule: "bg-gradient-to-r from-brand-violet/60 to-transparent",
  },
  {
    ring: "hover:border-brand-teal/40",
    glow: "bg-brand-teal/[0.07]",
    chip: "border-brand-teal/30 bg-brand-teal/10 text-brand-teal",
    rule: "bg-gradient-to-r from-brand-teal/60 to-transparent",
  },
] as const;

/** A build discipline: the big cards, one per column on a wide screen. */
function BuildCard({ line, index }: { line: ServiceLineView; index: number }) {
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <article
      id={anchorFor(line.title)}
      className={cn(
        "group relative flex scroll-mt-[var(--nav-h)] flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-colors sm:p-7",
        accent.ring
      )}
    >
      {/* The light only arrives on hover, so a still page is not seven glowing
          boxes competing with each other. */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-24 -right-16 size-56 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100",
          accent.glow
        )}
      />
      <span aria-hidden className={cn("absolute inset-x-0 top-0 h-px", accent.rule)} />

      <div className="relative flex items-start justify-between gap-4">
        <span
          className={cn(
            "flex size-12 items-center justify-center rounded-xl border",
            accent.chip
          )}
        >
          <ContentIcon name={line.iconName} className="size-5" strokeWidth={1.75} />
        </span>
        <span
          aria-hidden
          className="font-heading text-4xl leading-none font-semibold text-foreground/[0.07]"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <h3 className="relative mt-6 font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {line.title}
      </h3>
      <p className="relative mt-2 text-sm font-medium text-foreground/70">{line.summary}</p>
      <p className="relative mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
        {line.description}
      </p>

      {/* Only where a page exists. A "see more" that goes nowhere is worse
          than no link. */}
      {line.href ? (
        <Link
          href={line.href}
          className="relative mt-6 inline-flex items-center gap-1.5 border-t border-border/80 pt-4 text-sm text-foreground transition-colors hover:text-primary"
        >
          See the projects
          <ArrowRightIcon className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </article>
  );
}

/** A supporting line: compact, four across, no numbering competing with the
    build cards above. */
function SupportCard({ line }: { line: ServiceLineView }) {
  return (
    <HoverCard
      key={line.title}
      className="scroll-mt-[var(--nav-h)]"
      innerClassName="p-5 sm:p-6"
    >
      <div id={anchorFor(line.title)} className="flex h-full flex-col">
        <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground">
          <ContentIcon name={line.iconName} className="size-[1.125rem]" strokeWidth={1.75} />
        </span>
        <h3 className="mt-4 font-heading text-base font-semibold tracking-tight text-foreground">
          {line.title}
        </h3>
        <p className="mt-1.5 text-xs font-medium text-primary">{line.summary}</p>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {line.description}
        </p>
        {line.href ? (
          <Link
            href={line.href}
            className="mt-4 inline-flex items-center gap-1.5 text-xs text-foreground transition-colors hover:text-primary"
          >
            See the projects
            <ArrowRightIcon className="size-3 shrink-0" />
          </Link>
        ) : null}
      </div>
    </HoverCard>
  );
}

/**
 * Every line of work, on one page.
 *
 * The capability grid on /projects is the short version of this and stops at
 * what gets built. This is the page somebody lands on wanting to know whether
 * the thing they need is something we do at all, which for half the list was
 * not previously possible to find out anywhere on the site.
 */
async function ServicesLines() {
  const [block, heading] = await Promise.all([
    getBlock("services-page"),
    getHeading("services-page", "services-lines"),
  ]);

  const lines = block.lines as ServiceLineView[];
  const build = lines.slice(0, BUILD_LINES);
  const alongside = lines.slice(BUILD_LINES);

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

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-6">
          {build.map((line, index) => (
            <BuildCard key={line.title} line={line} index={index} />
          ))}
        </div>

        {alongside.length > 0 ? (
          <div className="mt-14 lg:mt-16">
            <div className="flex items-center gap-4">
              <h3 className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
                And what runs alongside it
              </h3>
              <span aria-hidden className="h-px flex-1 bg-border" />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {alongside.map((line) => (
                <SupportCard key={line.title} line={line} />
              ))}
            </div>
          </div>
        ) : null}
      </Container>
    </section>
  );
}

export { ServicesLines };
