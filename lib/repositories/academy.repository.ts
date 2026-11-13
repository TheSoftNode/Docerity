import "server-only";

import { Types } from "mongoose";

import { connectDB } from "@/lib/db/connect";
import {
  AcademyCourseModel,
  AcademyEnrollmentModel,
  AcademyLearnerModel,
  AcademyXpModel,
} from "@/lib/db/models/academy.model";
import { dayKey, nextStreak, weekKey, type XpKind } from "@/lib/academy/rules";

/* ── Courses (as edited in the admin) ───────────────────────────────────── */

export async function listStoredCourses() {
  await connectDB();
  return AcademyCourseModel.find().select("slug data updatedAt").lean();
}

export async function findStoredCourse(slug: string) {
  await connectDB();
  return AcademyCourseModel.findOne({ slug }).lean();
}

export async function saveStoredCourse(slug: string, data: unknown, by: string) {
  await connectDB();
  await AcademyCourseModel.updateOne({ slug }, { $set: { data, updatedBy: by } }, { upsert: true });
}

export async function deleteStoredCourse(slug: string) {
  await connectDB();
  await AcademyCourseModel.deleteOne({ slug });
}

/* ── Enrolment and progress ─────────────────────────────────────────────── */

const oid = (id: string) => new Types.ObjectId(id);

export async function findEnrollment(accountId: string, courseSlug: string) {
  await connectDB();
  return AcademyEnrollmentModel.findOne({ accountId: oid(accountId), courseSlug }).lean();
}

export async function listEnrollments(accountId: string) {
  await connectDB();
  return AcademyEnrollmentModel.find({ accountId: oid(accountId) }).sort({ lastActiveAt: -1 }).lean();
}

/** Enrols once; enrolling again is a no-op. */
export async function enrol(accountId: string, courseSlug: string) {
  await connectDB();
  await AcademyEnrollmentModel.updateOne(
    { accountId: oid(accountId), courseSlug },
    { $setOnInsert: { accountId: oid(accountId), courseSlug, lastActiveAt: new Date() } },
    { upsert: true }
  );
}

export async function markCompleted(accountId: string, courseSlug: string, lessonId: string) {
  await connectDB();
  const result = await AcademyEnrollmentModel.updateOne(
    { accountId: oid(accountId), courseSlug },
    { $addToSet: { completed: lessonId }, $set: { lastLesson: lessonId, lastActiveAt: new Date() } }
  );
  return result.matchedCount > 0;
}

/** Keeps the furthest point reached; watching a bit again never lowers it. */
export async function recordWatched(accountId: string, courseSlug: string, lessonId: string, seconds: number) {
  await connectDB();
  await AcademyEnrollmentModel.updateOne(
    { accountId: oid(accountId), courseSlug },
    { $max: { [`watched.${lessonId}`]: Math.floor(seconds) }, $set: { lastLesson: lessonId, lastActiveAt: new Date() } }
  );
}

export async function recordQuiz(accountId: string, courseSlug: string, lessonId: string, score: number, passed: boolean) {
  await connectDB();
  await AcademyEnrollmentModel.updateOne(
    { accountId: oid(accountId), courseSlug },
    {
      $max: { [`best.${lessonId}`]: score },
      ...(passed ? { $addToSet: { passed: lessonId, completed: lessonId } } : {}),
      $set: { lastLesson: lessonId, lastActiveAt: new Date() },
    }
  );
}

export async function markCourseComplete(accountId: string, courseSlug: string) {
  await connectDB();
  await AcademyEnrollmentModel.updateOne(
    { accountId: oid(accountId), courseSlug, completedAt: null },
    { $set: { completedAt: new Date() } }
  );
}

/* ── XP, streaks, standing ──────────────────────────────────────────────── */

/**
 * Awards XP once per (kind, ref): a second call for the same lesson or quiz
 * earns nothing. Returns the XP actually added. Moves the streak too, since
 * earning anything counts as a day of learning.
 */
export async function awardXp(accountId: string, kind: XpKind, ref: string, xp: number): Promise<number> {
  await connectDB();
  let added = 0;
  try {
    await AcademyXpModel.create({ accountId: oid(accountId), kind, ref, xp, at: new Date() });
    added = xp;
  } catch (error) {
    if (!(error && typeof error === "object" && "code" in error && (error as { code: number }).code === 11000)) throw error;
  }
  await touchStreak(accountId);
  return added;
}

/** Counts today as a learning day for the streak. */
export async function touchStreak(accountId: string) {
  await connectDB();
  const current = await AcademyLearnerModel.findOne({ accountId: oid(accountId) }).lean();
  const next = nextStreak(
    { count: current?.streak ?? 0, lastDay: current?.lastDay ?? "", freezeWeek: current?.freezeWeek ?? "" },
    dayKey()
  );
  await AcademyLearnerModel.updateOne(
    { accountId: oid(accountId) },
    {
      $set: { streak: next.count, lastDay: next.lastDay, freezeWeek: next.freezeWeek },
      $max: { bestStreak: next.count },
    },
    { upsert: true }
  );
}

export async function findLearner(accountId: string) {
  await connectDB();
  return AcademyLearnerModel.findOne({ accountId: oid(accountId) }).lean();
}

export async function totalXp(accountId: string): Promise<{ total: number; week: number }> {
  await connectDB();
  const monday = new Date(`${weekKey(dayKey())}T00:00:00+01:00`);
  const [row] = await AcademyXpModel.aggregate<{ total: number; week: number }>([
    { $match: { accountId: oid(accountId) } },
    {
      $group: {
        _id: null,
        total: { $sum: "$xp" },
        week: { $sum: { $cond: [{ $gte: ["$at", monday] }, "$xp", 0] } },
      },
    },
  ]);
  return { total: row?.total ?? 0, week: row?.week ?? 0 };
}

/** This week's top learners by XP (the week starts Monday, West Africa Time). */
export async function weeklyLeaders(limit = 10) {
  await connectDB();
  const monday = new Date(`${weekKey(dayKey())}T00:00:00+01:00`);
  return AcademyXpModel.aggregate<{ _id: Types.ObjectId; xp: number; name: string }>([
    { $match: { at: { $gte: monday } } },
    { $group: { _id: "$accountId", xp: { $sum: "$xp" } } },
    { $sort: { xp: -1 } },
    { $limit: limit },
    { $lookup: { from: "clientaccounts", localField: "_id", foreignField: "_id", as: "account" } },
    { $project: { xp: 1, name: { $ifNull: [{ $first: "$account.name" }, "A student"] } } },
  ]);
}

/* ── Admin view ─────────────────────────────────────────────────────────── */

export async function courseStats(courseSlug: string) {
  await connectDB();
  const [enrolled, finished, activeWeek] = await Promise.all([
    AcademyEnrollmentModel.countDocuments({ courseSlug }),
    AcademyEnrollmentModel.countDocuments({ courseSlug, completedAt: { $ne: null } }),
    AcademyEnrollmentModel.countDocuments({ courseSlug, lastActiveAt: { $gte: new Date(Date.now() - 7 * 86_400_000) } }),
  ]);
  return { enrolled, finished, activeWeek };
}

export async function listCourseStudents(courseSlug: string, limit = 200) {
  await connectDB();
  return AcademyEnrollmentModel.aggregate<{
    _id: Types.ObjectId;
    completed: string[];
    lastActiveAt: Date;
    completedAt: Date | null;
    createdAt: Date;
    name: string;
    email: string;
  }>([
    { $match: { courseSlug } },
    { $sort: { lastActiveAt: -1 } },
    { $limit: limit },
    { $lookup: { from: "clientaccounts", localField: "accountId", foreignField: "_id", as: "account" } },
    {
      $project: {
        completed: 1,
        lastActiveAt: 1,
        completedAt: 1,
        createdAt: 1,
        name: { $ifNull: [{ $first: "$account.name" }, ""] },
        email: { $ifNull: [{ $first: "$account.email" }, ""] },
      },
    },
  ]);
}
