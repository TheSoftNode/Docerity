import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { getGroup, getHeading } from "@/lib/content/blocks/source";
import { getSiteSettings } from "@/lib/content/blocks/site";
import type { ApplyStepView } from "@/lib/content/blocks/views";
import { TitlePieces } from "@/components/sections/mentorship-page/title-pieces";
import { APPLY_HREF, pad } from "@/components/sections/mentorship-page/mentorship-content";

/**
 * The page's own ending: the call to apply, what happens after, and the way
 * to ask first.
 *
 * It replaces the homepage's contact band here, whose "your project could be
 * next" is the wrong last word for somebody weighing mentorship. It is set on
 * the footer's own ink with a single light source at the top, and closes on
 * one drawn seam, so the section and the footer read as one ending rather
 * than a band stopping against a footer.
 */
async function MentorshipApply() {
  const [heading, steps, site] = await Promise.all([
    getHeading("mentorship", "mentorship-apply"),
    getGroup<ApplyStepView[]>("mentorship", "applySteps"),
    getSiteSettings(),
  ]);

  return (
    <section
      id="apply"
      aria-labelledby="apply-title"
      className="relative scroll-mt-24 overflow-hidden bg-[var(--ld-ink)] text-[var(--ld-paper)]"
    >
      <span
        aria-hidden="true"
        className="absolute -top-[18%] left-1/2 aspect-[2.2/1] w-[min(110vw,1500px)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgb(64_110_230/0.38),transparent_62%)]"
      />
      <div className="doc-shell relative pt-[clamp(88px,11vw,150px)]">
        <p className="mb-[22px] inline-flex items-center gap-2.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-tint)] uppercase">
          {heading.eyebrow}
        </p>
        <div className="grid items-end gap-10 md:grid-cols-[minmax(0,1fr)_auto]">
          <h2
            id="apply-title"
            className="ld-display max-w-[13ch] text-[clamp(46px,8vw,124px)] leading-[0.9] font-extrabold tracking-[-0.055em]"
          >
            <TitlePieces title={heading.title} />
          </h2>
          <div className="flex flex-col items-start gap-4 pb-2.5">
            <Link
              href={APPLY_HREF}
              className="group inline-flex min-h-16 items-center gap-3 rounded-full bg-[var(--ld-accent)] pr-3 pl-[30px] text-lg font-bold text-[var(--ld-ink)] transition-transform hover:-translate-y-0.5"
            >
              Apply for mentorship
              <span className="grid size-[42px] place-items-center rounded-full bg-[var(--ld-ink)] text-[var(--ld-paper)] transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRightIcon aria-hidden="true" className="size-4" />
              </span>
            </Link>
            <span className="text-[14.5px] text-[var(--ld-muted-3)]">
              Rather ask first?{" "}
              <a href={`mailto:${site.email}`} className="border-b border-[rgb(var(--ld-tint-rgb)/0.5)] text-[var(--ld-paper)]">
                {site.email}
              </a>
            </span>
          </div>
        </div>
        {heading.lede ? <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-[var(--ld-muted)]">{heading.lede}</p> : null}

        {steps && steps.length > 0 ? (
          <div className="mt-[clamp(56px,7vw,88px)] rounded-[28px] border border-[rgb(var(--ld-tint-rgb)/0.14)] bg-[linear-gradient(180deg,rgb(var(--ld-tint-rgb)/0.07),rgb(var(--ld-tint-rgb)/0.02))] p-[clamp(24px,3vw,36px)]">
            <p className="mb-[26px] font-mono text-[11.5px] tracking-[0.1em] text-[var(--ld-muted-3)] uppercase">What happens next</p>
            <ol
              className="relative grid gap-7 sm:grid-cols-2 lg:grid-cols-[repeat(var(--steps),minmax(0,1fr))] lg:gap-0"
              style={{ ["--steps" as string]: steps.length }}
            >
              <span
                aria-hidden="true"
                className="absolute top-[5px] right-6 left-[5px] hidden h-px bg-[linear-gradient(90deg,rgb(var(--ld-accent-rgb)/0.7),rgb(var(--ld-tint-rgb)/0.35)_30%,rgb(var(--ld-tint-rgb)/0.12))] lg:block"
              />
              {steps.map((step, index) => (
                <li key={step.title} className="relative pt-[30px] pr-6">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute top-0 left-0 size-[11px] rounded-full shadow-[0_0_0_4px_#0d1840]",
                      index === 0 ? "bg-[var(--ld-accent)]" : "bg-[var(--ld-tint)]"
                    )}
                  />
                  <span
                    className={cn(
                      "block font-mono text-xs tracking-[0.08em] uppercase",
                      index === 0 ? "text-[var(--ld-paper)]" : "text-[var(--ld-muted-3)]"
                    )}
                  >
                    {step.when}
                  </span>
                  <span className="ld-display mt-3 block text-[clamp(22px,2.1vw,28px)] font-bold tracking-[-0.02em]">{step.title}</span>
                  <span className="mt-2 block max-w-[18rem] text-[15.5px] leading-normal text-[var(--ld-muted)]">{step.description}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {/* The seam into the footer: space, then one drawn line with a single
            point of the accent. */}
        <div
          aria-hidden="true"
          className="relative mt-[clamp(80px,10vw,128px)] h-px bg-[linear-gradient(90deg,transparent,rgb(var(--ld-tint-rgb)/0.28)_50%,transparent)]"
        >
          <span className="absolute top-1/2 left-1/2 size-[7px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[var(--ld-accent)] shadow-[0_0_0_6px_var(--ld-ink)]" />
        </div>
      </div>
    </section>
  );
}

export { MentorshipApply };
