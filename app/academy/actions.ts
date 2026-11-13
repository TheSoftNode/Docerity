"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentAccount } from "@/lib/account/session";
import { getCourse } from "@/lib/academy/courses";
import { XP, allLessons, courseProgress, findLesson, levelFor, markQuiz, nextLesson, openModules } from "@/lib/academy/rules";
import type { QuizAnswers, QuizResult } from "@/lib/academy/types";
import {
  awardXp,
  enrol,
  findEnrollment,
  markCompleted,
  markCourseComplete,
  recordQuiz,
  recordWatched,
  totalXp,
} from "@/lib/repositories/academy.repository";
import { createLogger } from "@/lib/core/logger";

/**
 * What a student does in the Academy. Every action checks, on the server,
 * that they are signed in, confirmed, enrolled, and that the lesson is open:
 * a Server Action is a POST anybody can send.
 */

const logger = createLogger("academy");

export type Earned = { xp: number; levelUp: number | null; courseDone: boolean };
export type LessonResult = { ok: true; earned: Earned } | { ok: false; message: string };
export type QuizOutcome = { ok: true; result: QuizResult; earned: Earned } | { ok: false; message: string };

async function context(slug: string, lessonId: string) {
  const account = await getCurrentAccount();
  if (!account) return { error: "Sign in to keep your progress." } as const;
  if (!account.verified) return { error: "Confirm your email first; the link is in your inbox." } as const;
  const course = await getCourse(slug);
  if (!course) return { error: "That course isn't available." } as const;
  const found = findLesson(course, lessonId);
  if (!found) return { error: "That lesson isn't in this course." } as const;
  const enrollment = await findEnrollment(account.id, slug);
  if (!enrollment) return { error: "Enrol in the course first." } as const;
  const open = openModules(course, { completed: enrollment.completed, passed: enrollment.passed });
  if (!open.has(found.module.id)) return { error: "Pass the quiz before this module to open it." } as const;
  return { account, course, found, enrollment } as const;
}

/** XP for finishing the course, once, when the last lesson lands. */
async function afterProgress(accountId: string, slug: string, before: number): Promise<Earned> {
  const course = await getCourse(slug);
  const enrollment = await findEnrollment(accountId, slug);
  let courseDone = false;
  let bonus = 0;
  if (course && enrollment) {
    const progress = courseProgress(course, { completed: enrollment.completed, passed: enrollment.passed });
    if (progress.total > 0 && progress.done === progress.total) {
      await markCourseComplete(accountId, slug);
      bonus = await awardXp(accountId, "course", slug, XP.courseComplete);
      courseDone = bonus > 0;
    }
  }
  const after = (await totalXp(accountId)).total;
  const levelBefore = levelFor(before).level;
  const levelAfter = levelFor(after).level;
  return { xp: after - before, levelUp: levelAfter > levelBefore ? levelAfter : null, courseDone };
}

export async function enrolAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  const account = await getCurrentAccount();
  if (!account) redirect(`/account/login?next=${encodeURIComponent(`/academy/${slug}`)}`);
  if (!account.verified) redirect("/account");
  const course = await getCourse(slug);
  if (!course) redirect("/academy");
  await enrol(account.id, slug);
  const enrollment = await findEnrollment(account.id, slug);
  const next = nextLesson(course, { completed: enrollment?.completed ?? [], passed: enrollment?.passed ?? [] }) ?? allLessons(course)[0];
  revalidatePath(`/academy/${slug}`);
  redirect(`/academy/${slug}/${next.id}`);
}

export async function completeLessonAction(slug: string, lessonId: string): Promise<LessonResult> {
  try {
    const ctx = await context(slug, lessonId);
    if ("error" in ctx) return { ok: false, message: ctx.error ?? "Something went wrong." };
    if (ctx.found.lesson.kind === "quiz") return { ok: false, message: "A quiz completes when you pass it." };
    const before = (await totalXp(ctx.account.id)).total;
    await markCompleted(ctx.account.id, slug, lessonId);
    await awardXp(ctx.account.id, "lesson", `${slug}/${lessonId}`, XP.lesson);
    const earned = await afterProgress(ctx.account.id, slug, before);
    revalidatePath(`/academy/${slug}`);
    return { ok: true, earned };
  } catch (error) {
    logger.error("complete lesson failed", error);
    return { ok: false, message: "That didn't save. Try again in a moment." };
  }
}

/** Called every few seconds while a video plays; keeps the furthest point. */
export async function watchAction(slug: string, lessonId: string, seconds: number): Promise<void> {
  if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 6 * 60 * 60) return;
  try {
    const ctx = await context(slug, lessonId);
    if ("error" in ctx) return;
    await recordWatched(ctx.account.id, slug, lessonId, seconds);
  } catch (error) {
    logger.warn("watch progress failed", { error: String(error) });
  }
}

export async function submitQuizAction(slug: string, lessonId: string, answers: QuizAnswers): Promise<QuizOutcome> {
  try {
    const ctx = await context(slug, lessonId);
    if ("error" in ctx) return { ok: false, message: ctx.error ?? "Something went wrong." };
    if (ctx.found.lesson.kind !== "quiz") return { ok: false, message: "That lesson has no quiz." };
    const clean: QuizAnswers = {};
    for (const [key, value] of Object.entries(answers ?? {})) {
      if (typeof key === "string" && Array.isArray(value)) clean[key.slice(0, 80)] = value.slice(0, 10).map(Number);
    }
    const result = markQuiz(ctx.found.lesson, clean);
    const before = (await totalXp(ctx.account.id)).total;
    await recordQuiz(ctx.account.id, slug, lessonId, result.score, result.passed);
    if (result.passed) await awardXp(ctx.account.id, "quiz-pass", `${slug}/${lessonId}`, XP.quizPass);
    if (result.perfect) await awardXp(ctx.account.id, "quiz-perfect", `${slug}/${lessonId}`, XP.quizPerfect);
    const earned = await afterProgress(ctx.account.id, slug, before);
    revalidatePath(`/academy/${slug}`);
    return { ok: true, result, earned };
  } catch (error) {
    logger.error("quiz submit failed", error);
    return { ok: false, message: "We couldn't mark that. Try again in a moment." };
  }
}
