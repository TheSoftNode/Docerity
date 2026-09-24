import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * Admin accounts. There is no public sign-up: the first account is created by
 * `scripts/create-admin.mjs` against the database directly, and further ones
 * are invited from inside the admin area.
 *
 * That is deliberate. An open `/register` on a single-operator site is a
 * liability with no upside, and it is the one route that cannot be protected
 * by the session check that guards everything else.
 */

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 320,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },

    /* The scrypt digest, salt and parameters in one string; never a password.
       `select: false` keeps it out of every query that does not ask for it by
       name, so a future `findOne()` whose result is passed to the client
       cannot leak it by accident. */
    passwordHash: { type: String, required: true, select: false },

    /*
      `owner` can manage other accounts; `editor` can write and publish content
      and moderate reviews but cannot touch users. Two roles rather than a
      permission matrix, because a third would be invented to justify the
      matrix rather than because anyone needed it.
    */
    role: {
      type: String,
      enum: ["owner", "editor"],
      default: "editor",
      required: true,
    },

    /*
      Lockout state. Counting failures per account (not just per IP) is what
      makes a slow distributed guess expensive: an attacker rotating IPs still
      only gets `MAX_FAILED_ATTEMPTS` tries at a given address before it stops
      answering, regardless of where the attempts come from.
    */
    failedAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },

    lastLoginAt: { type: Date, default: null },

    /*
      Bumped when the password changes or every session is revoked. It is part
      of the session token, and `verifySession` rejects a token whose value
      disagrees with the stored one, which is how "sign out everywhere" works
      without a session table to delete rows from.
    */
    sessionVersion: { type: Number, default: 1 },

    disabledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel: Model<User> =
  (mongoose.models.User as Model<User>) ?? mongoose.model<User>("User", userSchema);
