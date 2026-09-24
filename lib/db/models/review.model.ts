import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const reviewLinkSchema = new Schema(
  {
    title: { type: String, required: true, maxlength: 80 },
    url: { type: String, required: true, maxlength: 500 },
  },
  { _id: false }
);

const reviewSchema = new Schema(
  {
    /* Field names follow the portfolio's `review.model.ts` closely enough that
       existing documents can be migrated with a rename, but `userPhoto`'s
       "default.jpg" sentinel is gone: an empty string means "no photo", and the
       UI falls back to initials rather than to a file that may not exist. */
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    rating: { type: Number, min: 1, max: 5, required: true },
    /* A Cloudinary public_id, not a URL — the same reasoning as enquiry
       attachments: the durable fact is the identifier, and a delivery URL is
       derived from it. Empty means no photo, and the UI falls back to
       initials rather than to a "default.jpg" that may not exist. */
    photoPublicId: { type: String, default: "" },
    links: { type: [reviewLinkSchema], default: [] },

    /*
      The gate the portfolio backend never had. `createReview` there was
      `Model.create(req.body)` on an open POST, so anything submitted appeared
      on the live site immediately — spam, abuse, or a competitor's ad.

      Nothing is public until it is explicitly approved. `getPublicReviews`
      is the only read path the site uses and it filters on this field.
    */
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },

    /* Contact address for the submitter, never rendered publicly and never
       included in `listPublished`'s projection. Lets you verify a testimonial
       is real before approving it. */
    contactEmail: { type: String, default: "", lowercase: true, trim: true },

    moderatedAt: { type: Date, default: null },
    submittedFromIp: { type: String, default: "" },
  },
  { timestamps: true }
);

/* The public query is always status + newest-first; the admin queue is the
   same index read with a different status. */
reviewSchema.index({ status: 1, createdAt: -1 });

export type Review = InferSchemaType<typeof reviewSchema>;

export const ReviewModel: Model<Review> =
  (mongoose.models.Review as Model<Review>) ??
  mongoose.model<Review>("Review", reviewSchema);
