import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * One-time invitation tokens.
 *
 * The alternative, and what the first version of the accounts page did, was for
 * the owner to invent a password, type it into a form, and send it to the
 * person over whatever chat they use. That trains everybody involved to treat
 * credentials as something you paste into a message, and it means the new
 * account's password is known to two people from the start.
 *
 * Here the owner gets a link, the person sets their own password, and nothing
 * secret is ever in a message that outlives the invitation.
 */

/* Three days. Long enough to survive a weekend, short enough that a link
   forwarded and forgotten stops working. */
export const INVITE_TTL_MS = 72 * 60 * 60 * 1000;

/** 32 random bytes, base64url, so it is safe in a path segment. */
export function createInviteToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * SHA-256, not scrypt.
 *
 * scrypt is deliberately slow because a password is low-entropy and worth
 * grinding against. This value is 32 bytes from a CSPRNG, so there is no
 * dictionary and nothing to grind; a slow hash here would only make every
 * invitation lookup cost 100ms.
 */
export function hashInviteToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Constant-time comparison, for the rare caller that compares two digests
 * directly rather than querying by one.
 */
export function inviteTokensMatch(a: string, b: string): boolean {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  if (left.length !== right.length || left.length === 0) return false;
  return timingSafeEqual(left, right);
}

export function inviteExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + INVITE_TTL_MS);
}

/** The link the owner copies. Absolute, because it is pasted into a message. */
export function inviteUrl(siteUrl: string, token: string): string {
  return `${siteUrl.replace(/\/$/, "")}/admin/invite/${token}`;
}
