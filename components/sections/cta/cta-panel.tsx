"use client";

import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * The CTA's framed panel, with a highlight that follows the cursor across it.
 *
 * The pointer position is written to CSS custom properties rather than React
 * state — this fires on every mouse move, and re-rendering the whole panel at
 * that rate would be wasteful. The highlight only fades in on hover, and is
 * skipped entirely under reduced motion and on touch (`pointerType`).
 */
function CtaPanel({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    ref.current.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  }

  return (
    <div className="rounded-3xl bg-[linear-gradient(to_bottom_right,color-mix(in_oklch,var(--brand-primary),transparent_45%),var(--border)_38%,color-mix(in_oklch,var(--brand-violet),transparent_50%))] p-px shadow-[0_40px_90px_-50px_color-mix(in_oklch,var(--brand-primary),transparent_40%)]">
      <div
        ref={ref}
        onPointerMove={handlePointerMove}
        className="group/panel relative overflow-hidden rounded-[calc(1.5rem-1px)] bg-card/85 backdrop-blur-xl"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/panel:opacity-100"
          style={{
            background:
              "radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 0%), color-mix(in oklch, var(--brand-primary), transparent 82%), transparent 70%)",
          }}
        />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}

export { CtaPanel };
