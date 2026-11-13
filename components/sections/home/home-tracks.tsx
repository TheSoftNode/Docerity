import { getBlock, getGroup } from "@/lib/content/blocks/source";
import type { PairView, ServiceLineView } from "@/lib/content/blocks/views";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { tracks } from "@/components/sections/home/home-data";
import { TracksView } from "@/components/sections/home/tracks-view";

/* The three tracks as phone cards: the dark one, the blue one, the light one. */
const CARD = {
  build: { card: "bg-[var(--ld-ink)] text-[var(--ld-paper)]", text: "text-[var(--ld-muted)]", chip: "border-[rgb(var(--ld-paper-rgb)/0.25)]", go: "bg-[var(--ld-accent)] text-[var(--ld-ink)]" },
  mentor: { card: "bg-[var(--ld-deep)] text-[var(--ld-paper)]", text: "text-[var(--ld-muted)]", chip: "border-[rgb(var(--ld-paper-rgb)/0.25)]", go: "bg-[var(--ld-tint)] text-[var(--ld-ink)]" },
  explain: { card: "border border-[var(--ld-line)] bg-[var(--ld-card)] text-[var(--ld-ink)]", text: "text-[var(--ld-text-2)]", chip: "border-[var(--ld-line-2)]", go: "bg-[var(--ld-ink)] text-[var(--ld-paper)]" },
} as const;

/**
 * "Pick a track": the three ways in, as tabs.
 *
 * Each panel is filled from content that already exists: Build lists the
 * service lines from the services page, and Explain shows the first explainer
 * pair. Only the track names and their one-line pitches are design copy (see
 * `home-data.ts`).
 *
 * Keeps the `services` id, which the hero's secondary button and older links
 * to `/#services` point at.
 */
async function HomeTracks() {
  const [services, pairs] = await Promise.all([
    getBlock("services-page"),
    getGroup<PairView[]>("explainers", "pairs"),
  ]);

  const lines = ((services.lines ?? []) as ServiceLineView[]).map((line) => line.title);
  const pair = (pairs ?? [])[0];

  return (
    <section
      id="services"
      aria-labelledby="home-tracks-title"
      className="scroll-mt-24 bg-[var(--ld-paper)] text-[var(--ld-ink)]"
    >
      <div className="doc-shell py-14 sm:py-24 lg:py-28">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-12 md:gap-6">
          <div>
            <h2
              id="home-tracks-title"
              className="ld-display text-[clamp(40px,5.6vw,80px)] leading-[0.95] font-extrabold tracking-[-0.045em]"
            >
              Pick a track.
            </h2>
          </div>
          <p className="max-w-[22rem] text-[17px] leading-relaxed text-[var(--ld-text-2)]">
            One studio, three ways in. Choose the one you came for.
          </p>
        </div>

        {/* On a phone each track is a whole card you can read and tap, rather
            than a tab whose panel opens somewhere below it. */}
        <ul className="grid gap-3.5 md:hidden">
          {tracks.map((track) => {
            const tone = CARD[track.key];
            const chips =
              track.key === "build"
                ? lines.slice(0, 3)
                : track.key === "mentor"
                  ? ["Weekly 1:1s", "Code review"]
                  : pair
                    ? [`${pair.conceptLabel} ≈ ${pair.analogyLabel}`]
                    : [];
            return (
              <li key={track.key}>
                <Link href={track.action.href} className={cn("block rounded-[24px] p-6", tone.card)}>
                  <span className="ld-display text-[32px] leading-none font-extrabold tracking-[-0.04em]">{track.label}</span>
                  <p className={cn("mt-3 text-[15px] leading-relaxed", tone.text)}>{track.headline}</p>
                  {chips.length > 0 ? (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {chips.map((chip) => (
                        <li key={chip} className={cn("rounded-full border px-3 py-1.5 text-[13px]", tone.chip)}>
                          {chip}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <span className="mt-5 flex items-center justify-between text-[15px] font-semibold">
                    {track.action.label}
                    <span aria-hidden="true" className={cn("grid size-10 place-items-center rounded-full", tone.go)}>
                      <ArrowRightIcon className="size-4" />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden md:block">
        <TracksView
          serviceLines={lines}
          pair={pair ? { concept: pair.conceptLabel, analogy: pair.analogyLabel } : null}
        />
        </div>
      </div>
    </section>
  );
}

export { HomeTracks };
