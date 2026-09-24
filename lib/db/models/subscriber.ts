import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const subscriberSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 320,
      /* Re-subscribing must not create a duplicate row, and the unique index
         is what makes that a database guarantee rather than a race between
         "find" and "insert". */
      unique: true,
    },
    status: {
      type: String,
      enum: ["subscribed", "unsubscribed"],
      default: "subscribed",
    },
    /* An unguessable token so the unsubscribe link needs no login and reveals
       nothing about other subscribers. CAN-SPAM and GDPR both expect a
       one-click exit. */
    unsubscribeToken: { type: String, required: true, index: true },
    source: { type: String, default: "site" },
    unsubscribedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type Subscriber = InferSchemaType<typeof subscriberSchema>;

export const SubscriberModel: Model<Subscriber> =
  (mongoose.models.Subscriber as Model<Subscriber>) ??
  mongoose.model<Subscriber>("Subscriber", subscriberSchema);
