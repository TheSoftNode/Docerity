import "server-only";

import { Types } from "mongoose";

import { connectDB } from "@/lib/db/connect";
import {
  AcademyBuildModel,
  AcademyContentModel,
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

/* ── Academy content (project briefs) ───────────────────────────────────── */

export async function findAcademyContent(key: string) {
  await connectDB();
  return AcademyContentModel.findOne({ key }).lean();
}

export async function saveAcademyContent(key: string, data: unknown, by: string) {
  await connectDB();
  await AcademyContentModel.updateOne({ key }, { $set: { data, updatedBy: by } }, { upsert: true });
}

export async function deleteAcademyContent(key: string) {
  await connectDB();
  await AcademyContentModel.deleteOne({ key });
}

/* ── Project builds ─────────────────────────────────────────────────────── */

export async function listBuildsFor(accountId: string) {
  await connectDB();
  return AcademyBuildModel.find({ accountId: oid(accountId) }).select("-voters").lean();
}

export async function findBuild(accountId: string, briefId: string) {
  await connectDB();
  return AcademyBuildModel.findOne({ accountId: oid(accountId), briefId }).select("-voters").lean();
}

/** Starting twice is a no-op: one build per student per brief. */
export async function startBuild(accountId: string, briefId: string) {
  await connectDB();
  await AcademyBuildModel.updateOne(
    { accountId: oid(accountId), briefId },
    { $setOnInsert: { accountId: oid(accountId), briefId, status: "building" } },
    { upsert: true }
  );
}

/** Hands a build in (or in again after changes). An approved build stays approved. */
export async function submitBuild(accountId: string, briefId: string, values: { repoUrl: string; liveUrl: string; note: string }) {
  await connectDB();
  const result = await AcademyBuildModel.updateOne(
    { accountId: oid(accountId), briefId, status: { $in: ["building", "changes", "submitted"] } },
    { $set: { ...values, status: "submitted", submittedAt: new Date() } }
  );
  return result.matchedCount > 0;
}

export async function listSubmittedBuilds() {
  await connectDB();
  return AcademyBuildModel.aggregate<{
    _id: Types.ObjectId;
    accountId: Types.ObjectId;
    briefId: string;
    repoUrl: string;
    liveUrl: string;
    note: string;
    submittedAt: Date;
    name: string;
    email: string;
  }>([
    { $match: { status: "submitted" } },
    { $sort: { submittedAt: 1 } },
    { $limit: 200 },
    { $lookup: { from: "clientaccounts", localField: "accountId", foreignField: "_id", as: "account" } },
    {
      $project: {
        accountId: 1,
        briefId: 1,
        repoUrl: 1,
        liveUrl: 1,
        note: 1,
        submittedAt: 1,
        name: { $ifNull: [{ $first: "$account.name" }, ""] },
        email: { $ifNull: [{ $first: "$account.email" }, ""] },
      },
    },
  ]);
}

export async function countSubmittedBuilds() {
  await connectDB();
  return AcademyBuildModel.countDocuments({ status: "submitted" });
}

/** Records a review. Returns the build as it was, or null if it was not waiting for one. */
export async function reviewBuild(buildId: string, decision: "approved" | "changes", feedback: string, by: string) {
  await connectDB();
  if (!Types.ObjectId.isValid(buildId)) return null;
  return AcademyBuildModel.findOneAndUpdate(
    { _id: oid(buildId), status: "submitted" },
    { $set: { status: decision, feedback, reviewedBy: by, reviewedAt: new Date() } },
    { new: false }
  )
    .select("accountId briefId")
    .lean();
}

/** Approved builds for the showcase, most upvoted first. */
export async function listShowcase(limit = 60) {
  await connectDB();
  return AcademyBuildModel.aggregate<{
    _id: Types.ObjectId;
    accountId: Types.ObjectId;
    briefId: string;
    repoUrl: string;
    liveUrl: string;
    note: string;
    votes: number;
    reviewedAt: Date;
    voters: Types.ObjectId[];
    name: string;
  }>([
    { $match: { status: "approved" } },
    { $sort: { votes: -1, reviewedAt: -1 } },
    { $limit: limit },
    { $lookup: { from: "clientaccounts", localField: "accountId", foreignField: "_id", as: "account" } },
    {
      $project: {
        accountId: 1,
        briefId: 1,
        repoUrl: 1,
        liveUrl: 1,
        note: 1,
        votes: 1,
        reviewedAt: 1,
        voters: 1,
        name: { $ifNull: [{ $first: "$account.name" }, "A student"] },
      },
    },
  ]);
}

/** Adds or takes back an upvote. Never on your own build; once per student. Returns the new count, or null. */
export async function toggleVote(buildId: string, voterId: string): Promise<{ votes: number; voted: boolean } | null> {
  await connectDB();
  if (!Types.ObjectId.isValid(buildId)) return null;
  const voter = oid(voterId);
  const added = await AcademyBuildModel.findOneAndUpdate(
    { _id: oid(buildId), status: "approved", accountId: { $ne: voter }, voters: { $ne: voter } },
    { $addToSet: { voters: voter }, $inc: { votes: 1 } },
    { new: true }
  )
    .select("votes")
    .lean();
  if (added) return { votes: added.votes, voted: true };
  const removed = await AcademyBuildModel.findOneAndUpdate(
    { _id: oid(buildId), status: "approved", voters: voter },
    { $pull: { voters: voter }, $inc: { votes: -1 } },
    { new: true }
  )
    .select("votes")
    .lean();
  return removed ? { votes: removed.votes, voted: false } : null;
}
