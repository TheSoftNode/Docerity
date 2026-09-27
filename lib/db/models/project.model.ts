import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * A piece of work: what the /work page lists and the homepage features.
 *
 * The first version of this model was written before anything used it, and it
 * guessed at the shape. It has been rewritten to match what the pages actually
 * render, which is `Project` in `components/sections/work/work-data.ts`: that
 * file is still the fallback when the database is unreachable, so the two have
 * to agree field for field or a fallback render would differ from a live one.
 *
 * The notable renames from the guess: `categories` became `groups`, which is
 * what the filter buckets are called, and `stack` became `tags`, which is what
 * the cards call them. `category` is now a separate display string, because
 * "AI · Learning platform" is a caption rather than a facet.
 */

/* A written case study, where one exists. Most projects do not have one, and
   the detail page renders the facts alone rather than inventing a narrative. */
const caseStudySectionSchema = new Schema(
  {
    heading: { type: String, required: true, trim: true, maxlength: 200 },
    paragraphs: { type: [String], default: [] },
  },
  { _id: false }
);

/*
  The card's screenshot.

  Two sources, because there are two eras of project. `publicId` is a Cloudinary
  asset uploaded through the admin; `src` is a path under `public/`, which is
  where the twenty-five imported ones live. Whichever is set wins, and neither
  being set falls back to the generated SVG preview, so a project is always
  presentable.
*/
const mediaSchema = new Schema(
  {
    type: { type: String, enum: ["image", "video"], default: "image" },
    publicId: { type: String, default: "" },
    src: { type: String, default: "" },
    alt: { type: String, default: "", maxlength: 300 },
    /* Video only: the still shown before playback. */
    poster: { type: String, default: "" },
  },
  { _id: false }
);

const projectSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      /* Unique because it is the URL at /work/<slug>. */
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens."],
    },

    name: { type: String, required: true, trim: true, maxlength: 200 },

    /* The caption under the name, such as "AI · Learning platform". A sentence
       fragment, not a facet: the filterable buckets are `groups`. */
    category: { type: String, default: "", trim: true, maxlength: 160 },

    /*
      Filter buckets on the work page. A project can sit in more than one, and
      several genuinely do: a hackathon build is often Web3 and Full-stack too.
      The filter UI derives its list from whatever is in use rather than from a
      fixed enum, so a new bucket needs no code change.
    */
    groups: { type: [String], default: [] },

    description: { type: String, required: true, trim: true, maxlength: 4000 },

    /* The technologies on the card. */
    tags: { type: [String], default: [] },

    /*
      A fact, not a claim.

      The placeholder projects this replaced carried invented metrics like
      "40% faster close", which is a liability the first time a prospect asks
      about one. Status is checkable.
    */
    status: {
      type: String,
      enum: ["Live", "In progress", "On hold"],
      default: "Live",
      required: true,
    },

    /* Which generated SVG stands in when there is no screenshot. */
    preview: {
      type: String,
      enum: ["dashboard", "grid", "list"],
      default: "dashboard",
    },

    liveUrl: { type: String, default: "", maxlength: 500 },
    repoUrl: { type: String, default: "", maxlength: 500 },

    media: { type: mediaSchema, default: null },

    /* The homepage shows the featured ones; /work shows everything published. */
    featured: { type: Boolean, default: false },

    /*
      Whether it appears on the site at all.

      A separate field from `status`, which is the project's real-world state
      (Live, In progress, On hold) and is shown on the card. A project can be
      "Live" in the world and unpublished here because the write-up is not
      ready.
    */
    published: { type: Boolean, default: false },

    /*
      Manual ordering for the grid, ties broken by creation.

      The display index ("01", "02") is derived from this at render rather than
      stored, so reordering does not mean renumbering every row by hand.
    */
    sortOrder: { type: Number, default: 0 },

    /* Case study fields, all optional. */
    role: { type: String, default: "", maxlength: 200 },
    timeline: { type: String, default: "", maxlength: 120 },
    results: { type: [String], default: [] },
    body: { type: [caseStudySectionSchema], default: [] },

    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

/* The public list, and the homepage's featured subset. */
projectSchema.index({ published: 1, sortOrder: 1, createdAt: -1 });
projectSchema.index({ featured: 1, sortOrder: 1 });

export type ProjectDocument = InferSchemaType<typeof projectSchema>;

export const ProjectModel: Model<ProjectDocument> =
  (mongoose.models.Project as Model<ProjectDocument>) ??
  mongoose.model<ProjectDocument>("Project", projectSchema);
