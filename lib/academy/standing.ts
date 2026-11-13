import "server-only";

import { database } from "@/lib/config/env";
import { dayKey, levelFor, liveStreak } from "@/lib/academy/rules";
import { NO_FACTS, achievementsFor, type Achievement } from "@/lib/academy/achievements";
import { findLearner, totalXp, xpCounts } from "@/lib/repositories/academy.repository";

export type Standing = {
  xp: number;
  weekXp: number;
  level: number;
  intoLevel: number;
  levelSize: number;
  toNext: number;
  streak: number;
  bestStreak: number;
  /** Whether something has already been done today (the streak is safe). */
  doneToday: boolean;
};

export const EMPTY_STANDING: Standing = {
  xp: 0,
  weekXp: 0,
  level: 1,
  intoLevel: 0,
  levelSize: 100,
  toNext: 100,
  streak: 0,
  bestStreak: 0,
  doneToday: false,
};

/** A student's XP, level and streak as they stand right now. */
export async function getStanding(accountId: string): Promise<Standing> {
  if (!database.isConfigured) return EMPTY_STANDING;
  try {
    const [xp, learner] = await Promise.all([totalXp(accountId), findLearner(accountId)]);
    const level = levelFor(xp.total);
    const today = dayKey();
    const streak = liveStreak({ count: learner?.streak ?? 0, lastDay: learner?.lastDay ?? "", freezeWeek: learner?.freezeWeek ?? "" }, today);
    return {
      xp: xp.total,
      weekXp: xp.week,
      level: level.level,
      intoLevel: level.intoLevel,
      levelSize: level.levelSize,
      toNext: level.toNext,
      streak,
      bestStreak: learner?.bestStreak ?? 0,
      doneToday: learner?.lastDay === today,
    };
  } catch {
    return EMPTY_STANDING;
  }
}

/** A student's achievements, worked out from their XP ledger and streak. */
export async function getAchievements(accountId: string, standing: Standing): Promise<Achievement[]> {
  if (!database.isConfigured) return achievementsFor(NO_FACTS);
  try {
    const counts = await xpCounts(accountId);
    const n = (kind: string) => counts[kind] ?? 0;
    return achievementsFor({
      lessons: n("lesson"),
      perfectQuizzes: n("quiz-perfect"),
      courses: n("course"),
      builds: n("build"),
      battles: n("battle-entry"),
      podiums: n("battle-podium") + n("battle-win"),
      wins: n("battle-win"),
      bestStreak: Math.max(standing.bestStreak, standing.streak),
      level: standing.level,
    });
  } catch {
    return achievementsFor(NO_FACTS);
  }
}
