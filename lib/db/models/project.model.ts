import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const projectSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    /* A project can be both "Fullstack" and "AI", as the portfolio data
       already models it. */
    categories: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["live", "in-progress", "on-hold", "archived"],
      default: "live",
    },
    description: { type: String, required: true, maxlength: 4000 },
    /* Screenshots live in Blob storage, not in the repo. The portfolio carries
       40MB of them in `public/work`, which inflates every clone and deploy. */
    imageUrl: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    liveUrl: { type: String, default: "" },
    repoUrl: { type: String, default: "" },
    stack: { type: [String], default: [] },
    /* Manual ordering for the work grid; ties break on createdAt. */
    sortOrder: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

projectSchema.index({ published: 1, sortOrder: 1, createdAt: -1 });

export type Project = InferSchemaType<typeof projectSchema>;

export const ProjectModel: Model<Project> =
  (mongoose.models.Project as Model<Project>) ??
  mongoose.model<Project>("Project", projectSchema);
