import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * An editable page section, stored as one document per section.
 *
 * Deliberately schemaless in the `data` field, which is unusual here: every
 * other model declares its shape. The alternative was eight collections, eight
 * models, eight repositories and eight editors for what is the same thing each
 * time, a named group of records with a few short text fields.
 *
 * The shape is not unchecked, it is just checked somewhere else.
 * `lib/content/blocks/schema.ts` describes every field of every section, and
 * `cleanBlock` rebuilds a document from that description before it is written:
 * a field the description does not mention cannot survive a save, whatever was
 * posted. Putting that in Mongoose instead would mean the editor and the
 * database each carrying half the truth.
 */

const siteContentSchema = new Schema(
  {
    /*
      One of `BLOCK_KEYS`. Unique because a section has one version, and the
      index is what makes the upsert on save atomic rather than a read followed
      by a write that two saves could interleave.
    */
    key: { type: String, required: true, unique: true, trim: true, maxlength: 60 },

    /* `Schema.Types.Mixed`, and `minimize: false` below so an empty group is
       stored as an empty array rather than dropped: the editor needs to know
       the group exists and is empty, which is different from absent. */
    data: { type: Schema.Types.Mixed, required: true, default: {} },

    /* Who last changed it. An email rather than a reference, because the
       useful question is "who wrote this copy" and that answer should survive
       the account being deleted. */
    updatedBy: { type: String, default: "", maxlength: 200 },
  },
  { timestamps: true, minimize: false }
);

export type SiteContentDocument = InferSchemaType<typeof siteContentSchema>;

export const SiteContentModel: Model<SiteContentDocument> =
  (mongoose.models.SiteContent as Model<SiteContentDocument>) ??
  mongoose.model<SiteContentDocument>("SiteContent", siteContentSchema);
