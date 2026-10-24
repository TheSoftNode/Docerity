import { getBlock, getGroup } from "@/lib/content/blocks/source";
import type { PairView, ServiceLineView } from "@/lib/content/blocks/views";
import { TracksView } from "@/components/sections/home/tracks-view";

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
      <div className="doc-shell py-16 sm:py-24 lg:py-28">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-4 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">
              What we do
            </p>
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

        <TracksView
          serviceLines={lines}
          pair={pair ? { concept: pair.conceptLabel, analogy: pair.analogyLabel } : null}
        />
      </div>
    </section>
  );
}

export { HomeTracks };
