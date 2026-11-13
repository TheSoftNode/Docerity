"use client";

import { RocketIcon, StarIcon, ZapIcon } from "lucide-react";

import type { Earned } from "@/lib/academy/types";

/**
 * What a student just earned, said where they are looking: the XP, a new
 * level, or the whole course finished. Announced to screen readers too.
 */
export function EarnedNote({ earned }: { earned: Earned }) {
  if (!earned.xp && !earned.levelUp && !earned.courseDone) return null;
  return (
    <div role="status" className="ld-pop mt-4 flex flex-wrap items-center gap-2.5">
      {earned.xp > 0 ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ld-accent)] px-3.5 py-1.5 text-sm font-bold text-[#08102e]">
          <ZapIcon className="size-4" /> +{earned.xp} XP
        </span>
      ) : null}
      {earned.levelUp ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1c3a8c] px-3.5 py-1.5 text-sm font-bold text-[#f4f5fa]">
          <StarIcon className="size-4" /> Level {earned.levelUp}
        </span>
      ) : null}
      {earned.courseDone ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#08102e] px-3.5 py-1.5 text-sm font-bold text-[#f4f5fa]">
          <RocketIcon className="size-4" /> Course complete
        </span>
      ) : null}
    </div>
  );
}
