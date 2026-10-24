"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { PauseIcon, PlayIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SectionHeading } from "@/lib/content/blocks/source";
import { TitlePieces } from "@/components/sections/mentorship-page/title-pieces";
import { pad } from "@/components/sections/blog-page/blog-content";
import {
  CAPTION_MS,
  captionWords,
  clipsFor,
  initialsOf,
  kindTag,
  type ShownReview,
} from "@/components/sections/reviews-page/reviews-content";

/** How often the playing clip fills in. */
const STEP_MS = 100;

/* The bar colours by kind, and the same as the key. */
const KIND_FILL = { client: "bg-[#AFC4FF]", mentee: "bg-[#6d86d6]", reader: "bg-[#3e5299]" } as const;

/**
 * The reviews page's hero: every approved review, played as a caption.
 *
 * One review at a time comes up word by word, with who said it underneath.
 * Below, a waveform with a clip per review: its length is how much the person
 * wrote, and the playing one fills in as its caption is read. Any clip can be
 * picked. It holds under the pointer and off screen; under reduced motion it
 * does not play on its own and the caption simply appears.
 *
 * With nothing approved yet it says so, and the waveform is a flat line.
 */
function CaptionReel({
  heading,
  emptyLede,
  reviews,
  formHref,
}: {
  heading: SectionHeading;
  emptyLede: string;
  reviews: ShownReview[];
  formHref: string;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const clips = useMemo(() => clipsFor(reviews), [reviews]);
  /* Together, so moving to the next review is one update. */
  const [{ active, progress }, setPlayhead] = useState({ active: 0, progress: 0 });
  const [playing, setPlaying] = useState(true);
  const [held, setHeld] = useState(false);
  const [inView, setInView] = useState(true);
  const ref = useRef<HTMLElement>(null);
  const has = reviews.length > 0;
  const autoplay = has && playing && !held && inView && !reduceMotion && reviews.length > 1;

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setPlayhead((head) => {
        const next = head.progress + STEP_MS / CAPTION_MS;
        return next < 1 ? { active: head.active, progress: next } : { active: (head.active + 1) % reviews.length, progress: 0 };
      });
    }, STEP_MS);
    return () => window.clearInterval(timer);
  }, [autoplay, reviews.length]);

  const choose = (index: number) => setPlayhead({ active: index, progress: 0 });
  const review = reviews[active];

  return (
    <section
      ref={ref}
      aria-labelledby="reviews-title"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      className="relative -mt-[76px] overflow-hidden bg-[radial-gradient(1000px_520px_at_15%_0%,rgb(28_58_140/0.75),transparent_62%),radial-gradient(800px_500px_at_100%_100%,rgb(28_58_140/0.35),transparent_60%),var(--ld-ink)] pt-[136px] text-[var(--ld-paper)]"
    >
      <div className="doc-shell relative">
        <p className="ld-up inline-flex items-center gap-2.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-tint)] uppercase">
          <span aria-hidden="true" className={cn("ld-live size-2 rounded-full", has ? "bg-[#54D696]" : "bg-[var(--ld-muted-3)]")} />
          {heading.eyebrow}
        </p>
        <h1
          id="reviews-title"
          className="ld-display ld-up ld-delay-1 mt-[26px] max-w-[17ch] text-[clamp(42px,5.6vw,88px)] leading-[0.92] font-extrabold tracking-[-0.055em] text-balance"
        >
          <TitlePieces title={heading.title} />
        </h1>
        {has && heading.lede ? (
          <p className="ld-up ld-delay-2 mt-5 max-w-[40rem] text-[clamp(16px,1.3vw,18px)] leading-relaxed text-[var(--ld-muted)]">{heading.lede}</p>
        ) : null}

        {/* The caption. */}
        <div className="ld-up ld-delay-2 mt-[clamp(40px,5vw,64px)] min-h-[260px] border-t border-dashed border-[rgb(var(--ld-tint-rgb)/0.2)] pt-[clamp(24px,3vw,40px)]">
          {review ? (
            <figure aria-live="polite" className="grid gap-[clamp(16px,3vw,48px)] md:grid-cols-[120px_minmax(0,1fr)]">
              <div aria-hidden="true" className="flex gap-4 font-mono text-xs leading-[1.9] text-[var(--ld-muted-3)] md:block">
                <div className="text-[var(--ld-paper)]">
                  {pad(active + 1)} / {pad(reviews.length)}
                </div>
                <div className="uppercase">{kindTag(review.kind)}</div>
                <div className="mt-1.5 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={cn("size-[9px] rounded-full", star <= review.rating ? "bg-[var(--ld-tint)]" : "bg-[rgb(var(--ld-tint-rgb)/0.2)]")} />
                  ))}
                </div>
              </div>
              <div>
                <blockquote key={review.id} className="ld-display max-w-[34ch] text-[clamp(26px,3.2vw,46px)] leading-[1.12] font-bold tracking-[-0.03em]">
                  <span aria-hidden="true" className="text-[var(--ld-tint)]">
                    “
                  </span>
                  {reduceMotion ? (
                    review.body
                  ) : (
                    <>
                      <span className="sr-only">{review.body}</span>
                      <span aria-hidden="true">
                        {captionWords(review.body).map(({ word, delay }, index) => (
                          <span key={index} className="ld-word" style={{ animationDelay: `${delay}s` }}>
                            {word}{" "}
                          </span>
                        ))}
                      </span>
                    </>
                  )}
                  <span aria-hidden="true" className="text-[var(--ld-tint)]">
                    ”
                  </span>
                </blockquote>
                <figcaption className="mt-[22px] flex items-center gap-3">
                  {review.photoUrl ? (
                    <Image src={review.photoUrl} alt="" width={42} height={42} className="size-[42px] rounded-full object-cover" />
                  ) : (
                    <span aria-hidden="true" className="grid size-[42px] place-items-center rounded-full bg-[var(--ld-deep)] text-sm font-bold">
                      {initialsOf(review.fullName)}
                    </span>
                  )}
                  <span>
                    <span className="block text-base font-semibold">{review.fullName}</span>
                    <span className="block text-sm text-[var(--ld-muted)]">{review.title}</span>
                  </span>
                  <span className="sr-only">
                    , {kindTag(review.kind)}, {review.rating} out of 5
                  </span>
                </figcaption>
              </div>
            </figure>
          ) : (
            <div className="grid max-w-[40rem] gap-3.5">
              <p className="ld-display text-[clamp(26px,3.2vw,44px)] leading-[1.12] font-bold tracking-[-0.03em] text-[var(--ld-muted)]">
                Nothing on the record yet.
              </p>
              <p className="text-[17px] leading-relaxed text-[var(--ld-muted)]">{emptyLede}</p>
              <a
                href={formHref}
                className="inline-flex min-h-12 items-center gap-2 justify-self-start rounded-full bg-[var(--ld-accent)] px-5 text-[15px] font-semibold text-[var(--ld-ink)] outline-none transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--ld-paper)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ld-ink)]"
              >
                Be the first <span aria-hidden="true">↓</span>
              </a>
            </div>
          )}
        </div>

        {/* The waveform. */}
        <div className="ld-up ld-delay-3 mt-[clamp(32px,4vw,52px)] pt-4 pb-[clamp(40px,5vw,64px)]">
          <div className="flex items-center gap-4">
            {has && reviews.length > 1 && !reduceMotion ? (
              <button
                type="button"
                onClick={() => setPlaying((value) => !value)}
                aria-label={playing ? "Pause the reviews" : "Play the reviews"}
                className="grid size-[46px] flex-none place-items-center rounded-full border border-[rgb(var(--ld-tint-rgb)/0.3)] bg-[rgb(var(--ld-paper-rgb)/0.06)] outline-none transition-colors hover:bg-[rgb(var(--ld-paper-rgb)/0.12)] focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)]"
              >
                {playing ? <PauseIcon className="size-4" /> : <PlayIcon className="size-4" />}
              </button>
            ) : null}
            {has ? (
              <ol aria-label="Reviews, one clip each" className="flex h-[86px] min-w-0 flex-1 items-center gap-3.5">
                {clips.map((clip, index) => {
                  const on = index === active;
                  const played = on ? Math.floor(progress * clip.heights.length) : 0;
                  return (
                    <li key={clip.id} className="h-full min-w-0" style={{ flex: `${clip.heights.length} 1 0` }}>
                      <button
                        type="button"
                        aria-pressed={on}
                        aria-label={`Review ${index + 1} of ${reviews.length}, by ${reviews[index].fullName}`}
                        onClick={() => choose(index)}
                        className={cn(
                          "flex h-full w-full items-center gap-0.5 rounded-lg px-0.5 outline-none transition-colors duration-300 hover:bg-[rgb(var(--ld-tint-rgb)/0.08)] focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)]",
                          on && "bg-[rgb(255_122_89/0.08)]"
                        )}
                      >
                        {clip.heights.map((height, bar) => (
                          <span
                            key={bar}
                            aria-hidden="true"
                            style={{ height }}
                            className={cn(
                              "max-w-1 min-w-0.5 flex-1 rounded-sm transition-colors duration-150",
                              on ? (bar < played || reduceMotion ? "bg-[var(--ld-accent)]" : "bg-[rgb(var(--ld-paper-rgb)/0.55)]") : KIND_FILL[clip.kind]
                            )}
                          />
                        ))}
                      </button>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div aria-hidden="true" className="relative flex h-[86px] flex-1 items-center">
                <span className="h-0.5 w-full bg-[rgb(var(--ld-tint-rgb)/0.3)]" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[150%] font-mono text-[11.5px] text-[var(--ld-muted-3)] uppercase">
                  No recordings yet
                </span>
              </div>
            )}
          </div>
          {has ? (
            <div aria-hidden="true" className="mt-3 flex flex-wrap justify-between gap-2.5 font-mono text-[11.5px] text-[var(--ld-muted-3)] uppercase sm:pl-[62px]">
              <span className="flex flex-wrap gap-4">
                {(["client", "mentee", "reader"] as const).map((kind) => (
                  <span key={kind} className="inline-flex items-center gap-1.5">
                    <span className={cn("size-2 rounded-[2px]", KIND_FILL[kind])} />
                    {kindTag(kind)}s
                  </span>
                ))}
              </span>
              <span>One clip per review · longer clip, more to say</span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export { CaptionReel };
