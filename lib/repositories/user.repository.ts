import { connectDB } from "@/lib/db/connect";
import { UserModel, type User } from "@/lib/db/models/user.model";
import type { Role } from "@/lib/auth/permissions";

/**
 * Admin account persistence.
 *
 * `passwordHash` is `select: false` on the schema, so it has to be asked for
 * explicitly. Only `findByEmailWithHash` does, and it is only called from
 * `authenticate`.
 */

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  lastLoginAt: Date | null;
  disabledAt: Date | null;
  createdAt: Date;
  /** True while an invitation is outstanding and no password has been set. */
  pending: boolean;
  inviteExpiresAt: Date | null;
};

type LeanUser = User & { _id: unknown; createdAt: Date };

export function toPublicUser(document: LeanUser): PublicUser {
  return {
    id: String(document._id),
    email: document.email,
    name: document.name,
    role: document.role as Role,
    lastLoginAt: document.lastLoginAt ?? null,
    disabledAt: document.disabledAt ?? null,
    createdAt: document.createdAt,
    /* Derived from the expiry rather than stored, so it cannot disagree with
       it. An invitation that has run out is not pending, it is expired, and
       both look the same from here: no way in. */
    pending: Boolean(document.inviteExpiresAt),
    inviteExpiresAt: document.inviteExpiresAt ?? null,
  };
}

export async function findByEmailWithHash(email: string) {
  await connectDB();
  return UserModel.findOne({ email: email.trim().toLowerCase() })
    .select("+passwordHash")
    .lean();
}

/**
 * The session's own lookup. Returns the fields the Data Access Layer compares
 * against the token, and nothing else.
 */
export async function findSessionUser(id: string) {
  await connectDB();
  return UserModel.findById(id)
    .select("email name role sessionVersion disabledAt")
    .lean();
}

export async function listUsers() {
  await connectDB();
  const users = await UserModel.find().sort({ createdAt: 1 }).lean();
  return users.map((user) => toPublicUser(user as LeanUser));
}

export async function countUsers() {
  await connectDB();
  return UserModel.countDocuments();
}

export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
}) {
  await connectDB();
  const created = await UserModel.create(input);
  return toPublicUser(created.toObject() as LeanUser);
}

/** Clears the lockout counters too: a successful login ends a lockout. */
export async function recordSuccessfulLogin(id: unknown) {
  await connectDB();
  await UserModel.updateOne(
    { _id: id },
    { $set: { lastLoginAt: new Date(), failedAttempts: 0, lockedUntil: null } }
  );
}

/**
 * Counts one failure and locks the account once the threshold is crossed.
 *
 * `$inc` rather than read-then-write, so several simultaneous guesses each
 * count. A read-modify-write would let a burst of parallel attempts all read
 * the same starting value and record a single failure between them.
 */
export async function recordFailedLogin(
  id: unknown,
  options: { maxAttempts: number; lockMinutes: number }
) {
  await connectDB();
  const updated = await UserModel.findOneAndUpdate(
    { _id: id },
    { $inc: { failedAttempts: 1 } },
    { new: true, projection: "failedAttempts" }
  ).lean();

  const attempts = updated?.failedAttempts ?? 0;

  if (attempts >= options.maxAttempts) {
    await UserModel.updateOne(
      { _id: id },
      {
        $set: { lockedUntil: new Date(Date.now() + options.lockMinutes * 60_000) },
        /* Reset so the next lockout needs another full run of failures rather
           than triggering on the first attempt after one expires. */
        $unset: { failedAttempts: "" },
      }
    );
    return { locked: true, attempts };
  }

  return { locked: false, attempts };
}

export async function setUserRole(id: string, role: Role) {
  await connectDB();
  const result = await UserModel.updateOne({ _id: id }, { $set: { role } });
  return result.matchedCount > 0;
}

/**
 * Disabling also bumps `sessionVersion`, which is what actually ends access:
 * without it the account keeps working until its existing token expires.
 */
export async function setUserDisabled(id: string, disabled: boolean) {
  await connectDB();
  const result = await UserModel.updateOne(
    { _id: id },
    disabled
      ? { $set: { disabledAt: new Date() }, $inc: { sessionVersion: 1 } }
      : { $set: { disabledAt: null, failedAttempts: 0, lockedUntil: null } }
  );
  return result.matchedCount > 0;
}

/** Changing a password signs out every other device by the same mechanism. */
export async function setPasswordHash(id: string, passwordHash: string) {
  await connectDB();
  const result = await UserModel.updateOne(
    { _id: id },
    {
      $set: { passwordHash, failedAttempts: 0, lockedUntil: null },
      $inc: { sessionVersion: 1 },
    }
  );
  return result.matchedCount > 0;
}

export async function deleteUser(id: string) {
  await connectDB();
  const result = await UserModel.deleteOne({ _id: id });
  return result.deletedCount > 0;
}

/* ── Invitations ──────────────────────────────────────────────────────────── */

/**
 * Creates an account with no password and a pending invitation.
 *
 * The caller holds the raw token and puts it in a link; only its digest is
 * stored, so a database dump does not hand over working invitations.
 */
export async function createInvitedUser(input: {
  email: string;
  name: string;
  role: Role;
  inviteTokenHash: string;
  inviteExpiresAt: Date;
  invitedBy: string;
}) {
  await connectDB();
  const created = await UserModel.create({ ...input, passwordHash: "" });
  return toPublicUser(created.toObject() as LeanUser);
}

/**
 * Looks an invitation up by the digest of its token.
 *
 * By digest rather than by id, so the link carries no account identifier: a
 * `/admin/invite/<token>` URL reveals nothing about who it belongs to, and a
 * guessed id cannot be used to claim somebody else's invitation.
 *
 * The expiry is part of the query rather than checked afterwards, so an expired
 * invitation is simply not found.
 */
export async function findPendingInvite(inviteTokenHash: string) {
  await connectDB();
  return UserModel.findOne({
    inviteTokenHash,
    inviteExpiresAt: { $gt: new Date() },
    disabledAt: null,
  })
    .select("email name role sessionVersion")
    .lean();
}

/**
 * Sets the password an invited person chose and closes the invitation.
 *
 * The invite fields are cleared in the same update, so the link is single-use:
 * a second visit finds nothing. Guarded on `inviteTokenHash` so two tabs racing
 * cannot both succeed, and returns null when the invitation has already gone.
 */
export async function redeemInvite(inviteTokenHash: string, passwordHash: string) {
  await connectDB();
  const updated = await UserModel.findOneAndUpdate(
    { inviteTokenHash, inviteExpiresAt: { $gt: new Date() } },
    {
      $set: {
        passwordHash,
        inviteTokenHash: "",
        inviteExpiresAt: null,
        failedAttempts: 0,
        lockedUntil: null,
      },
    },
    { new: true, projection: "email name role sessionVersion" }
  ).lean();

  return updated;
}

/** Issues a fresh invitation for an account that never redeemed its first. */
export async function reissueInvite(
  id: string,
  inviteTokenHash: string,
  inviteExpiresAt: Date
) {
  await connectDB();
  const result = await UserModel.updateOne(
    /* Only for an account with no password: re-inviting somebody who has
       already set one would be a password reset wearing an invitation's
       clothes, and that needs its own deliberate flow. */
    { _id: id, passwordHash: "" },
    { $set: { inviteTokenHash, inviteExpiresAt } }
  );
  return result.matchedCount > 0;
}

export async function cancelInvite(id: string) {
  await connectDB();
  const result = await UserModel.updateOne(
    { _id: id, passwordHash: "" },
    { $set: { inviteTokenHash: "", inviteExpiresAt: null } }
  );
  return result.matchedCount > 0;
}
