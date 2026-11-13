"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentAccount } from "@/lib/account/session";
import { getCourse } from "@/lib/academy/courses";
import { XP, allLessons, findLesson, markQuiz, nextLesson, openModules } from "@/lib/academy/rules";
import type { Earned, QuizAnswers, QuizResult } from "@/lib/academy/types";
import {
  awardXp,
  enrol,
  findEnrollment,
  findSubmission,
  markCompleted,
  recordQuiz,
  recordSubmissionGrade,
  recordWatched,
  saveSubmission,
  totalXp,
} from "@/lib/repositories/academy.repository";
import { safeHttps } from "@/lib/account/rules";
import { githubRepo } from "@/lib/academy/briefs";
import { MAX_AI_ATTEMPTS, type Grade } from "@/lib/academy/assignments";
import { markWithAi } from "@/lib/academy/ai-marker";
import { completeAssignment } from "@/lib/academy/progress";
import { afterProgress } from "@/lib/academy/progress";
import { createLogger } from "@/lib/core/logger";


/**
 * What a student does in the Academy. Every action checks, on the server,
 * that they are signed in, confirmed, enrolled, and that the lesson is open:
 * a Server Action is a POST anybody can send.
 */

const logger = createLogger("academy");

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
    if (ctx.found.lesson.kind === "assignment") return { ok: false, message: "An assignment completes when it passes." };
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

export type HandInState = {
  ok?: boolean;
  message?: string;
  /** "graded": marked now; "waiting": a person will mark it. */
  outcome?: "graded" | "waiting";
  grade?: Grade;
  earned?: Earned;
  errors?: { answer?: string; repoUrl?: string; liveUrl?: string };
  values?: { answer: string; repoUrl: string; liveUrl: string };
};

/**
 * Hands in an assignment. With AI marking on, it's marked straight away:
 * a pass completes the lesson and earns its XP. When the AI is unsure,
 * unavailable, or the student has used their AI attempts, it waits for a
 * person instead.
 */
export async function submitAssignmentAction(_previous: HandInState, formData: FormData): Promise<HandInState> {
  const slug = String(formData.get("slug") ?? "");
  const lessonId = String(formData.get("lessonId") ?? "");
  const values = {
    answer: String(formData.get("answer") ?? "").trim().slice(0, 20000),
    repoUrl: String(formData.get("repoUrl") ?? "").trim().slice(0, 300),
    liveUrl: String(formData.get("liveUrl") ?? "").trim().slice(0, 500),
  };
  try {
    const ctx = await context(slug, lessonId);
    if ("error" in ctx) return { message: ctx.error ?? "Something went wrong.", values };
    const lesson = ctx.found.lesson;
    if (lesson.kind !== "assignment") return { message: "That lesson has no assignment.", values };

    const previous = await findSubmission(ctx.account.id, slug, lessonId);
    // A hand-in that's waiting for a person can still be replaced; it goes back in the queue.
    if (previous?.passed) return { message: "This assignment already passed.", values };

    const errors: HandInState["errors"] = {};
    const work = { answer: values.answer, repoUrl: "", liveUrl: "" };
    if (lesson.handIn === "link") {
      work.repoUrl = githubRepo(values.repoUrl);
      work.liveUrl = values.liveUrl ? safeHttps(values.liveUrl) : "";
      if (!work.repoUrl) errors.repoUrl = "A public GitHub repository, like https://github.com/you/project.";
      if (values.liveUrl && !work.liveUrl) errors.liveUrl = "The live site's address, starting with https://.";
      if (values.answer.length < 20) errors.answer = "Say in a few sentences what you built and how.";
    } else if (values.answer.length < 20) {
      errors.answer = "Write your answer (or paste your code) here first.";
    }
    if (errors.answer || errors.repoUrl || errors.liveUrl) return { errors, values };

    const saved = await saveSubmission(ctx.account.id, slug, lessonId, work);
    if (!saved) return { message: "That didn't save. Try again in a moment.", values };

    const mark = saved.attempts <= MAX_AI_ATTEMPTS ? await markWithAi(lesson, work) : null;
    if (!mark) {
      revalidatePath(`/academy/${slug}/${lessonId}`);
      return { ok: true, outcome: "waiting", message: "Handed in. Your teacher will mark it and you'll see the grade here.", values };
    }

    const { grade, needsHuman } = mark;
    if (needsHuman) {
      await recordSubmissionGrade(String(saved._id), { ...grade, gradedBy: "ai", checked: false, status: "waiting", aiNote: `AI suggested ${grade.score}% and asked for a teacher to check.` });
      revalidatePath(`/academy/${slug}/${lessonId}`);
      return { ok: true, outcome: "waiting", message: "Handed in. A teacher will check this one and you'll see the grade here.", values };
    }

    await recordSubmissionGrade(String(saved._id), { ...grade, gradedBy: "ai", checked: false, status: "graded" });
    const earned = grade.passed ? await completeAssignment(ctx.account.id, slug, lessonId) : undefined;
    revalidatePath(`/academy/${slug}`);
    return {
      ok: true,
      outcome: "graded",
      grade,
      earned,
      message: grade.passed ? "Passed. Well done." : "Not quite there yet. Read the feedback, improve it, and hand it in again.",
      values,
    };
  } catch (error) {
    logger.error("assignment hand-in failed", error);
    return { message: "That didn't send. Try again in a moment.", values };
  }
}
