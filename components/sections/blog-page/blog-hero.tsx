"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { SectionHeading } from "@/lib/content/blocks/source";
import { TitlePieces } from "@/components/sections/mentorship-page/title-pieces";
import { MELT, heroPairs, type BlogElement } from "@/components/sections/blog-page/blog-content";

/** The largest the word is set, before it is fitted to the width. */
const FONT_MAX = 230;

/**
 * The blog's hero: what an idea is called, melting into what it is like.
 *
 * One word at a time, very large: an explainer's concept ("Caching") holds,
 * then melts like ink into its everyday analogy ("A sticky note on your
 * monitor"), which then melts into the next concept. The melt is two words
 * crossfading through a blur, sharpened by an alpha threshold. The filter is
 * on only while it melts, so the type is crisp at rest.
 *
 * It holds under the pointer and while off screen, and the explainers below
 * it can be picked directly. Under reduced motion it does not melt or move
 * on by itself; picking an explainer swaps the word. The heading is the
 * page's h1; the word is decoration over a plain line that says the same.
 */
function BlogHero({ heading, elements }: { heading: SectionHeading; elements: BlogElement[] }) {
  const pairs = heroPairs(elements);
  /* The sequence: concept, analogy, next concept, next analogy, and round. */
  const words = pairs.flatMap((pair) => [
    { text: pair.concept, analogy: false },
    { text: pair.analogy, analogy: true },
  ]);

  const reduceMotion = useReducedMotion() ?? false;
  const [step, setStep] = useState(0);
  const [melting, setMelting] = useState(false);
  const [held, setHeld] = useState(false);
  const [inView, setInView] = useState(true);
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const from = useRef<HTMLSpanElement>(null);
  const to = useRef<HTMLSpanElement>(null);

  const current = words.length ? words[step % words.length] : null;
  const next = words.length ? words[(step + 1) % words.length] : null;
  const pair = pairs[Math.floor((step % Math.max(words.length, 1)) / 2)];

  /* Each word is fitted to the stage on wide screens; on narrow ones it wraps instead. */
  const fit = useCallback(() => {
    const box = stage.current;
    if (!box) return;
    for (const node of [from.current, to.current]) {
      if (!node) continue;
      node.style.fontSize = "";
      if (window.innerWidth < 768) continue;
      node.style.fontSize = `${FONT_MAX}px`;
      const max = box.clientWidth * 0.94;
      const width = node.getBoundingClientRect().width;
      if (width > max) node.style.fontSize = `${Math.floor((FONT_MAX * max) / width)}px`;
    }
  }, []);

  useLayoutEffect(() => {
    fit();
  }, [fit, step]);

  useEffect(() => {
    window.addEventListener("resize", fit);
    void document.fonts?.ready.then(fit);
    return () => window.removeEventListener("resize", fit);
  }, [fit]);

  useEffect(() => {
    const node = section.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  /* Hold, then melt into the next word, then hold again. */
  useEffect(() => {
    if (reduceMotion || held || !inView || words.length < 2) return;
    let frame = 0;
    let started = performance.now();
    let phase: "hold" | "melt" = "hold";

    const tick = (now: number) => {
      const a = from.current;
      const b = to.current;
      if (phase === "hold" && now - started >= MELT.holdMs) {
        phase = "melt";
        started = now;
        setMelting(true);
      }
      if (phase === "melt" && a && b) {
        const f = Math.min((now - started) / MELT.meltMs, 1);
        const rest = 1 - f;
        b.style.filter = `blur(${Math.min(8 / Math.max(f, 0.001) - 8, 100)}px)`;
        b.style.opacity = `${Math.pow(f, 0.4)}`;
        a.style.filter = `blur(${Math.min(8 / Math.max(rest, 0.001) - 8, 100)}px)`;
        a.style.opacity = `${Math.pow(rest, 0.4)}`;
        if (f >= 1) {
          a.style.filter = "";
          a.style.opacity = "";
          b.style.filter = "";
          b.style.opacity = "";
          setMelting(false);
          setStep((value) => (value + 1) % words.length);
          return;
        }
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      for (const node of [from.current, to.current]) {
        if (node) {
          node.style.filter = "";
          node.style.opacity = "";
        }
      }
      setMelting(false);
    };
  }, [reduceMotion, held, inView, words.length, step]);

  return (
    <section
      ref={section}
      aria-labelledby="blog-title"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      className="relative -mt-[76px] bg-white pt-[118px] pb-12 text-[var(--ld-ink)]"
    >
      <div className="doc-shell grid min-h-[min(720px,calc(100svh-40px))] grid-rows-[auto_minmax(300px,1fr)_auto]">
        <div className="flex flex-col gap-2.5 border-b border-[var(--ld-line)] pb-[22px] md:flex-row md:items-baseline md:justify-between md:gap-10">
          <h1 id="blog-title" className="ld-display ld-up order-2 max-w-[24ch] text-[clamp(26px,2.2vw,32px)] leading-[1.12] font-bold tracking-[-0.025em] md:order-1">
            <TitlePieces title={heading.title} />
          </h1>
          <p className="order-1 font-mono text-[12.5px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase md:order-2">{heading.eyebrow}</p>
        </div>

        {current && next ? (
          <div ref={stage} aria-hidden="true" className={cn("relative grid min-w-0 place-items-center overflow-hidden", melting && "[filter:url(#ld-melt)_blur(0.3px)]")}>
            <div className="absolute inset-x-0 top-[calc(50%-150px)] flex justify-center gap-2.5 font-mono text-[10.5px] tracking-[0.12em] text-[#9aa0b1] uppercase md:top-[calc(50%-168px)] md:gap-3.5 md:text-[12.5px]">
              <span className={cn("transition-colors duration-500", !current.analogy && "text-[var(--ld-ink)]")}>What it&apos;s called</span>
              <span className="relative h-px w-8 self-center overflow-hidden bg-[var(--ld-line)] md:w-14">
                <span className={cn("absolute inset-y-0 left-0 bg-[var(--ld-ink)] transition-[width] duration-[1100ms] ease-linear", current.analogy !== melting ? "w-full" : "w-0")} />
              </span>
              <span className={cn("transition-colors duration-500", current.analogy && "text-[var(--ld-ink)]")}>What it&apos;s like</span>
            </div>
            {[
              { ref: from, word: current, shown: true },
              { ref: to, word: next, shown: false },
            ].map(({ ref, word, shown }, index) => (
              <span
                key={index}
                ref={ref}
                style={shown ? undefined : { opacity: 0 }}
                className={cn(
                  "ld-display absolute w-full px-1 text-center text-[clamp(40px,12vw,56px)] leading-[0.98] md:text-[clamp(72px,11vw,200px)] font-extrabold tracking-[-0.06em] select-none md:w-auto md:px-0 md:leading-none md:whitespace-nowrap",
                  word.analogy ? "text-[var(--ld-deep)]" : "text-[var(--ld-ink)]"
                )}
              >
                {word.text}
              </span>
            ))}
            <svg width="0" height="0" className="absolute">
              <filter id="ld-melt">
                <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140" />
              </filter>
            </svg>
          </div>
        ) : (
          <div />
        )}

        {pair ? (
          <div className="grid items-end gap-3.5 border-t border-[var(--ld-line)] pt-[22px] md:grid-cols-[1fr_auto_1fr] md:gap-6">
            <p className="max-w-[26rem] text-base leading-normal text-[var(--ld-text-muted)]">
              <span className="font-semibold text-[var(--ld-ink)]">{pair.concept}.</span> {pair.caption || `Works like ${pair.analogy.toLowerCase()}.`}
              <span className="sr-only">
                {" "}
                {pair.concept} works like {pair.analogy.toLowerCase()}.
              </span>
            </p>
            <div role="group" aria-label="Explainers" className="flex flex-wrap gap-x-[22px] gap-y-2">
              {pairs.map((item, index) => {
                const on = item.slug === pair.slug;
                return (
                  <button
                    key={item.slug}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setStep(index * 2)}
                    className={cn(
                      "border-b-[1.5px] py-0.5 text-[15px] outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)]",
                      on ? "border-[var(--ld-ink)] text-[var(--ld-ink)]" : "border-transparent text-[#9aa0b1] hover:text-[var(--ld-ink)]"
                    )}
                  >
                    {item.concept}
                  </button>
                );
              })}
            </div>
            <Link
              href={`/blog/${pair.slug}`}
              className="justify-self-start border-b-[1.5px] border-[var(--ld-ink)] pb-[3px] text-base font-semibold outline-none transition-colors hover:text-[var(--ld-deep)] focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)] md:justify-self-end"
            >
              Read about {pair.concept.toLowerCase()} <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export { BlogHero };
