"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { SectionHeading } from "@/lib/content/blocks/source";
import { pad, tableSlots, titleParts, type BlogElement } from "@/components/sections/blog-page/blog-content";

/** How long the reading panel holds each piece when nobody is choosing. */
const CYCLE_MS = 3600;

/**
 * The blog's hero: every piece as an element in a periodic table.
 *
 * The heading sits in the table's top gap and a reading panel in the second;
 * hovering or picking an element fills the panel with it. Left alone, the
 * panel walks back through the pieces from the latest, until somebody picks
 * one, and it never moves under reduced motion. Slots not yet filled are drawn
 * dashed, as pieces being written, so the table grows as the blog does.
 *
 * Below `lg` the table reflows into a plain grid under the heading and the
 * panel, and the empty slots are dropped: on a phone they are only noise.
 */
function BlogTable({ elements, heading }: { elements: BlogElement[]; heading: SectionHeading }) {
  const reduceMotion = useReducedMotion() ?? false;
  const latest = elements.length - 1;
  const [chosen, setChosen] = useState<number | null>(null);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (reduceMotion || chosen !== null || elements.length < 2) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") setCycle((value) => value + 1);
    }, CYCLE_MS);
    return () => window.clearInterval(timer);
  }, [reduceMotion, chosen, elements.length]);

  if (elements.length === 0) return null;

  const index = chosen ?? (latest - (cycle % elements.length) + elements.length) % elements.length;
  const current = elements[index];
  const { filled, empty } = tableSlots(elements.length);
  const title = titleParts(heading.title);

  return (
    <section className="relative -mt-[76px] overflow-hidden bg-[var(--ld-paper)] pt-[118px] pb-[clamp(56px,7vw,96px)] text-[var(--ld-ink)]">
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_55%,rgb(var(--ld-tint-rgb)/0.35),transparent_70%)]"
      />
      <div className="doc-shell relative">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2.5 border-b-2 border-[var(--ld-ink)] pb-3.5 font-mono text-[11.5px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">
          <span className="text-[var(--ld-ink)]">The Docerity table of explainers</span>
          <span>
            {pad(elements.length)} elements · {heading.eyebrow}
          </span>
          <span aria-hidden="true" className="hidden gap-4 lg:inline-flex">
            <span className="inline-flex items-center gap-[7px]">
              <span className="size-2.5 rounded-[3px] bg-[var(--ld-ink)]" />
              Explainer
            </span>
            <span className="inline-flex items-center gap-[7px]">
              <span className="size-2.5 rounded-[3px] bg-[var(--ld-deep)]" />
              Article
            </span>
            <span className="inline-flex items-center gap-[7px]">
              <span className="size-2.5 rounded-[3px] border-[1.5px] border-dashed border-[#9aa6c8]" />
              Being written
            </span>
          </span>
        </div>

        <div className="relative mt-[clamp(22px,3vw,36px)] grid grid-cols-4 gap-[clamp(6px,0.8vw,12px)] sm:grid-cols-5 lg:grid-cols-10">
          <div className="col-span-full lg:col-[2/10] lg:row-[1] lg:self-center lg:px-[clamp(8px,2vw,28px)]">
            <h1 className="ld-display ld-up pb-2.5 text-[clamp(34px,4.6vw,74px)] leading-[0.92] font-extrabold tracking-[-0.05em] text-balance lg:pb-0">
              {title.text}
              <span className="text-[var(--ld-accent)]">{title.stop}</span>
            </h1>
          </div>

          {/* The reading panel. A live region, so choosing an element is
              announced; the tiles themselves are the controls. */}
          <div
            aria-live="polite"
            className="col-span-full flex flex-wrap items-center gap-[clamp(16px,2vw,28px)] rounded-[22px] bg-[var(--ld-ink)] px-[clamp(16px,2vw,26px)] py-[clamp(14px,1.8vw,22px)] text-[var(--ld-paper)] shadow-[0_40px_80px_-46px_rgb(var(--ld-ink-rgb)/0.7)] sm:flex-nowrap lg:col-[3/9] lg:row-[2]"
          >
            <span
              key={`sym-${current.slug}`}
              aria-hidden="true"
              className="ld-up relative grid aspect-square w-[clamp(64px,7vw,96px)] shrink-0 place-items-center rounded-2xl bg-[var(--ld-paper)] text-[clamp(28px,3.2vw,44px)] font-extrabold tracking-[-0.04em] text-[var(--ld-ink)] ld-display"
            >
              {current.symbol}
              <span className="absolute top-[5px] left-[7px] font-mono text-[10px] font-normal text-[var(--ld-text-muted)]">{pad(current.number)}</span>
            </span>
            <span key={`text-${current.slug}`} className="ld-up min-w-0 flex-1">
              <span className="block font-mono text-[11.5px] tracking-[0.1em] text-[var(--ld-tint)] uppercase">
                {current.kind}
                {current.type === "explainer" ? ` · ${current.name}` : ""}
              </span>
              <h2 className="ld-display mt-1.5 text-[clamp(20px,2.2vw,30px)] leading-[1.08] font-bold tracking-[-0.025em]">
                {current.type === "explainer" ? <span aria-hidden="true">≈ </span> : null}
                {current.line}
              </h2>
              <span className="mt-1.5 hidden text-[14.5px] leading-snug text-[var(--ld-muted)] sm:block">{current.hook}</span>
            </span>
            <Link
              href={`/blog/${current.slug}`}
              className="inline-flex min-h-[46px] shrink-0 items-center rounded-full bg-[var(--ld-paper)] px-[18px] text-[14.5px] font-semibold whitespace-nowrap text-[var(--ld-ink)] transition-transform hover:-translate-y-0.5"
            >
              Read · {current.read}
              <span className="sr-only">: {current.line}</span>
            </Link>
          </div>

          {elements.map((element, position) => {
            const on = position === index;
            const slot = filled[position];
            const explainer = element.type === "explainer";
            return (
              <button
                key={element.slug}
                type="button"
                aria-pressed={on}
                aria-label={explainer ? `${element.name}: ${element.line}` : element.line}
                onClick={() => setChosen(position)}
                onPointerEnter={(event) => {
                  if (event.pointerType === "mouse") setChosen(position);
                }}
                onFocus={() => setChosen(position)}
                style={{ ["--c" as string]: slot.column, ["--r" as string]: slot.row }}
                className={cn(
                  "relative aspect-square rounded-[clamp(10px,1.2vw,16px)] border text-left outline-none transition-[transform,box-shadow,background-color,color] duration-300 ease-[cubic-bezier(.2,.7,.2,1)] lg:col-[var(--c)] lg:row-[var(--r)]",
                  "hover:-translate-y-1 hover:shadow-[0_18px_30px_-18px_rgb(var(--ld-ink-rgb)/0.5)] focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)] focus-visible:ring-offset-2",
                  on
                    ? "-translate-y-1.5 border-2 border-[var(--ld-ink)] bg-[var(--ld-paper)] text-[var(--ld-ink)] shadow-[0_22px_36px_-18px_rgb(var(--ld-ink-rgb)/0.55)]"
                    : explainer
                      ? "border-[var(--ld-ink)] bg-[var(--ld-ink)] text-[var(--ld-paper)]"
                      : "border-[var(--ld-deep)] bg-[var(--ld-deep)] text-[var(--ld-paper)]"
                )}
              >
                <span aria-hidden="true" className="absolute top-[7%] left-[9%] font-mono text-[clamp(8px,0.8vw,11px)] opacity-65">
                  {pad(element.number)}
                </span>
                <span aria-hidden="true" className="absolute top-[7%] right-[9%] font-mono text-[clamp(7px,0.7vw,10px)] opacity-55">
                  {element.read.replace(/\s*min$/i, "m")}
                </span>
                <span
                  aria-hidden="true"
                  className="ld-display absolute top-[47%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(22px,2.6vw,40px)] font-extrabold tracking-[-0.04em]"
                >
                  {element.symbol}
                </span>
                <span aria-hidden="true" className="absolute inset-x-[6%] bottom-[8%] truncate text-center text-[clamp(8px,0.78vw,11px)] leading-tight opacity-80">
                  {element.name}
                </span>
                {on ? <span aria-hidden="true" className="absolute right-[7%] bottom-[7%] size-[7px] rounded-full bg-[var(--ld-accent)]" /> : null}
              </button>
            );
          })}

          {empty.map((slot) => (
            <span
              key={`empty-${slot.column}-${slot.row}`}
              aria-hidden="true"
              style={{ ["--c" as string]: slot.column, ["--r" as string]: slot.row }}
              className="hidden aspect-square rounded-[clamp(10px,1.2vw,16px)] border-[1.5px] border-dashed border-[#b7c1de] lg:col-[var(--c)] lg:row-[var(--r)] lg:block"
            />
          ))}
        </div>

        <div className="mt-[clamp(22px,3vw,34px)] flex flex-wrap items-center justify-between gap-4 border-t border-[var(--ld-line)] pt-4">
          {heading.lede ? <p className="max-w-[40rem] text-base leading-normal text-[var(--ld-text-2)]">{heading.lede}</p> : <span />}
          <span className="inline-flex flex-wrap gap-2.5">
            <a
              href="#glossary"
              className="inline-flex min-h-[46px] items-center rounded-full bg-[var(--ld-ink)] px-5 text-[14.5px] font-semibold text-[var(--ld-paper)] transition-transform hover:-translate-y-0.5"
            >
              Browse by topic
            </a>
            <Link
              href="/contribute"
              className="inline-flex min-h-[46px] items-center rounded-full border border-[var(--ld-line-2)] px-[18px] text-[14.5px] font-semibold transition-colors hover:border-[var(--ld-ink)]"
            >
              Write for us
            </Link>
          </span>
        </div>
      </div>
    </section>
  );
}

export { BlogTable };
