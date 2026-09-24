import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * Blog posts: explainers and articles.
 *
 * Both live in one collection with a `type` discriminator, because they share
 * every field that matters (slug, title, hook, tags, body sections) and differ
 * only in the header the page renders. Two collections would mean two
 * repositories, two editors and two sitemap queries to produce one list.
 *
 * The shape follows `components/sections/blog/blog-data.ts`, which is still the
 * fallback when the database is unreachable, so `lib/content/posts.ts` can map
 * a document onto exactly what the existing components already render.
 */

/*
  A section is a heading plus paragraphs, not a blob of markdown or HTML.

  Storing HTML would mean either trusting it into `dangerouslySetInnerHTML` or
  sanitising it on every render, and markdown would mean shipping a parser to
  the client. The structure the article template renders is genuinely this
  small, and a string array of paragraphs cannot carry a script tag.
*/
const sectionSchema = new Schema(
  {
    heading: { type: String, required: true, trim: true, maxlength: 200 },
    paragraphs: {
      type: [String],
      required: true,
      /* An empty section renders as a heading with nothing under it, which
         reads as a truncated page rather than a deliberate one. */
      validate: {
        validator: (value: string[]) => value.length > 0 && value.some((p) => p.trim()),
        message: "A section needs at least one paragraph.",
      },
    },
    /* The pulled-aside analogy. Optional, and the one thing that makes an
       explainer read like an explainer rather than documentation. */
    sidenote: { type: String, default: "", maxlength: 1000 },
    media: {
      type: new Schema(
        {
          type: { type: String, enum: ["image", "video"], required: true },
          alt: { type: String, default: "" },
          caption: { type: String, default: "" },
        },
        { _id: false }
      ),
      default: null,
    },
  },
  { _id: false }
);

/* Concept and analogy on an explainer: the pair the index page tickers. */
const termSchema = new Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 120 },
    caption: { type: String, required: true, trim: true, maxlength: 200 },
    /* A name from `lib/content/icons.ts`, never a component. */
    iconName: { type: String, required: true, maxlength: 60 },
  },
  { _id: false }
);

const postSchema = new Schema(
  {
    type: { type: String, enum: ["explainer", "article"], required: true },

    slug: {
      type: String,
      required: true,
      /* Unique because it is the URL. A duplicate would make one of the two
         posts unreachable, and which one depends on insertion order. */
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens."],
    },

    title: { type: String, required: true, trim: true, maxlength: 200 },
    /* The one sentence that makes somebody open it. */
    hook: { type: String, required: true, trim: true, maxlength: 400 },
    tags: { type: [String], default: [] },

    /*
      Stored rather than computed at render time.

      Computing it from word count is tempting, but "4 min read" on an
      explainer with three diagrams is wrong in a way the author can see and
      the formula cannot. `estimateReadTime` fills it in as a starting point
      and the editor can override it.
    */
    readTime: { type: String, default: "", maxlength: 40 },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      required: true,
    },

    /*
      When it went public, not when the row was created.

      Separate from `createdAt` because a draft written in January and
      published in March is a March post, and because backdating an imported
      post has to be possible. Null until first published.
    */
    publishedAt: { type: Date, default: null },

    body: { type: [sectionSchema], default: [] },

    /* Explainer only. Required at the application layer rather than here,
       because Mongoose cannot express "required when type is explainer"
       without a discriminator per type, and that costs more than it saves. */
    concept: { type: termSchema, default: null },
    analogy: { type: termSchema, default: null },

    /* Article only. */
    topic: { type: String, default: "", maxlength: 120 },
    iconName: { type: String, default: "", maxlength: 60 },

    /* Who last saved it. Useful the moment there is more than one editor. */
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

/* The public list: published, newest first. The partial filter keeps drafts out
   of the index entirely rather than scanning past them. */
postSchema.index(
  { status: 1, publishedAt: -1 },
  { partialFilterExpression: { status: "published" } }
);

/* The admin list, which shows drafts and published together. */
postSchema.index({ updatedAt: -1 });

export type PostDocument = InferSchemaType<typeof postSchema>;

export const PostModel: Model<PostDocument> =
  (mongoose.models.Post as Model<PostDocument>) ??
  mongoose.model<PostDocument>("Post", postSchema);

/**
 * A starting estimate at 200 words per minute, rounded up.
 *
 * 200 rather than the 250 usually quoted: this is technical writing that people
 * stop and reread, and an estimate that runs short is more annoying than one
 * that runs long.
 */
export function estimateReadTime(body: { paragraphs: string[] }[]): string {
  const words = body.reduce(
    (total, section) =>
      total + section.paragraphs.join(" ").trim().split(/\s+/).filter(Boolean).length,
    0
  );
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}
