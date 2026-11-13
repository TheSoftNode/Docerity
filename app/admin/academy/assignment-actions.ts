"use server";

import { revalidatePath } from "next/cache";

import { requireStaffOrThrow } from "@/lib/auth/dal";
import { cleanGrade } from "@/lib/academy/assignments";
import { getCourse } from "@/lib/academy/courses";
import { findLesson } from "@/lib/academy/rules";
import { completeAssignment } from "@/lib/academy/progress";
import { findSubmissionById, recordSubmissionGrade } from "@/lib/repositories/academy.repository";
import { createLogger } from "@/lib/core/logger";

/**
 * Marking an assignment by hand, or confirming or changing the AI's mark.
 * Staff only. The grade is cleaned against the lesson's marking guide like
 * the AI's is, and a pass completes the lesson for the student.
 */

const logger = createLogger("admin.assignments");

export type GradeResult = { ok: true } | { ok: false; message: string };

export async function gradeSubmissionAction(id: string, raw: { criteria: { points: number; comment: string }[]; feedback: string }): Promise<GradeResult> {
  try {
    const user = await requireStaffOrThrow();
    const submission = await findSubmissionById(id);
    if (!submission) return { ok: false, message: "That hand-in doesn't exist any more." };
    const course = await getCourse(submission.courseSlug, { drafts: true });
    const found = course ? findLesson(course, submission.lessonId) : null;
    if (!found || found.lesson.kind !== "assignment") return { ok: false, message: "That assignment isn't in the course any more." };
    const rubric = found.lesson.rubric ?? [];
    if (!Array.isArray(raw?.criteria) || raw.criteria.length !== rubric.length) return { ok: false, message: "Give points for every line." };
    if (!raw.feedback?.trim()) return { ok: false, message: "Write a line of feedback for the student." };

    const grade = cleanGrade(rubric, raw);
    await recordSubmissionGrade(id, { ...grade, gradedBy: user.email, checked: true, status: "graded" });
    if (grade.passed) await completeAssignment(String(submission.accountId), submission.courseSlug, submission.lessonId);
    revalidatePath("/admin/academy/assignments");
    revalidatePath(`/academy/${submission.courseSlug}`, "layout");
    return { ok: true };
  } catch (error) {
    logger.error("grade submission failed", error);
    return { ok: false, message: "The grade didn't save. Try again." };
  }
}
