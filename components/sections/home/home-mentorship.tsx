import Link from "next/link";

import { getGroup, getHeading } from "@/lib/content/blocks/source";
import type { CheckpointView } from "@/lib/content/blocks/views";
import { StairsView } from "@/components/sections/home/stairs-view";

/**
 * Mentorship, drawn as a staircase.
 *
 * The steps are the editable mentorship checkpoints, so adding or renaming a
 * stage in the admin changes the stairs. The heading is the same `home-mentorship`
 * entry the previous section used.
 */
async function HomeMentorship() {
  const [heading, checkpoints] = await Promise.all([
    getHeading("homepage", "home-mentorship"),
    getGroup<CheckpointView[]>("mentorship", "checkpoints"),
  ]);

  return (
    <section
      id="mentorship"
      aria-labelledby="home-mentorship-title"
      className="relative scroll-mt-24 overflow-hidden bg-[var(--ld-deep)] text-[var(--ld-paper)]"
    >
      <div
        aria-hidden="true"
        className="absolute right-[-10%] bottom-[-40%] size-[min(70vw,900px)] rounded-full border border-[rgb(var(--ld-tint-rgb)/0.14)]"
      />
      <div className="doc-shell relative py-16 sm:py-24 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-7">
          <div className="flex-[1_1_480px]">
            <p className="mb-4 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-tint)] uppercase">
              {heading.eyebrow}
            </p>
            <h2
              id="home-mentorship-title"
              className="ld-display text-[clamp(40px,5.6vw,80px)] leading-[0.95] font-extrabold tracking-[-0.045em] text-balance"
            >
              {heading.title}
            </h2>
          </div>
          <div className="flex-[0_1_380px]">
            {heading.lede ? (
              <p className="text-[17px] leading-relaxed text-[var(--ld-muted)]">{heading.lede}</p>
            ) : null}
            <p className="mt-2 text-[15px] text-[var(--ld-muted-3)]">Choose a step to see what it covers.</p>
          </div>
        </div>

        <StairsView
          checkpoints={checkpoints ?? []}
          actions={
            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link
                href="/contact?type=mentorship"
                className="inline-flex min-h-12 items-center rounded-full bg-[var(--ld-accent)] px-5.5 font-semibold text-[var(--ld-ink)] transition-transform hover:-translate-y-0.5"
              >
                Apply
              </Link>
              <Link
                href="/mentorship"
                className="inline-flex min-h-12 items-center rounded-full border-[1.5px] border-[rgb(var(--ld-tint-rgb)/0.5)] px-5.5 font-semibold transition-transform hover:-translate-y-0.5"
              >
                The program
              </Link>
            </div>
          }
        />
      </div>
    </section>
  );
}

export { HomeMentorship };
