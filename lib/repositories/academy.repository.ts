import "server-only";

import { Types } from "mongoose";

import { connectDB } from "@/lib/db/connect";
import {
  AcademyBattleEntryModel,
  AcademyBattleModel,
  AcademyBuildModel,
  AcademyContentModel,
  AcademyCourseModel,
  AcademyEnrollmentModel,
  AcademyLearnerModel,
  AcademySubmissionModel,
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

/* ── Leaderboards and achievements ──────────────────────────────────────── */

/** The top learners of all time by XP. */
export async function allTimeLeaders(limit = 10) {
  await connectDB();
  return AcademyXpModel.aggregate<{ _id: Types.ObjectId; xp: number; name: string }>([
    { $group: { _id: "$accountId", xp: { $sum: "$xp" } } },
    { $sort: { xp: -1 } },
    { $limit: limit },
    { $lookup: { from: "clientaccounts", localField: "_id", foreignField: "_id", as: "account" } },
    { $project: { xp: 1, name: { $ifNull: [{ $first: "$account.name" }, "A student"] } } },
  ]);
}

/** How many of each kind of XP a student has earned: the facts behind their achievements. */
export async function xpCounts(accountId: string): Promise<Record<string, number>> {
  await connectDB();
  const rows = await AcademyXpModel.aggregate<{ _id: string; count: number }>([
    { $match: { accountId: oid(accountId) } },
    { $group: { _id: "$kind", count: { $sum: 1 } } },
  ]);
  return Object.fromEntries(rows.map((row) => [row._id, row.count]));
}

/* ── Build battles ──────────────────────────────────────────────────────── */

export async function listBattleRecords() {
  await connectDB();
  return AcademyBattleModel.find().select("slug data").lean();
}

export async function findBattleRecord(slug: string) {
  await connectDB();
  return AcademyBattleModel.findOne({ slug }).select("slug data").lean();
}

export async function saveBattleRecord(slug: string, data: unknown, by: string) {
  await connectDB();
  await AcademyBattleModel.updateOne({ slug }, { $set: { data, updatedBy: by } }, { upsert: true });
}

export async function deleteBattleRecord(slug: string) {
  await connectDB();
  await AcademyBattleModel.deleteOne({ slug });
  await AcademyBattleEntryModel.deleteMany({ battleSlug: slug });
}

export async function findBattleEntry(battleSlug: string, accountId: string) {
  await connectDB();
  return AcademyBattleEntryModel.findOne({ battleSlug, accountId: oid(accountId) }).lean();
}

/** Enters a battle, or updates the entry. Returns whether this was the first time. */
export async function saveBattleEntry(
  battleSlug: string,
  accountId: string,
  values: { title: string; repoUrl: string; liveUrl: string; note: string }
): Promise<{ created: boolean }> {
  await connectDB();
  const result = await AcademyBattleEntryModel.updateOne(
    { battleSlug, accountId: oid(accountId) },
    { $set: values, $setOnInsert: { submittedAt: new Date() } },
    { upsert: true }
  );
  return { created: result.upsertedCount > 0 };
}

export type BattleEntryRow = {
  _id: Types.ObjectId;
  accountId: Types.ObjectId;
  title: string;
  repoUrl: string;
  liveUrl: string;
  note: string;
  votes: number;
  voters: Types.ObjectId[];
  submittedAt: Date;
  hidden: boolean;
  name: string;
  email: string;
};

/** A battle's entries, most upvoted first (earliest first on a tie). Hidden ones only for the admin. */
export async function listBattleEntries(battleSlug: string, { includeHidden = false } = {}) {
  await connectDB();
  return AcademyBattleEntryModel.aggregate<BattleEntryRow>([
    { $match: includeHidden ? { battleSlug } : { battleSlug, hidden: { $ne: true } } },
    { $sort: { votes: -1, submittedAt: 1 } },
    { $limit: 500 },
    { $lookup: { from: "clientaccounts", localField: "accountId", foreignField: "_id", as: "account" } },
    {
      $project: {
        accountId: 1,
        title: 1,
        repoUrl: 1,
        liveUrl: 1,
        note: 1,
        votes: 1,
        voters: 1,
        submittedAt: 1,
        hidden: 1,
        name: { $ifNull: [{ $first: "$account.name" }, "A student"] },
        email: { $ifNull: [{ $first: "$account.email" }, ""] },
      },
    },
  ]);
}

export async function countBattleEntries(battleSlug: string) {
  await connectDB();
  return AcademyBattleEntryModel.countDocuments({ battleSlug, hidden: { $ne: true } });
}

/** How many of their votes a student has used in a battle. */
export async function battleVotesUsed(battleSlug: string, voterId: string) {
  await connectDB();
  return AcademyBattleEntryModel.countDocuments({ battleSlug, voters: oid(voterId) });
}

/**
 * Adds or takes back a vote in a battle: never on your own entry, once per
 * entry, and at most `cap` across the battle. Returns null when not allowed,
 * with the reason.
 */
export async function toggleBattleVote(
  battleSlug: string,
  entryId: string,
  voterId: string,
  cap: number
): Promise<{ votes: number; voted: boolean } | { refused: "own" | "cap" | "missing" }> {
  await connectDB();
  if (!Types.ObjectId.isValid(entryId)) return { refused: "missing" };
  const voter = oid(voterId);
  const removed = await AcademyBattleEntryModel.findOneAndUpdate(
    { _id: oid(entryId), battleSlug, voters: voter },
    { $pull: { voters: voter }, $inc: { votes: -1 } },
    { new: true }
  )
    .select("votes")
    .lean();
  if (removed) return { votes: removed.votes, voted: false };

  const entry = await AcademyBattleEntryModel.findOne({ _id: oid(entryId), battleSlug, hidden: { $ne: true } })
    .select("accountId")
    .lean();
  if (!entry) return { refused: "missing" };
  if (String(entry.accountId) === voterId) return { refused: "own" };
  if ((await battleVotesUsed(battleSlug, voterId)) >= cap) return { refused: "cap" };
  const added = await AcademyBattleEntryModel.findOneAndUpdate(
    { _id: oid(entryId), voters: { $ne: voter } },
    { $addToSet: { voters: voter }, $inc: { votes: 1 } },
    { new: true }
  )
    .select("votes")
    .lean();
  return added ? { votes: added.votes, voted: true } : { refused: "missing" };
}

export async function setBattleEntryHidden(entryId: string, hidden: boolean) {
  await connectDB();
  if (!Types.ObjectId.isValid(entryId)) return null;
  return AcademyBattleEntryModel.findOneAndUpdate({ _id: oid(entryId) }, { $set: { hidden } }, { new: true }).select("battleSlug").lean();
}

/* ── Assignments ────────────────────────────────────────────────────────── */

export async function findSubmission(accountId: string, courseSlug: string, lessonId: string) {
  await connectDB();
  return AcademySubmissionModel.findOne({ accountId: oid(accountId), courseSlug, lessonId }).lean();
}

/** Stores a hand-in (replacing the last attempt) and clears its grade until it is marked again. */
export async function saveSubmission(accountId: string, courseSlug: string, lessonId: string, work: { answer: string; repoUrl: string; liveUrl: string }) {
  await connectDB();
  return AcademySubmissionModel.findOneAndUpdate(
    { accountId: oid(accountId), courseSlug, lessonId },
    {
      $set: { ...work, submittedAt: new Date(), status: "waiting", score: null, passed: false, criteria: [], feedback: "", gradedBy: "", gradedAt: null, checked: false, aiNote: "" },
      $inc: { attempts: 1 },
    },
    { upsert: true, new: true }
  ).lean();
}

export async function recordSubmissionGrade(
  id: string,
  grade: { score: number; passed: boolean; criteria: unknown; feedback: string; gradedBy: string; checked: boolean; status: "waiting" | "graded"; aiNote?: string }
) {
  await connectDB();
  if (!Types.ObjectId.isValid(id)) return null;
  return AcademySubmissionModel.findOneAndUpdate({ _id: oid(id) }, { $set: { ...grade, aiNote: grade.aiNote ?? "", gradedAt: new Date() } }, { new: true }).lean();
}

export async function findSubmissionById(id: string) {
  await connectDB();
  if (!Types.ObjectId.isValid(id)) return null;
  return AcademySubmissionModel.findById(id).lean();
}

export type SubmissionRow = {
  _id: Types.ObjectId;
  accountId: Types.ObjectId;
  courseSlug: string;
  lessonId: string;
  answer: string;
  repoUrl: string;
  liveUrl: string;
  attempts: number;
  submittedAt: Date;
  status: "waiting" | "graded";
  score: number | null;
  passed: boolean;
  criteria: { criterion: string; max: number; points: number; comment: string }[];
  feedback: string;
  gradedBy: string;
  checked: boolean;
  aiNote: string;
  name: string;
  email: string;
};

/** Hand-ins for staff: those waiting for a mark, or AI grades nobody has checked yet. Oldest first. */
export async function listSubmissionsToReview(which: "waiting" | "check", limit = 100) {
  await connectDB();
  return AcademySubmissionModel.aggregate<SubmissionRow>([
    { $match: which === "waiting" ? { status: "waiting" } : { status: "graded", checked: false } },
    { $sort: { submittedAt: 1 } },
    { $limit: limit },
    { $lookup: { from: "clientaccounts", localField: "accountId", foreignField: "_id", as: "account" } },
    { $addFields: { name: { $ifNull: [{ $first: "$account.name" }, "A student"] }, email: { $ifNull: [{ $first: "$account.email" }, ""] } } },
    { $project: { account: 0 } },
  ]);
}

export async function countSubmissionsToReview() {
  await connectDB();
  const [waiting, check] = await Promise.all([
    AcademySubmissionModel.countDocuments({ status: "waiting" }),
    AcademySubmissionModel.countDocuments({ status: "graded", checked: false }),
  ]);
  return { waiting, check };
}
