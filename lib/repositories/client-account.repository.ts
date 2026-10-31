import { connectDB } from "@/lib/db/connect";
import { ClientAccountModel } from "@/lib/db/models/client-account.model";

/*
  Client accounts. Every write that checks and changes in one step does it in
  a single guarded update, so two requests at once cannot both succeed.
*/

const normalise = (email: string) => email.trim().toLowerCase();

export async function findAccountByEmailWithHash(email: string) {
  await connectDB();
  return ClientAccountModel.findOne({ email: normalise(email) }).select("+passwordHash").lean();
}

export async function findAccountForSession(id: string) {
  await connectDB();
  return ClientAccountModel.findById(id).select("email name company emailVerifiedAt sessionVersion disabledAt createdAt").lean();
}

/** Creates an unverified account, or returns null if the address is taken. */
export async function createAccount(input: {
  email: string;
  name: string;
  company: string;
  passwordHash: string;
  verifyTokenHash: string;
  verifyExpiresAt: Date;
}) {
  await connectDB();
  try {
    const created = await ClientAccountModel.create({ ...input, email: normalise(input.email), verifySentAt: new Date() });
    return { id: String(created._id), email: created.email, name: created.name };
  } catch (error) {
    if ((error as { code?: number }).code === 11000) return null;
    throw error;
  }
}

/** A fresh verification link for an unverified account, at most once per `throttleMs`. */
export async function reissueVerification(email: string, verifyTokenHash: string, verifyExpiresAt: Date, throttleMs: number) {
  await connectDB();
  const now = new Date();
  return ClientAccountModel.findOneAndUpdate(
    {
      email: normalise(email),
      emailVerifiedAt: null,
      disabledAt: null,
      $or: [{ verifySentAt: null }, { verifySentAt: { $lte: new Date(now.getTime() - throttleMs) } }],
    },
    { $set: { verifyTokenHash, verifyExpiresAt, verifySentAt: now } },
    { new: true, projection: "email name" }
  ).lean();
}

/** Marks the address verified and closes the link, which then works no more. */
export async function verifyAccountEmail(verifyTokenHash: string) {
  await connectDB();
  return ClientAccountModel.findOneAndUpdate(
    { verifyTokenHash, verifyExpiresAt: { $gt: new Date() }, disabledAt: null },
    { $set: { emailVerifiedAt: new Date(), verifyTokenHash: "", verifyExpiresAt: null } },
    { new: true, projection: "email name sessionVersion" }
  ).lean();
}

export async function recordAccountLogin(id: unknown) {
  await connectDB();
  await ClientAccountModel.updateOne({ _id: id }, { $set: { lastLoginAt: new Date(), failedAttempts: 0, lockedUntil: null } });
}

/** One failure, counted atomically; locks the account once the threshold is reached. */
export async function recordAccountFailure(id: unknown, options: { maxAttempts: number; lockMinutes: number }) {
  await connectDB();
  const updated = await ClientAccountModel.findOneAndUpdate({ _id: id }, { $inc: { failedAttempts: 1 } }, { new: true, projection: "failedAttempts" }).lean();
  const attempts = updated?.failedAttempts ?? 0;
  if (attempts >= options.maxAttempts) {
    await ClientAccountModel.updateOne(
      { _id: id },
      { $set: { lockedUntil: new Date(Date.now() + options.lockMinutes * 60_000) }, $unset: { failedAttempts: "" } }
    );
    return { locked: true };
  }
  return { locked: false };
}

export async function startAccountReset(email: string, resetTokenHash: string, resetExpiresAt: Date, throttleMs: number) {
  await connectDB();
  const now = new Date();
  return ClientAccountModel.findOneAndUpdate(
    {
      email: normalise(email),
      disabledAt: null,
      $or: [{ resetRequestedAt: null }, { resetRequestedAt: { $lte: new Date(now.getTime() - throttleMs) } }],
    },
    { $set: { resetTokenHash, resetExpiresAt, resetRequestedAt: now } },
    { new: true, projection: "email name" }
  ).lean();
}

export async function findPendingAccountReset(resetTokenHash: string) {
  await connectDB();
  return ClientAccountModel.findOne({ resetTokenHash, resetExpiresAt: { $gt: new Date() }, disabledAt: null }).select("email name").lean();
}

/**
 * Sets the new password and closes the reset. Following a reset link proves
 * the address, so it also verifies it. Every other device is signed out.
 */
export async function completeAccountReset(resetTokenHash: string, passwordHash: string) {
  await connectDB();
  const now = new Date();
  const account = await ClientAccountModel.findOneAndUpdate(
    { resetTokenHash, resetExpiresAt: { $gt: now }, disabledAt: null },
    {
      $set: { passwordHash, resetTokenHash: "", resetExpiresAt: null, failedAttempts: 0, lockedUntil: null },
      $inc: { sessionVersion: 1 },
    },
    { new: true, projection: "email name sessionVersion emailVerifiedAt" }
  ).lean();
  if (account && !account.emailVerifiedAt) {
    await ClientAccountModel.updateOne({ _id: account._id }, { $set: { emailVerifiedAt: now } });
  }
  return account;
}

export async function updateAccountProfile(id: string, input: { name: string; company: string }) {
  await connectDB();
  await ClientAccountModel.updateOne({ _id: id }, { $set: { name: input.name.trim(), company: input.company.trim() } });
}

/** Whether the address has a verified account, for the admin's view of a project. */
export async function accountStatusFor(email: string): Promise<"verified" | "unverified" | "none"> {
  await connectDB();
  const account = await ClientAccountModel.findOne({ email: normalise(email) }).select("emailVerifiedAt").lean();
  if (!account) return "none";
  return account.emailVerifiedAt ? "verified" : "unverified";
}

export async function countAccounts() {
  await connectDB();
  const [total, verified] = await Promise.all([
    ClientAccountModel.countDocuments({}),
    ClientAccountModel.countDocuments({ emailVerifiedAt: { $ne: null } }),
  ]);
  return { total, verified };
}
