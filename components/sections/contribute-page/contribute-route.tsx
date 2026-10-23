"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { SectionHeading } from "@/lib/content/blocks/source";
import { pad } from "@/components/sections/blog-page/blog-content";

export type Stage = { status: string; title: string; description: string; cardNote: string };

/** How long the card waits at each stage. */
const STAGE_MS = 4200;

/**
 * How somebody comes to write here, as a status board: a card for "your
 * first explainer" moves from stage to stage, left to right. The reason
 * there is no form is said beside it, and the way in is underneath.
 */
function ContributeRoute({
  heading,
  stages,
  invite,
}: {
  heading: SectionHeading;
  stages: Stage[];
  invite: { note: string; primaryLabel: string; secondaryLabel: string; primaryHref: string; secondaryHref: string };
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const [at, setAt] = useState(0);

  useEffect(() => {
    if (reduceMotion || stages.length < 2) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") setAt((value) => (value + 1) % stages.length);
    }, STAGE_MS);
    return () => window.clearInterval(timer);
  }, [reduceMotion, stages.length]);

  /* Held at the end under reduced motion: the stage the route is for. */
  const current = reduceMotion ? stages.length - 1 : at;

  return (
    <section id="route" aria-labelledby="route-title" className="scroll-mt-24 bg-[var(--ld-ink)] text-[var(--ld-paper)]">
      <div className="mx-auto max-w-[1240px] px-4 py-[clamp(64px,8vw,112px)] sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-[22px]">
          <div>
            <p className="mb-3.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-tint)] uppercase">{heading.eyebrow}</p>
            <h2 id="route-title" className="ld-display max-w-[14ch] text-[clamp(36px,4.8vw,66px)] leading-[0.95] font-extrabold tracking-[-0.045em] text-balance">
              {heading.title}
            </h2>
          </div>
          {heading.lede ? <p className="max-w-[28rem] text-[17px] leading-relaxed text-[var(--ld-muted)]">{heading.lede}</p> : null}
        </div>

        <ol className="mt-[clamp(40px,5vw,64px)] grid gap-3 sm:grid-cols-2 lg:grid-cols-[repeat(var(--n),minmax(0,1fr))]" style={{ "--n": stages.length } as CSSProperties}>
          {stages.map((stage, index) => {
            const here = index === current;
            const done = index < current;
            const last = index === stages.length - 1;
            return (
              <li
                key={stage.title}
                aria-current={here ? "step" : undefined}
                className={cn(
                  "flex min-h-[330px] flex-col rounded-[22px] border p-4 transition-colors duration-500",
                  here ? "border-[rgb(var(--ld-tint-rgb)/0.5)] bg-[rgb(28_58_140/0.45)]" : "border-[rgb(var(--ld-tint-rgb)/0.14)] bg-[rgb(var(--ld-paper-rgb)/0.03)]"
                )}
              >
                <div className="flex items-center justify-between font-mono text-xs text-[var(--ld-muted-3)] uppercase">
                  <span className="inline-flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "size-2 rounded-full",
                        here ? (last ? "bg-[var(--ld-accent)]" : "bg-[var(--ld-tint)]") : done ? "bg-[#54D696]" : "bg-[rgb(var(--ld-tint-rgb)/0.3)]"
                      )}
                    />
                    {stage.status}
                  </span>
                  <span aria-hidden="true">{pad(index + 1)}</span>
                </div>
                <div aria-hidden="true" className="grid min-h-[110px] flex-1 content-start pt-4">
                  {here ? (
                    <div key={current} className="ld-pop rounded-[14px] bg-[var(--ld-paper)] p-3.5 text-[var(--ld-ink)] shadow-[0_24px_40px_-26px_rgb(0_0_0/0.8)]">
                      <span className="block font-mono text-[10.5px] text-[var(--ld-text-muted)] uppercase">Explainer</span>
                      <span className="ld-display mt-1 block text-lg font-bold">Your first explainer</span>
                      {stage.cardNote ? (
                        <span className="mt-2.5 flex items-center gap-2 text-[12.5px] text-[var(--ld-text-muted)]">
                          <span className="grid size-[22px] place-items-center rounded-full bg-[#dfe6fb] text-[10px] font-bold text-[var(--ld-deep)]">YOU</span>
                          {stage.cardNote}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                <h3 className="ld-display text-xl font-bold tracking-[-0.02em]">{stage.title}</h3>
                <p className="mt-2 text-[14.5px] leading-normal text-[var(--ld-muted)]">{stage.description}</p>
              </li>
            );
          })}
        </ol>

        <div className="mt-[22px] flex flex-wrap items-center justify-between gap-[18px] rounded-[20px] border border-[rgb(var(--ld-tint-rgb)/0.16)] bg-[rgb(17_35_88/0.45)] px-5 py-[18px]">
          <p className="max-w-[40rem] text-[15.5px] leading-normal text-[var(--ld-muted)]">{invite.note}</p>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href={invite.primaryHref}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--ld-accent)] px-5 text-[15px] font-semibold text-[var(--ld-ink)] outline-none transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--ld-paper)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ld-ink)]"
            >
              {invite.primaryLabel} <span aria-hidden="true">↗</span>
            </Link>
            <Link
              href={invite.secondaryHref}
              className="inline-flex min-h-12 items-center rounded-full border border-[rgb(var(--ld-paper-rgb)/0.22)] px-5 text-[15px] font-semibold outline-none transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-[rgb(var(--ld-paper-rgb)/0.5)] focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)]"
            >
              {invite.secondaryLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export { ContributeRoute };
