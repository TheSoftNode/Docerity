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
    <section className="relative overflow-hidden bg-[var(--ld-ink)] pb-16 text-[var(--ld-paper)] sm:pb-24">
      <div className="doc-shell relative pt-12 sm:pt-20 lg:pt-24">
        <HeroShowcase
          title={hero.title.replace(/\n/g, " ")}
          phrases={headlinePhrases(hero.title)}
          rows={rows}
          eyebrow={
            <p
              className="ld-fade mb-8 inline-flex items-center gap-2.5 rounded-full border border-[rgb(var(--ld-paper-rgb)/0.18)] py-2 pr-4 pl-3 text-sm text-[var(--ld-muted)]"
            >
              <span className="ld-live size-2 rounded-full bg-[#54D696]" aria-hidden="true" />
              {hero.eyebrow}
            </p>
          }
        >
          <p className="ld-up ld-delay-3 mt-7 max-w-[34rem] text-[clamp(17px,1.4vw,19px)] leading-relaxed text-[var(--ld-muted)]">
            {hero.lede}
          </p>
          <div className="ld-up ld-delay-4 mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="group inline-flex min-h-14 items-center gap-2.5 rounded-full bg-[var(--ld-paper)] px-7 font-semibold text-[var(--ld-ink)] transition-transform hover:-translate-y-0.5"
            >
              {hero.primaryLabel}
              <ArrowRightIcon className="size-[18px] transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/#services"
              className="inline-flex min-h-14 items-center rounded-full border-[1.5px] border-[rgb(var(--ld-paper-rgb)/0.35)] px-7 font-semibold transition-transform hover:-translate-y-0.5"
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
