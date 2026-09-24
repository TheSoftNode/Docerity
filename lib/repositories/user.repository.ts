import { connectDB } from "@/lib/db/connect";
import { UserModel, type User } from "@/lib/db/models/user.model";

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
  role: "owner" | "editor";
  lastLoginAt: Date | null;
  disabledAt: Date | null;
  createdAt: Date;
};

type LeanUser = User & { _id: unknown; createdAt: Date };

export function toPublicUser(document: LeanUser): PublicUser {
  return {
    id: String(document._id),
    email: document.email,
    name: document.name,
    role: document.role,
    lastLoginAt: document.lastLoginAt ?? null,
    disabledAt: document.disabledAt ?? null,
    createdAt: document.createdAt,
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
  role: "owner" | "editor";
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

export async function setUserRole(id: string, role: "owner" | "editor") {
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
