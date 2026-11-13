import "server-only";

import { cache } from "react";

import { database } from "@/lib/config/env";
import { webDevelopment } from "@/lib/academy/catalog/web-development";
import { normaliseCourse } from "@/lib/academy/normalise";
import type { Course } from "@/lib/academy/types";
import { findStoredCourse, listStoredCourses } from "@/lib/repositories/academy.repository";

/** The courses that ship in code, in the order the catalogue shows them. */
export const SHIPPED: Course[] = [webDevelopment];

/**
 * Every course, edited ones in place of the shipped ones, plus any created in
 * the admin. Drafts are left out unless asked for (the admin asks).
 */
export const listCourses = cache(async (options: { drafts?: boolean } = {}): Promise<Course[]> => {
  let stored: { slug: string; data: unknown }[] = [];
  if (database.isConfigured) {
    try {
      stored = (await listStoredCourses()).map((row) => ({ slug: row.slug, data: row.data }));
    } catch {
      stored = [];
    }
  }
  const bySlug = new Map(stored.map((row) => [row.slug, normaliseCourse(row.data, row.slug)] as const));
  const courses = [...SHIPPED.map((course) => bySlug.get(course.slug) ?? course), ...[...bySlug.values()].filter((course) => !SHIPPED.some((item) => item.slug === course.slug))];
  return options.drafts ? courses : courses.filter((course) => course.status === "published");
});

export const getCourse = cache(async (slug: string, options: { drafts?: boolean } = {}): Promise<Course | null> => {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  let course: Course | null = null;
  if (database.isConfigured) {
    try {
      const stored = await findStoredCourse(slug);
      if (stored) course = normaliseCourse(stored.data, slug);
    } catch {
      course = null;
    }
  }
  course ??= SHIPPED.find((item) => item.slug === slug) ?? null;
  if (!course) return null;
  return course.status === "published" || options.drafts ? course : null;
});
