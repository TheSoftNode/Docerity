import {
  CrownIcon,
  FlameIcon,
  FootprintsIcon,
  GraduationCapIcon,
  HammerIcon,
  MedalIcon,
  RocketIcon,
  ShieldIcon,
  StarIcon,
  SwordsIcon,
  TargetIcon,
  TrophyIcon,
  type LucideIcon,
} from "lucide-react";

import type { Achievement, AchievementIcon } from "@/lib/academy/achievements";
import { cn } from "@/lib/utils";

const ICONS: Record<AchievementIcon, LucideIcon> = {
  footprints: FootprintsIcon,
  flame: FlameIcon,
  shield: ShieldIcon,
  target: TargetIcon,
  graduation: GraduationCapIcon,
  rocket: RocketIcon,
  hammer: HammerIcon,
  swords: SwordsIcon,
  medal: MedalIcon,
  trophy: TrophyIcon,
  star: StarIcon,
  crown: CrownIcon,
};

/**
 * A student's achievements: earned ones in colour, the rest quiet with how
 * far along they are. On a phone it's a swipe row so it never pushes the
 * page around; from tablet up, a grid.
 */
export function Achievements({ items }: { items: Achievement[] }) {
  const earned = items.filter((item) => item.earned).length;
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="achievements-title" className="ld-display text-[clamp(28px,3.4vw,40px)] leading-none font-extrabold tracking-[-0.04em]">
          Your achievements
        </h2>
        <p className="text-[15px] font-semibold text-[var(--ld-text-2)]">
          {earned} of {items.length} earned
        </p>
      </div>
      <ul className="-mx-5 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6 [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          return (
            <li
              key={item.id}
              data-earned={item.earned}
              className={cn(
                "flex w-[44%] max-w-[180px] shrink-0 snap-start flex-col rounded-[20px] border p-4 sm:w-auto sm:max-w-none",
                item.earned ? "border-transparent bg-[var(--ld-deep)] text-white" : "border-[var(--ld-line)] bg-[var(--ld-card)]"
              )}
            >
              <span className={cn("grid size-10 place-items-center rounded-[12px]", item.earned ? "bg-[var(--ld-accent)] text-[#08102e]" : "bg-[var(--ld-paper-2)] text-[var(--ld-text-muted)]")}>
                <Icon className="size-5" />
              </span>
              <span className="mt-3 text-[15px] leading-tight font-bold">{item.title}</span>
              <span className={cn("mt-1 text-[13px] leading-snug", item.earned ? "text-[#c9d5ff]" : "text-[var(--ld-text-muted)]")}>{item.how}</span>
              {!item.earned && item.target > 1 ? (
                <span className="mt-auto pt-3">
                  <span className="block h-1.5 overflow-hidden rounded-full bg-[var(--ld-paper-2)]">
                    <span className="block h-full rounded-full bg-[var(--ld-deep)]" style={{ width: `${Math.round((item.value / item.target) * 100)}%` }} />
                  </span>
                  <span className="mt-1 block text-[12px] font-semibold text-[var(--ld-text-2)]">
                    {item.value}/{item.target}
                  </span>
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
