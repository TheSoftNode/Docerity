import type { Course, Lesson, Module, QuizAnswers, QuizResult } from "@/lib/academy/types";

/**
 * The Academy's rules, kept pure so they can be tested without a database:
 * how a quiz is marked, what each action is worth, how levels and streaks
 * work, and which lessons are open.
 */

/** A quiz is passed at 70%. */
export const PASS_MARK = 70;

/** XP for each kind of action. Each is earned once per thing (see the XP ledger). */
export const XP = {
  lesson: 10,
  quizPass: 20,
  quizPerfect: 10,
  courseComplete: 150,
} as const;

export type XpKind = "lesson" | "quiz-pass" | "quiz-perfect" | "course" | "build" | "battle-entry" | "battle-podium" | "battle-win";

/* ── Quizzes ─────────────────────────────────────────────────────────────── */

const sameSet = (a: number[], b: number[]) => a.length === b.length && [...a].sort().every((value, index) => value === [...b].sort()[index]);

/**
 * Marks a quiz on the server. A question is right only when exactly the right
 * options were chosen; the score is the share of questions right, rounded.
 */
export function markQuiz(lesson: Lesson, answers: QuizAnswers): QuizResult {
  const questions = lesson.questions;
  const review = questions.map((question) => {
    const chosen = Array.isArray(answers[question.id]) ? answers[question.id].filter((value) => Number.isInteger(value)) : [];
    return { id: question.id, correct: sameSet(chosen, question.answer), answer: question.answer, explain: question.explain };
  });
  const right = review.filter((item) => item.correct).length;
  const score = questions.length ? Math.round((right / questions.length) * 100) : 0;
  return { score, passed: score >= PASS_MARK, perfect: questions.length > 0 && right === questions.length, review };
}

/* ── Levels ──────────────────────────────────────────────────────────────── */

/**
 * Level n starts at 50·n·(n−1) XP: 0, 100, 300, 600, 1000, … so early levels
 * come quickly (a first evening's work) and later ones take a real course.
 */
export function levelFor(xp: number) {
  const safe = Math.max(0, Math.floor(xp));
  let level = 1;
  while (50 * (level + 1) * level <= safe) level += 1;
  const floor = 50 * level * (level - 1);
  const ceiling = 50 * (level + 1) * level;
  return { level, xp: safe, intoLevel: safe - floor, levelSize: ceiling - floor, toNext: ceiling - safe };
}

/* ── Streaks ─────────────────────────────────────────────────────────────── */

/** The calendar day an action counts for, in West Africa Time (UTC+1), as YYYY-MM-DD. */
export function dayKey(at: Date = new Date()): string {
  return new Date(at.getTime() + 60 * 60 * 1000).toISOString().slice(0, 10);
}

const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

/**
 * The streak after an action today. Same day: unchanged. Next day: +1. One day
 * missed: kept, if the weekly freeze is unused (and it is then used).
 * Longer: starts again at 1.
 */
export function nextStreak(
  current: { count: number; lastDay: string; freezeWeek: string },
  today: string
): { count: number; lastDay: string; freezeWeek: string } {
  if (!current.lastDay) return { count: 1, lastDay: today, freezeWeek: current.freezeWeek };
  const gap = daysBetween(current.lastDay, today);
  if (gap <= 0) return current;
  if (gap === 1) return { ...current, count: current.count + 1, lastDay: today };
  const week = weekKey(today);
  if (gap === 2 && current.freezeWeek !== week) return { count: current.count + 1, lastDay: today, freezeWeek: week };
  return { count: 1, lastDay: today, freezeWeek: current.freezeWeek };
}

/** The streak as it stands today: one that has lapsed reads as 0 until the next action. */
export function liveStreak(current: { count: number; lastDay: string; freezeWeek: string }, today: string): number {
  if (!current.lastDay) return 0;
  const gap = daysBetween(current.lastDay, today);
  if (gap <= 1) return current.count;
  if (gap === 2 && current.freezeWeek !== weekKey(today)) return current.count;
  return 0;
}

/** The Monday a day's week starts on, as YYYY-MM-DD: the weekly leaderboard and the streak freeze reset then. */
export function weekKey(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);
  const back = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - back);
  return date.toISOString().slice(0, 10);
}

/* ── Course shape ────────────────────────────────────────────────────────── */

export const allLessons = (course: Course): Lesson[] => course.modules.flatMap((module) => module.lessons);

export function findLesson(course: Course, lessonId: string): { lesson: Lesson; module: Module; index: number } | null {
  const lessons = allLessons(course);
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  if (index < 0) return null;
  const module = course.modules.find((item) => item.lessons.some((lesson) => lesson.id === lessonId))!;
  return { lesson: lessons[index], module, index };
}

export type Progress = { completed: string[]; passed: string[] };

/**
 * A module opens once every quiz in the modules before it is passed, so the
 * course is taken in order; lessons inside an open module can be taken in any
 * order. The first module is always open.
 */
export function openModules(course: Course, progress: Progress): Set<string> {
  const open = new Set<string>();
  let gate = true;
  for (const module of course.modules) {
    if (!gate) break;
    open.add(module.id);
    gate = module.lessons.filter((lesson) => lesson.kind === "quiz").every((lesson) => progress.passed.includes(lesson.id));
  }
  return open;
}

/** Done = every lesson completed (a quiz completes when passed). */
export function courseProgress(course: Course, progress: Progress) {
  const lessons = allLessons(course);
  const done = lessons.filter((lesson) => progress.completed.includes(lesson.id)).length;
  return { done, total: lessons.length, percent: lessons.length ? Math.round((done / lessons.length) * 100) : 0 };
}

/** The lesson to continue from: the first not yet done in an open module. */
export function nextLesson(course: Course, progress: Progress): Lesson | null {
  const open = openModules(course, progress);
  for (const module of course.modules) {
    if (!open.has(module.id)) break;
    const lesson = module.lessons.find((item) => !progress.completed.includes(item.id));
    if (lesson) return lesson;
  }
  return null;
}

export const courseMinutes = (course: Course) => allLessons(course).reduce((sum, lesson) => sum + (lesson.minutes || 0), 0);

/** Pulls the video id out of whatever YouTube link was pasted (watch, youtu.be, shorts, embed), or returns "". */
export function youtubeIdFrom(input: string): string {
  const value = input.trim();
  if (/^[\w-]{11}$/.test(value)) return value;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return /^[\w-]{11}$/.test(url.pathname.slice(1)) ? url.pathname.slice(1) : "";
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const v = url.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/);
      return match ? match[1] : "";
    }
  } catch {
    return "";
  }
  return "";
}
