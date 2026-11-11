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
        className="absolute right-[-10%] bottom-[-40%] hidden md:block size-[min(70vw,900px)] rounded-full border border-[rgb(var(--ld-tint-rgb)/0.14)]"
      />
      <div className="doc-shell relative py-14 sm:py-24 lg:py-28">
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
            <p className="mt-2 hidden text-[15px] text-[var(--ld-muted-3)] md:block">Choose a step to see what it covers.</p>
          </div>
        </div>

        {/* A phone reads the path top to bottom, every step already open; the
            staircase, where choosing a step changes a card, is for wider screens. */}
        <ol className="mt-7 md:hidden">
          {(checkpoints ?? []).map((checkpoint, index) => (
            <li key={checkpoint.label} className="flex gap-3.5 border-t border-[rgb(var(--ld-paper-rgb)/0.14)] py-4 first:border-t-0">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--ld-tint)] text-sm font-bold text-[var(--ld-ink)]">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[17px] font-semibold">{checkpoint.label}</p>
                {checkpoint.detail ? (
                  <p className="mt-1 text-[14px] leading-relaxed text-[var(--ld-muted)]">{checkpoint.detail}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-4 grid gap-2 md:hidden">
          <Link
            href="/contact?type=mentorship"
            className="inline-flex min-h-13 items-center justify-center rounded-full bg-[var(--ld-tint)] font-semibold text-[var(--ld-ink)]"
          >
            Apply for mentorship
          </Link>
          <Link href="/mentorship" className="inline-flex min-h-11 items-center justify-center font-semibold text-[var(--ld-tint)]">
            See the program
          </Link>
        </div>

        <div className="hidden md:block">
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
      </div>
    </section>
  );
}

export { HomeMentorship };
