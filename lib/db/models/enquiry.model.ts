import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

import { budgets, projectTypes, roles, timelines } from "@/lib/contact/schema";

/* Option lists are already the single source of truth for the form and the
   validator, so the enum constraints derive from them rather than being
   retyped. A bracket added in one place cannot silently fail to persist. */
const values = <T extends readonly { value: string }[]>(options: T) =>
  options.map((option) => option.value);

/*
  Cloudinary identity, not a URL.

  Storing a delivery URL would be a mistake here: these assets are uploaded as
  `type: "authenticated"`, so every readable URL is signed and expires. The
  durable fact is the public_id plus the resource type, from which a fresh
  signed URL can be minted whenever one is needed.
*/
const attachmentSchema = new Schema(
  {
    originalName: { type: String, required: true, maxlength: 300 },
    publicId: { type: String, required: true },
    resourceType: { type: String, enum: ["image", "raw"], required: true },
    format: { type: String, default: "" },
    bytes: { type: Number, required: true, min: 0 },
    contentType: { type: String, default: "" },
    /** Whether Cloudinary confirmed this asset exists at the stated size. */
    verified: { type: Boolean, default: false },
  },
  { _id: false }
);

const enquirySchema = new Schema(
  {
    /*
      A short human-quotable id, generated at creation. An ObjectId is fine for
      machines but nobody reads one out on a call; this goes in the
      acknowledgement email so a sender and I can refer to the same enquiry.
    */
    reference: { type: String, required: true, unique: true, index: true },

    name: { type: String, required: true, trim: true, maxlength: 200 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 320 },
    company: { type: String, default: "", trim: true, maxlength: 200 },
    role: { type: String, default: "", enum: ["", ...values(roles)] },
    projectType: { type: String, required: true, enum: values(projectTypes) },
    budget: { type: String, default: "", enum: ["", ...values(budgets)] },
    timeline: { type: String, default: "", enum: ["", ...values(timelines)] },
    message: { type: String, required: true, maxlength: 20000 },
    attachments: { type: [attachmentSchema], default: [] },

    /** Where this sits in your pipeline; set from the admin area. */
    status: {
      type: String,
      enum: ["new", "read", "replied", "archived", "spam"],
      default: "new",
      index: true,
    },

    /*
      Delivery is recorded rather than assumed. An enquiry is persisted before
      any mail is attempted, so a Gmail outage costs a notification, and this
      is how that notification's absence becomes visible instead of looking
      like an enquiry I simply missed.
    */
    notification: {
      delivered: { type: Boolean, default: false },
      messageId: { type: String, default: "" },
      error: { type: String, default: "" },
      attempts: { type: Number, default: 0 },
      lastAttemptAt: { type: Date, default: null },
    },
    acknowledgement: {
      delivered: { type: Boolean, default: false },
      messageId: { type: String, default: "" },
      error: { type: String, default: "" },
    },

    /** Kept for abuse triage and rate limiting only; never displayed. */
    submittedFromIp: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);

/* Newest-first is the only way the admin list is read. */
enquirySchema.index({ createdAt: -1 });
/* Supports the rate-limit count, which filters on IP within a time window.
   Without it that query scans the collection on every submission. */
enquirySchema.index({ submittedFromIp: 1, createdAt: -1 });
/* The admin inbox filters by status, then sorts. */
enquirySchema.index({ status: 1, createdAt: -1 });

export type EnquiryDocument = InferSchemaType<typeof enquirySchema>;

/*
  Declared explicitly rather than inferred from the schema. `InferSchemaType`
  types a subdocument array as Mongoose `Subdocument` instances, which carry
  document methods a plain object cannot satisfy, so every layer that merely
  *builds* an attachment would have to fabricate a document to typecheck. This
  is the data shape; Mongoose hydrates it on the way in.
*/
export type EnquiryAttachment = {
  originalName: string;
  publicId: string;
  resourceType: "image" | "raw";
  format: string;
  bytes: number;
  contentType: string;
  verified: boolean;
};

/* Module scope re-runs on hot reload and on every cold start, and calling
   `mongoose.model()` twice for one name throws OverwriteModelError. */
export const EnquiryModel: Model<EnquiryDocument> =
  (mongoose.models.Enquiry as Model<EnquiryDocument>) ??
  mongoose.model<EnquiryDocument>("Enquiry", enquirySchema);
