"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Tone = "dark" | "light";
const KEY = "docerity-hero-preview";

/**
 * A switch for trying the hero on paper before deciding on it.
 *
 * Visitors never see it: it only appears after opening the homepage with
 * `?hero=light` (or `?hero=dark`), and is remembered in this browser until
 * "Close" is pressed. It sets `data-hero` on the page, and home.css
 * does the rest.
 */
function HeroTonePreview() {
  const [tone, setTone] = useState<Tone | null>(null);

  useEffect(() => {
    let next: Tone | null = null;
    const asked = new URLSearchParams(window.location.search).get("hero");
    if (asked === "light" || asked === "dark") next = asked;
    else {
      try {
        const saved = window.localStorage.getItem(KEY);
        if (saved === "light" || saved === "dark") next = saved;
      } catch {}
    }
    if (next) setTone(next);
  }, []);

  useEffect(() => {
    if (tone) document.documentElement.dataset.hero = tone;
    else delete document.documentElement.dataset.hero;
    try {
      if (tone) window.localStorage.setItem(KEY, tone);
      else window.localStorage.removeItem(KEY);
    } catch {}
  }, [tone]);

  if (!tone) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full bg-[var(--ld-ink)] p-1 text-sm font-semibold text-[var(--ld-paper)] shadow-[0_20px_40px_-20px_rgb(0_0_0/0.6)] ring-1 ring-[rgb(var(--ld-paper-rgb)/0.15)]">
      {(["dark", "light"] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={tone === option}
          onClick={() => setTone(option)}
          className={cn(
            "min-h-10 rounded-full px-3.5 whitespace-nowrap capitalize transition-colors sm:px-4",
            tone === option ? "bg-[var(--ld-accent)] text-[var(--ld-ink)]" : "hover:bg-[rgb(var(--ld-paper-rgb)/0.1)]"
          )}
        >
          {option}
        </button>
      ))}
      <button
        type="button"
        onClick={() => setTone(null)}
        className="min-h-10 rounded-full px-3 whitespace-nowrap text-[var(--ld-muted-3)] hover:text-[var(--ld-paper)]"
      >
        Close
      </button>
    </div>
  );
}

export { HeroTonePreview };
