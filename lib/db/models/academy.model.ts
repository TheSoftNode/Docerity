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
