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
    <section className="relative overflow-hidden bg-[var(--ld-ink)] pb-10 text-[var(--ld-paper)] sm:pb-12">
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
              className="ld-fade mb-6 inline-flex items-center gap-2 rounded-full border border-[rgb(var(--ld-paper-rgb)/0.18)] py-1.5 pr-3.5 pl-3 text-[13px] text-[var(--ld-muted)]"
            >
              <span className="ld-live size-2 rounded-full bg-[#54D696]" aria-hidden="true" />
              {hero.eyebrow}
            </p>
          }
        >
          <p className="ld-up ld-delay-3 mt-6 max-w-[32rem] text-[clamp(16px,1.2vw,18px)] leading-relaxed text-[var(--ld-muted)]">
            {hero.lede}
          </p>
          <div className="ld-up ld-delay-4 mt-7 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--ld-paper)] px-6 text-[15px] font-semibold text-[var(--ld-ink)] transition-transform hover:-translate-y-0.5"
            >
              {hero.primaryLabel}
              <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/#services"
              className="inline-flex min-h-12 items-center rounded-full border-[1.5px] border-[rgb(var(--ld-paper-rgb)/0.35)] px-6 text-[15px] font-semibold transition-transform hover:-translate-y-0.5"
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
