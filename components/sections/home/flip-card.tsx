"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCwIcon } from "lucide-react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { PairView } from "@/lib/content/blocks/views";

/** How long each face stays up before the card turns on its own. */
const FACE_MS = 4500;

/**
 * A card with a concept on the front and its analogy on the back.
 *
 * It turns on its own, and after showing a pair's analogy it moves to the next
 * pair as it turns back, so the whole set plays as concept, analogy, concept,
 * analogy. The button turns it by hand. Under reduced motion it never turns on
 * its own and the turn is instant.
 *
 * It holds still while it is hovered or has focus inside it, which is the
 * pause WCAG 2.2.2 asks of anything that moves on its own for longer than five
 * seconds. Only the face that is showing is exposed to assistive technology,
 * and nothing is announced on the automatic turns, which would otherwise
 * interrupt a screen reader every few seconds.
 */
function FlipCard({ pairs }: { pairs: PairView[] }) {
  const reduceMotion = useReducedMotion() ?? false;
  /* One counter for both: even shows a front, odd a back, and every two steps
     is the next pair. Keeping them together means a hand turn and an
     automatic one can never disagree about which pair is up. */
  const [step, setStep] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    if (reduceMotion || pairs.length === 0) return;
    const timer = window.setInterval(() => {
      if (!paused.current && document.visibilityState === "visible") setStep((value) => value + 1);
    }, FACE_MS);
    return () => window.clearInterval(timer);
  }, [reduceMotion, pairs.length]);

  if (pairs.length === 0) return null;

  const flipped = step % 2 === 1;
  const pair = pairs[Math.floor(step / 2) % pairs.length];
  const position = (Math.floor(step / 2) % pairs.length) + 1;

  return (
    <div
      className="flex-[1_1_400px]"
      onPointerEnter={() => {
        paused.current = true;
      }}
      onPointerLeave={() => {
        paused.current = false;
      }}
      onFocus={() => {
        paused.current = true;
      }}
      onBlur={() => {
        paused.current = false;
      }}
    >
      <div className="h-[clamp(360px,40vw,460px)] [perspective:1400px]">
        <div
          className={cn(
            "relative h-full w-full [transform-style:preserve-3d]",
            !reduceMotion && "transition-transform duration-1000 ease-[cubic-bezier(.7,0,.2,1)]"
          )}
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          <div
            aria-hidden={flipped}
            className="absolute inset-0 flex flex-col justify-between rounded-[32px] bg-[var(--ld-ink)] p-[clamp(24px,3.5vw,40px)] text-[var(--ld-paper)] shadow-[0_40px_80px_-40px_rgb(var(--ld-ink-rgb)/0.6)] [backface-visibility:hidden]"
          >
            <p className="flex justify-between font-mono text-xs text-[var(--ld-tint)] uppercase">
              <span>The concept</span>
              <span>
                {String(position).padStart(2, "0")} / {String(pairs.length).padStart(2, "0")}
              </span>
            </p>
            <div>
              <p className="ld-display text-[clamp(48px,6.5vw,92px)] leading-[0.9] font-extrabold tracking-[-0.05em]">
                {pair.conceptLabel}
              </p>
              <p className="mt-4 text-lg text-[var(--ld-muted)]">{pair.conceptCaption}</p>
            </div>
          </div>

          <div
            aria-hidden={!flipped}
            className="absolute inset-0 flex flex-col justify-between rounded-[32px] bg-[var(--ld-accent)] p-[clamp(24px,3.5vw,40px)] text-[var(--ld-ink)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
          >
            <p className="flex justify-between font-mono text-xs uppercase">
              <span>Like this</span>
              <span>≈</span>
            </p>
            <div>
              <p className="ld-display text-[clamp(32px,4.4vw,60px)] leading-[0.95] font-extrabold tracking-[-0.04em]">
                {pair.analogyLabel}
              </p>
              <p className="mt-3.5 text-[17px]">{pair.analogyCaption}</p>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setStep((value) => value + 1)}
        className="mt-5 inline-flex min-h-12 items-center gap-2.5 rounded-full border-[1.5px] border-[var(--ld-ink)] px-5.5 font-semibold transition-transform hover:-translate-y-0.5"
      >
        <RotateCwIcon className="size-4" />
        {flipped ? "Next concept" : "Flip the card"}
      </button>
    </div>
  );
}

export { FlipCard };
