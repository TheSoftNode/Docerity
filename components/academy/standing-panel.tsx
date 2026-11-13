import type { Standing } from "@/lib/academy/standing";
import { cn } from "@/lib/utils";

/** A small flame, drawn here so it matches the type around it. Lit when the streak is alive. */
export function StreakFlame({ lit, className }: { lit: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("size-5", className)}>
      <path
        d="M12 2.5c.6 3-1.2 4.6-2.7 6.2C7.6 10.5 6 12.3 6 15a6 6 0 0 0 12 0c0-2.2-1-4-2.3-5.3-.2 1.4-.9 2.4-2 2.9.4-3.4-.6-7.2-1.7-10.1Z"
        fill={lit ? "var(--ld-accent)" : "none"}
        stroke={lit ? "var(--ld-accent)" : "currentColor"}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Where a student stands: their level and how far into it, total XP, this
 * week's XP and the streak. Dark by design, so it reads the same on a light
 * or dark page.
 */
export function StandingPanel({ standing, className }: { standing: Standing; className?: string }) {
  const share = Math.min(100, Math.round((standing.intoLevel / Math.max(1, standing.levelSize)) * 100));
  return (
    <div className={cn("ld-keep-dark rounded-[24px] bg-[#0b1433] p-6 text-[#f4f5fa]", className)}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] text-[#9aa7cf]">Level</p>
          <p className="ld-display text-[44px] leading-none font-extrabold tracking-[-0.04em]">{standing.level}</p>
        </div>
        <div className="text-right">
          <p className="text-[13px] text-[#9aa7cf]">Streak</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-[22px] font-bold">
            <StreakFlame lit={standing.streak > 0} />
            {standing.streak} {standing.streak === 1 ? "day" : "days"}
          </p>
        </div>
      </div>
      <div className="mt-5">
        <div className="h-2.5 overflow-hidden rounded-full bg-[rgb(175_196_255/0.14)]" role="progressbar" aria-valuenow={share} aria-valuemin={0} aria-valuemax={100} aria-label={`Level ${standing.level} progress`}>
          <div className="h-full rounded-full bg-[linear-gradient(90deg,#afc4ff,#ff7a59)] transition-[width] duration-700" style={{ width: `${share}%` }} />
        </div>
        <p className="mt-2 text-[13px] text-[#c4cbe3]">
          {standing.toNext} XP to level {standing.level + 1}
        </p>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-[rgb(175_196_255/0.14)] pt-4">
        <div>
          <dt className="text-[13px] text-[#9aa7cf]">Total XP</dt>
          <dd className="text-[20px] font-bold">{standing.xp.toLocaleString()}</dd>
        </div>
        <div>
          <dt className="text-[13px] text-[#9aa7cf]">This week</dt>
          <dd className="text-[20px] font-bold">{standing.weekXp.toLocaleString()}</dd>
        </div>
      </dl>
      {standing.streak > 0 && !standing.doneToday ? (
        <p className="mt-4 rounded-2xl bg-[#ff7a59]/[0.14] px-4 py-3 text-[14px] text-[#ffd2c4]">Do one lesson today to keep your streak.</p>
      ) : null}
    </div>
  );
}
