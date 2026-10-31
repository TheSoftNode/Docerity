import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * Accounts for clients and applicants: the people the work is for, not the
 * people doing it.
 *
 * Kept in their own collection rather than as a role on admin users, so no bug
 * in either side's permissions can carry a client into the admin area or an
 * admin session into the portal. They sign in with their own cookie, too.
 *
 * Projects are matched to an account by email, which is why the address must
 * be verified before anything is shown: without it, anybody could sign up as a
 * client's address and read their project.
 */
const clientAccountSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 320 },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    company: { type: String, default: "", trim: true, maxlength: 160 },

    /* The scrypt digest; never a password, and never selected unless asked for by name. */
    passwordHash: { type: String, default: "", select: false },

    /* Null until the emailed link is followed; nothing private is shown before then. */
    emailVerifiedAt: { type: Date, default: null },
    /* SHA-256 digests of emailed tokens, so a database backup holds no working links. */
    verifyTokenHash: { type: String, default: "", select: false },
    verifyExpiresAt: { type: Date, default: null },
    verifySentAt: { type: Date, default: null },
    resetTokenHash: { type: String, default: "", select: false },
    resetExpiresAt: { type: Date, default: null },
    resetRequestedAt: { type: Date, default: null },

    /* The same lockout the admin has: five wrong passwords and the account waits. */
    failedAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },

    /* In the session token; bumped to sign out every device at once. */
    sessionVersion: { type: Number, default: 1 },
    disabledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export type ClientAccount = InferSchemaType<typeof clientAccountSchema>;

export const ClientAccountModel: Model<ClientAccount> =
  (mongoose.models.ClientAccount as Model<ClientAccount>) ??
  mongoose.model<ClientAccount>("ClientAccount", clientAccountSchema);
