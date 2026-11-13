/**
 * Achievements: milestones worked out from what a student has already done
 * (their XP ledger, their best streak and their level), so nothing extra is
 * stored and old progress counts the moment a new achievement is added.
 */

export type AchievementFacts = {
  lessons: number;
  perfectQuizzes: number;
  courses: number;
  builds: number;
  battles: number;
  podiums: number;
  wins: number;
  bestStreak: number;
  level: number;
};

export const NO_FACTS: AchievementFacts = { lessons: 0, perfectQuizzes: 0, courses: 0, builds: 0, battles: 0, podiums: 0, wins: 0, bestStreak: 0, level: 1 };

export type AchievementIcon = "footprints" | "flame" | "shield" | "target" | "graduation" | "rocket" | "hammer" | "swords" | "medal" | "trophy" | "star" | "crown";

export type Achievement = {
  id: string;
  title: string;
  /** How to earn it, in a few words. */
  how: string;
  icon: AchievementIcon;
  value: number;
  target: number;
  earned: boolean;
};

const LIST: { id: string; title: string; how: string; icon: AchievementIcon; target: number; of: (facts: AchievementFacts) => number }[] = [
  { id: "first-step", title: "First step", how: "Finish your first lesson", icon: "footprints", target: 1, of: (f) => f.lessons },
  { id: "on-a-roll", title: "On a roll", how: "Reach a 7-day streak", icon: "flame", target: 7, of: (f) => f.bestStreak },
  { id: "sharp", title: "Sharp", how: "Score 100% on 3 quizzes", icon: "target", target: 3, of: (f) => f.perfectQuizzes },
  { id: "level-5", title: "Level 5", how: "Reach level 5", icon: "star", target: 5, of: (f) => f.level },
  { id: "graduate", title: "Graduate", how: "Finish a course", icon: "graduation", target: 1, of: (f) => f.courses },
  { id: "shipped", title: "Shipped it", how: "Get a build approved", icon: "rocket", target: 1, of: (f) => f.builds },
  { id: "contender", title: "Contender", how: "Enter a build battle", icon: "swords", target: 1, of: (f) => f.battles },
  { id: "podium", title: "On the podium", how: "Place top three in a battle", icon: "medal", target: 1, of: (f) => f.podiums },
  { id: "unbreakable", title: "Unbreakable", how: "Reach a 30-day streak", icon: "shield", target: 30, of: (f) => f.bestStreak },
  { id: "builder", title: "Builder", how: "Get 5 builds approved", icon: "hammer", target: 5, of: (f) => f.builds },
  { id: "champion", title: "Champion", how: "Win a build battle", icon: "trophy", target: 1, of: (f) => f.wins },
  { id: "level-10", title: "Level 10", how: "Reach level 10", icon: "crown", target: 10, of: (f) => f.level },
];

/** Every achievement with where the student stands on it, in the order they tend to come. */
export function achievementsFor(facts: AchievementFacts): Achievement[] {
  return LIST.map(({ of, ...item }) => {
    const value = Math.max(0, of(facts));
    return { ...item, value: Math.min(value, item.target), earned: value >= item.target };
  });
}
