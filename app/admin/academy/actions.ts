"use server";

import { revalidatePath } from "next/cache";

import { requireStaffOrThrow } from "@/lib/auth/dal";
import { normaliseCourse, slugify } from "@/lib/academy/normalise";
import { SHIPPED } from "@/lib/academy/courses";
import { awardXp, deleteAcademyContent, deleteStoredCourse, findStoredCourse, reviewBuild, saveAcademyContent, saveStoredCourse } from "@/lib/repositories/academy.repository";
import { BRIEFS_KEY, getBriefs } from "@/lib/academy/pool";
import { BUILD_XP, normaliseBriefs } from "@/lib/academy/briefs";
import { createLogger } from "@/lib/core/logger";

/**
 * Editing Academy courses. Staff only, checked in every action. What is
 * stored is always cleaned first (`normaliseCourse`), whatever was sent.
 */

const logger = createLogger("admin.academy");

export type CourseResult = { ok: true; slug: string } | { ok: false; message: string };

export async function saveCourseAction(slug: string, draft: unknown): Promise<CourseResult> {
  try {
    const user = await requireStaffOrThrow();
    if (!/^[a-z0-9-]{1,80}$/.test(slug)) return { ok: false, message: "That course address isn't valid." };
    const course = normaliseCourse(draft, slug);
    if (!course.modules.length) return { ok: false, message: "Add at least one module with a lesson before saving." };
    await saveStoredCourse(slug, course, user.email);
    revalidatePath("/academy");
    revalidatePath(`/academy/${slug}`, "layout");
    revalidatePath(`/admin/academy/${slug}`);
    return { ok: true, slug };
  } catch (error) {
    logger.error("save course failed", error);
    return { ok: false, message: "The course didn't save. Try again." };
  }
}

export async function createCourseAction(title: string): Promise<CourseResult> {
  try {
    const user = await requireStaffOrThrow();
    const slug = slugify(title);
    if (!slug) return { ok: false, message: "Give the course a title." };
    if (SHIPPED.some((course) => course.slug === slug) || (await findStoredCourse(slug))) {
      return { ok: false, message: "A course with that name already exists." };
    }
    const course = normaliseCourse(
      {
        title,
        status: "draft",
        modules: [{ title: "Module 1", lessons: [{ title: "Welcome", kind: "video", minutes: 5 }] }],
      },
      slug
    );
    await saveStoredCourse(slug, course, user.email);
    revalidatePath("/admin/academy");
    return { ok: true, slug };
  } catch (error) {
    logger.error("create course failed", error);
    return { ok: false, message: "The course couldn't be created." };
  }
}

/** Throws away the edits to a course that ships in code, going back to the shipped version. */
export async function resetCourseAction(slug: string): Promise<CourseResult> {
  try {
    await requireStaffOrThrow();
    if (!SHIPPED.some((course) => course.slug === slug)) return { ok: false, message: "Only built-in courses can be reset." };
    await deleteStoredCourse(slug);
    revalidatePath("/academy");
    revalidatePath(`/academy/${slug}`, "layout");
    revalidatePath(`/admin/academy/${slug}`);
    return { ok: true, slug };
  } catch (error) {
    logger.error("reset course failed", error);
    return { ok: false, message: "The course couldn't be reset." };
  }
}

/* ── Project pool ───────────────────────────────────────────────────────── */


export type ReviewResult = { ok: true } | { ok: false; message: string };

/**
 * Approves a build (the student earns the brief's XP, once) or sends it back
 * with what to change. Feedback is required when asking for changes.
 */
export async function reviewBuildAction(buildId: string, decision: "approved" | "changes", feedback: string): Promise<ReviewResult> {
  try {
    const user = await requireStaffOrThrow();
    const note = feedback.trim().slice(0, 4000);
    if (decision !== "approved" && decision !== "changes") return { ok: false, message: "Choose approve or ask for changes." };
    if (decision === "changes" && !note) return { ok: false, message: "Say what to change, so the student knows what to do." };
    const build = await reviewBuild(buildId, decision, note, user.email);
    if (!build) return { ok: false, message: "That build was already reviewed." };
    if (decision === "approved") {
      const brief = (await getBriefs()).find((item) => item.id === build.briefId);
      await awardXp(String(build.accountId), "build", build.briefId, BUILD_XP[brief?.level ?? "Beginner"]);
    }
    revalidatePath("/admin/academy/builds");
    revalidatePath("/academy/showcase");
    revalidatePath(`/academy/projects/${build.briefId}`);
    return { ok: true };
  } catch (error) {
    logger.error("review build failed", error);
    return { ok: false, message: "The review didn't save. Try again." };
  }
}

export async function saveBriefsAction(draft: unknown): Promise<ReviewResult> {
  try {
    const user = await requireStaffOrThrow();
    const briefs = normaliseBriefs(draft);
    if (!briefs.length) return { ok: false, message: "Keep at least one project in the pool." };
    await saveAcademyContent(BRIEFS_KEY, briefs, user.email);
    revalidatePath("/academy/projects", "layout");
    revalidatePath("/academy");
    revalidatePath("/admin/academy/briefs");
    return { ok: true };
  } catch (error) {
    logger.error("save briefs failed", error);
    return { ok: false, message: "The projects didn't save. Try again." };
  }
}

export async function resetBriefsAction(): Promise<ReviewResult> {
  try {
    await requireStaffOrThrow();
    await deleteAcademyContent(BRIEFS_KEY);
    revalidatePath("/academy/projects", "layout");
    revalidatePath("/admin/academy/briefs");
    return { ok: true };
  } catch (error) {
    logger.error("reset briefs failed", error);
    return { ok: false, message: "The projects couldn't be reset." };
  }
}
