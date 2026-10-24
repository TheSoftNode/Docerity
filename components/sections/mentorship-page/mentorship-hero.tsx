import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import { getGroup, getHeading } from "@/lib/content/blocks/source";
import type { TitledView } from "@/lib/content/blocks/views";
import { ReviewWindow } from "@/components/sections/mentorship-page/review-window";
import { TitlePieces } from "@/components/sections/mentorship-page/title-pieces";
import { APPLY_HREF } from "@/components/sections/mentorship-page/mentorship-content";

/**
 * The hero: the statement large, and under it the thing a mentee actually
 * gets every week, a code review, rising out of the floor and playing out.
 *
 * The window's side panel is the week, built from the editable "What you
 * get" items, so it says what the format section below says.
 */
async function MentorshipHero() {
  const [heading, formatSteps] = await Promise.all([
    getHeading("mentorship", "mentorship-hero"),
    getGroup<TitledView[]>("mentorship", "formatSteps"),
  ]);

  return (
    <section className="relative -mt-[76px] overflow-hidden bg-[linear-gradient(180deg,var(--ld-ink)_0%,#0b1844_55%,#13296b_100%)] pt-[136px] text-[var(--ld-paper)]">
      <span
        aria-hidden="true"
        className="ld-beam absolute -top-[20%] left-[8%] h-[140%] w-[46%] rotate-[14deg] bg-[linear-gradient(100deg,transparent_30%,rgb(var(--ld-tint-rgb)/0.09)_50%,transparent_70%)]"
      />
      <span
        aria-hidden="true"
        className="ld-beam absolute -top-[20%] right-[2%] h-[140%] w-[38%] -rotate-12 bg-[linear-gradient(100deg,transparent_30%,rgb(var(--ld-tint-rgb)/0.07)_50%,transparent_70%)] [animation-delay:2.5s]"
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-[30%] left-1/2 aspect-[2.4/1] w-[min(120vw,1700px)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgb(64_110_230/0.45),transparent_62%)]"
      />

      <div className="doc-shell relative">
        <div className="grid items-end gap-[clamp(28px,4vw,72px)] lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <div>
            <p className="ld-up mb-6 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-tint)] uppercase">
              {heading.eyebrow}
            </p>
            <h1 className="ld-display ld-up ld-delay-1 text-[clamp(52px,8vw,128px)] leading-[0.88] font-extrabold tracking-[-0.055em] text-balance">
              <TitlePieces title={heading.title} />
            </h1>
          </div>
          <div className="ld-up ld-delay-2 pb-2">
            {heading.lede ? (
              <p className="text-[clamp(17px,1.35vw,19px)] leading-relaxed text-[var(--ld-muted)]">{heading.lede}</p>
            ) : null}
            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link
                href={APPLY_HREF}
                className="inline-flex min-h-[50px] items-center gap-2 rounded-full bg-[var(--ld-accent)] px-6 text-[15px] font-semibold text-[var(--ld-ink)] transition-transform hover:-translate-y-0.5"
              >
                Apply for mentorship
                <ArrowUpRightIcon aria-hidden="true" className="size-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex min-h-[50px] items-center rounded-full border border-[rgb(var(--ld-paper-rgb)/0.22)] px-[22px] text-[15px] font-semibold transition-[transform,border-color] hover:-translate-y-0.5 hover:border-[rgb(var(--ld-paper-rgb)/0.5)]"
              >
                See how it works
              </a>
            </div>
          </div>
        </div>

        <ReviewWindow week={(formatSteps ?? []).slice(0, 4).map((step) => step.title)} />
      </div>
    </section>
  );
}

export { MentorshipHero };
