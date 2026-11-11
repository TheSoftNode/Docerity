import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { getGroup } from "@/lib/content/blocks/source";
import type { CheckpointView, HeroCopy, PairView } from "@/lib/content/blocks/views";
import { getFeaturedWork } from "@/lib/content/work";
import { HeroShowcase } from "@/components/sections/home/hero-showcase";
import { buildBoardRows, headlinePhrases } from "@/components/sections/home/hero-content";

/**
 * The homepage hero.
 *
 * Reads the same editable copy the previous hero did, so the title, eyebrow,
 * lede and button labels are still managed in the admin. The title's lines
 * become the rotating headline, one line per phrase.
 *
 * The Now Board is built from real content too: live featured projects (each
 * row opening that project's own site), the mentorship path's stages and the
 * explainer concepts. Nothing on it is invented for the design.
 */
async function HomeHero() {
  const [hero, work, checkpoints, pairs] = await Promise.all([
    getGroup<HeroCopy>("homepage", "hero"),
    getFeaturedWork(),
    getGroup<CheckpointView[]>("mentorship", "checkpoints"),
    getGroup<PairView[]>("explainers", "pairs"),
  ]);

  const rows = buildBoardRows({
    projects: work.projects
      .filter((project) => project.status === "Live" && project.liveUrl)
      .map((project) => ({ name: project.name, href: project.liveUrl as string })),
    checkpoints: (checkpoints ?? []).map((checkpoint) => checkpoint.label),
    concepts: (pairs ?? []).map((pair) => pair.conceptLabel),
  });

  return (
    <section className="ld-hero relative overflow-hidden bg-[var(--ld-ink)] pb-10 text-[var(--ld-paper)] sm:pb-12">
      {/* Only drawn in the light theme (see home.css). */}
      <div aria-hidden="true" className="ld-hero-disc" />
      {/* Spacing kept tight on purpose: with the header, the whole hero fits
          inside a laptop viewport, so the page opens on a complete picture
          rather than a headline cut off at the fold. */}
      <div className="doc-shell relative pt-8 sm:pt-10 lg:pt-12">
        <HeroShowcase
          title={hero.title.replace(/\n/g, " ")}
          phrases={headlinePhrases(hero.title)}
          rows={rows}
          eyebrow={
            <p
              className="ld-hero-eyebrow ld-fade mb-7 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-tint)] uppercase"
            >
              {hero.eyebrow}
            </p>
          }
        >
          <p className="ld-hero-lede ld-up ld-delay-3 mt-7 max-w-[34rem] text-[clamp(17px,1.35vw,19px)] leading-relaxed text-[var(--ld-muted)]">
            {hero.lede}
          </p>
          <div className="ld-up ld-delay-4 mt-7 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-3">
            <Link
              href="/contact"
              className="ld-hero-primary group inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[var(--ld-accent)] px-6 text-[16px] font-semibold text-[var(--ld-ink)] transition-transform hover:-translate-y-0.5 sm:min-h-12 sm:bg-[var(--ld-paper)] sm:text-[15px]"
            >
              {hero.primaryLabel}
              <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/#services"
              className="ld-hero-secondary inline-flex min-h-12 items-center justify-center rounded-full px-6 text-[15px] font-semibold text-[var(--ld-tint)] transition-transform hover:-translate-y-0.5 sm:border-[1.5px] sm:border-[rgb(var(--ld-paper-rgb)/0.35)] sm:text-inherit"
            >
              {hero.secondaryLabel}
            </Link>
          </div>
        </HeroShowcase>
      </div>
    </section>
  );
}

export { HomeHero };
