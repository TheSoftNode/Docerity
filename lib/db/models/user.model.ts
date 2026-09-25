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

    /*
      The scrypt digest, salt and parameters in one string; never a password.
      `select: false` keeps it out of every query that does not ask for it by
      name, so a future `findOne()` whose result is passed to the client cannot
      leak it by accident.

      Not required, because an invited account exists before its owner has
      chosen a password. `authenticate` refuses to sign in an account without
      one rather than comparing against an empty string.
    */
    passwordHash: { type: String, default: "", select: false },

    /*
      What this account may do. The rules themselves live in
      `lib/auth/permissions.ts` rather than being re-derived at each call site.

      `contributor` exists because "editor" was too much to hand a mentee. An
      editor can read every client enquiry, with budgets and attachments, see
      the subscriber list, and publish straight to the live blog. A contributor
      writes their own posts and submits them, and sees nothing else.
    */
    role: {
      type: String,
      enum: ["owner", "editor", "contributor"],
      default: "contributor",
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
      A pending invitation.

      Stored as a SHA-256 digest, not the token itself. The token is what a link
      in somebody's inbox carries, so a leaked database backup would otherwise
      hand over working invitations. A plain digest rather than scrypt is right
      here and wrong for a password: this value is 32 random bytes, so there is
      no dictionary to run against it.

      The alternative was creating the account with a password you invent and
      message to them, which trains everybody involved to send credentials
      through chat.
    */
    inviteTokenHash: { type: String, default: "", select: false },
    inviteExpiresAt: { type: Date, default: null },
    invitedBy: { type: String, default: "" },

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
