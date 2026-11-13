import "server-only";

import { getCourse } from "@/lib/academy/courses";
import { XP, courseProgress, levelFor } from "@/lib/academy/rules";
import { awardXp, findEnrollment, markCompleted, markCourseComplete, totalXp } from "@/lib/repositories/academy.repository";

/**
 * Progress steps shared by the student's actions and the admin's grading.
 * Kept out of the actions files on purpose: anything exported from a
 * "use server" file can be called from a browser.
 */

export type Earned = { xp: number; levelUp: number | null; courseDone: boolean };

/** XP for finishing the course, once, when the last lesson lands. */
export async function afterProgress(accountId: string, slug: string, before: number): Promise<Earned> {
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


/** An assignment passed: the lesson is done, its XP is earned once, and the course may be finished. */
export async function completeAssignment(accountId: string, slug: string, lessonId: string): Promise<Earned> {
  const before = (await totalXp(accountId)).total;
  await markCompleted(accountId, slug, lessonId);
  await awardXp(accountId, "assignment", `${slug}/${lessonId}`, XP.assignment);
  return afterProgress(accountId, slug, before);
}
