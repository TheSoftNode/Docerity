import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

import { budgets, projectTypes, roles, timelines } from "@/lib/contact/schema";

/* The option lists are already the single source of truth for the form and the
   route handler, so the enum constraints are derived from them rather than
   retyped. A new budget bracket added in one place cannot silently fail to
   persist here. */
const values = <T extends readonly { value: string }[]>(options: T) =>
  options.map((option) => option.value);

const attachmentSchema = new Schema(
  {
    name: { type: String, required: true },
    /* The Blob URL. Unlike the portfolio backend's `/uploads/<file>` paths,
       this is durable storage that survives redeploys. */
    url: { type: String, required: true },
    contentType: { type: String, default: "" },
    size: { type: Number, required: true },
  },
  { _id: false }
);

const enquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 320 },
    company: { type: String, default: "", trim: true, maxlength: 200 },
    role: { type: String, default: "", enum: ["", ...values(roles)] },
    projectType: { type: String, required: true, enum: values(projectTypes) },
    budget: { type: String, default: "", enum: ["", ...values(budgets)] },
    timeline: { type: String, default: "", enum: ["", ...values(timelines)] },
    message: { type: String, required: true, maxlength: 20000 },
    attachments: { type: [attachmentSchema], default: [] },

    /* Operational state, not user input. `delivered` records whether the
       notification email actually went out: an enquiry is persisted before it
       is emailed, so a Resend outage costs a notification, never the lead. */
    delivered: { type: Boolean, default: false },
    deliveryError: { type: String, default: "" },

    /* Kept for abuse triage and rate limiting only, never displayed. */
    userAgent: { type: String, default: "" },
    submittedFromIp: { type: String, default: "" },
  },
  { timestamps: true }
);

/* Newest-first is the only way the admin list is ever read. */
enquirySchema.index({ createdAt: -1 });

/* Supports the rate-limit count, which filters on IP and a time window. Without
   it that query scans the whole collection on every submission. */
enquirySchema.index({ submittedFromIp: 1, createdAt: -1 });

export type Enquiry = InferSchemaType<typeof enquirySchema>;

/* Module scope re-runs on hot reload and on every cold start, and calling
   `mongoose.model()` twice for one name throws OverwriteModelError. */
export const EnquiryModel: Model<Enquiry> =
  (mongoose.models.Enquiry as Model<Enquiry>) ??
  mongoose.model<Enquiry>("Enquiry", enquirySchema);
