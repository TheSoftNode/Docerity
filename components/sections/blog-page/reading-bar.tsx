"use client";

import { useEffect, useState } from "react";

/**
 * How far through the page the reader is, as a thin bar along the top of the
 * window with a point of the accent at its head. Decoration: hidden from
 * assistive technology, and it moves only as the reader scrolls.
 */
function ReadingBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-50 h-[3px] bg-[rgb(var(--ld-ink-rgb)/0.08)]">
      <div
        className="h-full origin-left bg-[linear-gradient(90deg,var(--ld-deep),var(--ld-ink))]"
        style={{ transform: `scaleX(${progress})` }}
      />
      <span
        className="absolute -top-0.5 size-[7px] -translate-x-1/2 rounded-full bg-[var(--ld-accent)]"
        style={{ left: `${progress * 100}%`, opacity: progress > 0.002 ? 1 : 0 }}
      />
    </div>
  );
}

export { ReadingBar };
