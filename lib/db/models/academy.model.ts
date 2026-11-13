import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * The Academy's records.
 *
 * - `AcademyCourse`: a course as edited in the admin, stored whole. When none
 *   is stored for a slug, the course that ships in code is used.
 * - `AcademyEnrollment`: one student in one course, and their progress.
 * - `AcademyLearner`: a student's standing across the Academy (streak).
 * - `AcademyXp`: the XP ledger. One row per thing earned, unique per account,
 *   kind and reference, so the same lesson or quiz can never pay twice; totals
 *   and the weekly leaderboard are sums over it.
 *
 * Students are client accounts (`ClientAccount`): one login for projects,
 * mentorship and learning.
 */

const courseSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, maxlength: 80 },
    /* The whole course, cleaned by `normaliseCourse` before it is stored. */
    data: { type: Schema.Types.Mixed, required: true },
    updatedBy: { type: String, default: "", maxlength: 320 },
  },
  { timestamps: true, minimize: false }
);

const enrollmentSchema = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, required: true, index: true },
    courseSlug: { type: String, required: true, trim: true, maxlength: 80 },
    completed: { type: [String], default: [] },
    passed: { type: [String], default: [] },
    /* lesson id → best quiz score, 0–100. */
    best: { type: Schema.Types.Mixed, default: {} },
    /* lesson id → seconds of video watched (the furthest point reached). */
    watched: { type: Schema.Types.Mixed, default: {} },
    lastLesson: { type: String, default: "" },
    lastActiveAt: { type: Date, default: () => new Date() },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true, minimize: false }
);
enrollmentSchema.index({ accountId: 1, courseSlug: 1 }, { unique: true });
enrollmentSchema.index({ courseSlug: 1, lastActiveAt: -1 });

const learnerSchema = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, required: true, unique: true },
    streak: { type: Number, default: 0 },
    bestStreak: { type: Number, default: 0 },
    /* The day the streak last moved, YYYY-MM-DD in West Africa Time. */
    lastDay: { type: String, default: "" },
    /* The week (its Monday) the streak freeze was used in. */
    freezeWeek: { type: String, default: "" },
  },
  { timestamps: true }
);

const xpSchema = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, required: true },
    kind: { type: String, required: true, maxlength: 40 },
    ref: { type: String, required: true, maxlength: 200 },
    xp: { type: Number, required: true, min: 0, max: 1000 },
    at: { type: Date, default: () => new Date() },
  },
  { timestamps: false }
);
xpSchema.index({ accountId: 1, kind: 1, ref: 1 }, { unique: true });
xpSchema.index({ at: -1 });

/* A project a student took from the pool: started, handed in, reviewed. */
const buildSchema = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, required: true },
    briefId: { type: String, required: true, maxlength: 80 },
    status: { type: String, enum: ["building", "submitted", "approved", "changes"], default: "building", index: true },
    repoUrl: { type: String, default: "", maxlength: 300 },
    liveUrl: { type: String, default: "", maxlength: 500 },
    note: { type: String, default: "", maxlength: 2000 },
    feedback: { type: String, default: "", maxlength: 4000 },
    reviewedBy: { type: String, default: "", maxlength: 320 },
    submittedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    /* Upvotes in the showcase: one per student, never your own. */
    voters: { type: [Schema.Types.ObjectId], default: [] },
    votes: { type: Number, default: 0 },
  },
  { timestamps: true }
);
buildSchema.index({ accountId: 1, briefId: 1 }, { unique: true });
buildSchema.index({ status: 1, votes: -1, reviewedAt: -1 });

/* Academy content edited in the admin that is not a course (the project briefs). */
const contentSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, maxlength: 60 },
    data: { type: Schema.Types.Mixed, required: true },
    updatedBy: { type: String, default: "", maxlength: 320 },
  },
  { timestamps: true, minimize: false }
);

/* A build battle as edited in the admin, stored whole (see lib/academy/battles.ts). */
const battleSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, maxlength: 80 },
    data: { type: Schema.Types.Mixed, required: true },
    updatedBy: { type: String, default: "", maxlength: 320 },
  },
  { timestamps: true, minimize: false }
);

/* One student's entry in one battle, with its upvotes. */
const battleEntrySchema = new Schema(
  {
    battleSlug: { type: String, required: true, maxlength: 80 },
    accountId: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, default: "", maxlength: 120 },
    repoUrl: { type: String, default: "", maxlength: 300 },
    liveUrl: { type: String, default: "", maxlength: 500 },
    note: { type: String, default: "", maxlength: 2000 },
    submittedAt: { type: Date, default: () => new Date() },
    voters: { type: [Schema.Types.ObjectId], default: [] },
    votes: { type: Number, default: 0 },
    /* Taken out of the battle by the admin (off-brief, copied, broken link). */
    hidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);
battleEntrySchema.index({ battleSlug: 1, accountId: 1 }, { unique: true });
battleEntrySchema.index({ battleSlug: 1, voters: 1 });

export type AcademyBattleRecord = InferSchemaType<typeof battleSchema>;
export type AcademyBattleEntry = InferSchemaType<typeof battleEntrySchema>;

export const AcademyBattleModel: Model<AcademyBattleRecord> =
  (mongoose.models.AcademyBattle as Model<AcademyBattleRecord>) ?? mongoose.model<AcademyBattleRecord>("AcademyBattle", battleSchema);

export const AcademyBattleEntryModel: Model<AcademyBattleEntry> =
  (mongoose.models.AcademyBattleEntry as Model<AcademyBattleEntry>) ??
  mongoose.model<AcademyBattleEntry>("AcademyBattleEntry", battleEntrySchema);

export type AcademyBuild = InferSchemaType<typeof buildSchema>;
export type AcademyContent = InferSchemaType<typeof contentSchema>;
export type BuildStatus = AcademyBuild["status"];

export const AcademyBuildModel: Model<AcademyBuild> =
  (mongoose.models.AcademyBuild as Model<AcademyBuild>) ?? mongoose.model<AcademyBuild>("AcademyBuild", buildSchema);

export const AcademyContentModel: Model<AcademyContent> =
  (mongoose.models.AcademyContent as Model<AcademyContent>) ?? mongoose.model<AcademyContent>("AcademyContent", contentSchema);

export type AcademyCourseRecord = InferSchemaType<typeof courseSchema>;
export type AcademyEnrollment = InferSchemaType<typeof enrollmentSchema>;
export type AcademyLearner = InferSchemaType<typeof learnerSchema>;
export type AcademyXpRow = InferSchemaType<typeof xpSchema>;

export const AcademyCourseModel: Model<AcademyCourseRecord> =
  (mongoose.models.AcademyCourse as Model<AcademyCourseRecord>) ?? mongoose.model<AcademyCourseRecord>("AcademyCourse", courseSchema);

export const AcademyEnrollmentModel: Model<AcademyEnrollment> =
  (mongoose.models.AcademyEnrollment as Model<AcademyEnrollment>) ??
  mongoose.model<AcademyEnrollment>("AcademyEnrollment", enrollmentSchema);

export const AcademyLearnerModel: Model<AcademyLearner> =
  (mongoose.models.AcademyLearner as Model<AcademyLearner>) ?? mongoose.model<AcademyLearner>("AcademyLearner", learnerSchema);

export const AcademyXpModel: Model<AcademyXpRow> =
  (mongoose.models.AcademyXp as Model<AcademyXpRow>) ?? mongoose.model<AcademyXpRow>("AcademyXp", xpSchema);
