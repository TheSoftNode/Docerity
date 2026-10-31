import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * A piece of work being done for a client, as they follow it in their account:
 * where it stands, the milestones on the way, the updates posted as it moves,
 * and the links to look at it.
 *
 * Belongs to an email address rather than an account id, so a project can be
 * set up before the client has signed up; it appears for them once they verify
 * that address.
 */
export const PROJECT_STATUSES = ["planning", "in-progress", "review", "paused", "done"] as const;
export const MILESTONE_STATUSES = ["todo", "doing", "done"] as const;
export const UPDATE_KINDS = ["update", "milestone", "preview", "question"] as const;

const milestoneSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    detail: { type: String, default: "", trim: true, maxlength: 600 },
    status: { type: String, enum: MILESTONE_STATUSES, default: "todo" },
    due: { type: Date, default: null },
    doneAt: { type: Date, default: null },
  },
  { _id: true }
);

/* A reply under an update: from the client in their portal, or from the team in the admin. */
const replySchema = new Schema(
  {
    from: { type: String, enum: ["client", "team"], required: true },
    name: { type: String, default: "", trim: true, maxlength: 120 },
    body: { type: String, required: true, trim: true, maxlength: 4000 },
    /* Whether the team has opened the project since a client's reply came in. */
    seenByTeam: { type: Boolean, default: false },
    createdAt: { type: Date, default: () => new Date() },
  },
  { _id: true }
);

const updateSchema = new Schema(
  {
    kind: { type: String, enum: UPDATE_KINDS, default: "update" },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    body: { type: String, default: "", trim: true, maxlength: 6000 },
    link: { type: String, default: "", trim: true, maxlength: 500 },
    by: { type: String, default: "", trim: true, maxlength: 120 },
    createdAt: { type: Date, default: () => new Date() },
    replies: { type: [replySchema], default: [] },
  },
  { _id: true }
);

const linkSchema = new Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 80 },
    url: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const clientProjectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    clientEmail: { type: String, required: true, lowercase: true, trim: true, maxlength: 320, index: true },
    clientName: { type: String, default: "", trim: true, maxlength: 120 },
    summary: { type: String, default: "", trim: true, maxlength: 1200 },
    status: { type: String, enum: PROJECT_STATUSES, default: "planning" },
    startDate: { type: Date, default: null },
    targetDate: { type: Date, default: null },
    /* What the client should expect next, in a sentence. */
    nextStep: { type: String, default: "", trim: true, maxlength: 300 },
    milestones: { type: [milestoneSchema], default: [] },
    updates: { type: [updateSchema], default: [] },
    links: { type: [linkSchema], default: [] },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type ClientProject = InferSchemaType<typeof clientProjectSchema>;

export const ClientProjectModel: Model<ClientProject> =
  (mongoose.models.ClientProject as Model<ClientProject>) ??
  mongoose.model<ClientProject>("ClientProject", clientProjectSchema);
