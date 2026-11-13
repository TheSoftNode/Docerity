import { COURSE_LEVELS, LESSON_KINDS, type Course, type CourseLevel, type Lesson, type LessonKind, type Module, type Question } from "@/lib/academy/types";
import { youtubeIdFrom } from "@/lib/academy/rules";

/**
 * Cleans a course before it is stored or shown: every field trimmed and
 * capped, ids made safe for URLs and unique, answers kept inside their
 * options, empty things dropped. Whatever the admin sends, what comes out is
 * a valid `Course`.
 */

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const arr = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const obj = (value: unknown): Record<string, unknown> => (value && typeof value === "object" ? (value as Record<string, unknown>) : {});

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

function uniqueId(wanted: string, fallback: string, used: Set<string>): string {
  const base = slugify(wanted) || fallback;
  let id = base;
  let n = 2;
  while (used.has(id)) id = `${base}-${n++}`;
  used.add(id);
  return id;
}

function cleanQuestion(raw: unknown, index: number, used: Set<string>): Question | null {
  const value = obj(raw);
  const prompt = text(value.prompt, 500);
  const options = arr(value.options).map((option) => text(option, 300)).filter(Boolean).slice(0, 8);
  if (!prompt || options.length < 2) return null;
  const answer = [...new Set(arr(value.answer).map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n < options.length))].sort();
  return {
    id: uniqueId(text(value.id, 60) || `q${index + 1}`, `q${index + 1}`, used),
    prompt,
    code: text(value.code, 2000),
    options,
    answer: answer.length ? answer : [0],
    explain: text(value.explain, 800),
  };
}

function cleanLesson(raw: unknown, used: Set<string>): Lesson | null {
  const value = obj(raw);
  const title = text(value.title, 140);
  if (!title) return null;
  const kind: LessonKind = (LESSON_KINDS as readonly string[]).includes(String(value.kind)) ? (value.kind as LessonKind) : "video";
  const questionIds = new Set<string>();
  const questions = kind === "quiz" ? arr(value.questions).map((q, i) => cleanQuestion(q, i, questionIds)).filter((q): q is Question => q !== null).slice(0, 40) : [];
  const minutes = Math.round(Number(value.minutes));
  return {
    id: uniqueId(text(value.id, 60) || title, "lesson", used),
    title,
    kind,
    youtubeId: kind === "video" ? youtubeIdFrom(text(value.youtubeId, 200)) : "",
    minutes: Number.isFinite(minutes) ? Math.min(Math.max(minutes, 1), 600) : 10,
    summary: text(value.summary, 300),
    notes: text(value.notes, 20000),
    questions,
  };
}

function cleanModule(raw: unknown, usedModules: Set<string>, usedLessons: Set<string>): Module | null {
  const value = obj(raw);
  const title = text(value.title, 120);
  if (!title) return null;
  return {
    id: uniqueId(text(value.id, 60) || title, "module", usedModules),
    title,
    summary: text(value.summary, 400),
    lessons: arr(value.lessons).map((lesson) => cleanLesson(lesson, usedLessons)).filter((lesson): lesson is Lesson => lesson !== null).slice(0, 60),
  };
}

export function normaliseCourse(raw: unknown, slug: string): Course {
  const value = obj(raw);
  const usedModules = new Set<string>();
  const usedLessons = new Set<string>();
  const level: CourseLevel = (COURSE_LEVELS as readonly string[]).includes(String(value.level)) ? (value.level as CourseLevel) : "Beginner";
  const price = Math.round(Number(value.price));
  return {
    slug,
    title: text(value.title, 140) || "Untitled course",
    tagline: text(value.tagline, 400),
    level,
    outcomes: arr(value.outcomes).map((item) => text(item, 160)).filter(Boolean).slice(0, 8),
    price: Number.isFinite(price) && price > 0 ? Math.min(price, 10_000_000) : 0,
    status: value.status === "draft" ? "draft" : "published",
    modules: arr(value.modules).map((module) => cleanModule(module, usedModules, usedLessons)).filter((module): module is Module => module !== null).slice(0, 30),
  };
}
