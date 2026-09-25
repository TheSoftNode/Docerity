import { database } from "@/lib/config/env";
import { RateLimitError, ServiceUnavailableError, ValidationError } from "@/lib/core/errors";
import { createLogger } from "@/lib/core/logger";
import { DUMMY_HASH_PROMISE, verifyPassword } from "@/lib/auth/password";
import {
  findByEmailWithHash,
  recordFailedLogin,
  recordSuccessfulLogin,
} from "@/lib/repositories/user.repository";
import type { SessionPayload } from "@/lib/auth/session";
import type { Role } from "@/lib/auth/permissions";

/**
 * Credential checking, and the counting that makes guessing expensive.
 *
 * Kept out of the Server Action so the rules can be tested without a request,
 * and so the action stays a thin adapter between a form and this.
 */

const logger = createLogger("auth.service");

export const LOGIN_POLICY = {
  maxAttempts: 5,
  lockMinutes: 15,
  minPasswordLength: 12,
} as const;

/*
  One message for every failure.

  "No account with that address" and "Wrong password" are separately useful to
  someone who has forgotten which address they used, and separately useful to
  someone working through a list of leaked addresses to find which ones are
  admins here. The second consideration wins on a site with one operator who
  knows their own email.
*/
const GENERIC_FAILURE = "That email and password don't match an account.";

export type AuthResult =
  | { ok: true; session: SessionPayload; name: string }
  | { ok: false; message: string };

export async function authenticate(
  email: string,
  password: string
): Promise<AuthResult> {
  if (!database.isConfigured) {
    throw new ServiceUnavailableError(
      "The admin area needs a database connection. Set MONGODB_URI and try again."
    );
  }

  const normalised = email.trim().toLowerCase();
  if (!normalised || !password) {
    return { ok: false, message: GENERIC_FAILURE };
  }

  const user = await findByEmailWithHash(normalised);

  /*
    No early return for an unknown address. Verifying against a throwaway hash
    costs the same scrypt work as a real check, so the response time does not
    separate "no such account" from "wrong password". Returning here instead
    would turn the login form into an account enumerator with no rate limit,
    because a failure that never reaches the database is never counted.
  */
  if (!user) {
    await verifyPassword(password, await DUMMY_HASH_PROMISE);
    logger.warn("login attempt for unknown address", { email: normalised });
    return { ok: false, message: GENERIC_FAILURE };
  }

  if (user.disabledAt) {
    await verifyPassword(password, await DUMMY_HASH_PROMISE);
    logger.warn("login attempt on disabled account", { userId: String(user._id) });
    return { ok: false, message: GENERIC_FAILURE };
  }

  /*
    An invited account that has not been set up yet.

    `verifyPassword` against an empty digest already returns false, but doing it
    explicitly matters: otherwise each attempt counts toward the lockout, so
    somebody typing a password into an account they have not claimed locks
    themselves out of the invitation they are about to use.
  */
  if (!user.passwordHash) {
    await verifyPassword(password, await DUMMY_HASH_PROMISE);
    logger.warn("login attempt on an account with a pending invitation", {
      userId: String(user._id),
    });
    return { ok: false, message: GENERIC_FAILURE };
  }

  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    const seconds = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000);
    /*
      This one does say what happened, because the alternative is worse: the
      real owner, locked out by somebody else's guessing, would keep entering a
      correct password and keep being told it is wrong. A lockout is only
      useful if it is visible, and it reveals nothing that five failed attempts
      have not already established.
    */
    throw new RateLimitError(
      `Too many failed attempts. Try again in ${Math.ceil(seconds / 60)} minutes.`,
      seconds
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);

  if (!valid) {
    const { locked } = await recordFailedLogin(user._id, {
      maxAttempts: LOGIN_POLICY.maxAttempts,
      lockMinutes: LOGIN_POLICY.lockMinutes,
    });
    logger.warn("failed login", { userId: String(user._id), locked });

    if (locked) {
      throw new RateLimitError(
        `Too many failed attempts. Try again in ${LOGIN_POLICY.lockMinutes} minutes.`,
        LOGIN_POLICY.lockMinutes * 60
      );
    }

    return { ok: false, message: GENERIC_FAILURE };
  }

  await recordSuccessfulLogin(user._id);
  logger.info("login succeeded", { userId: String(user._id) });

  return {
    ok: true,
    name: user.name,
    session: {
      userId: String(user._id),
      role: user.role as Role,
      sessionVersion: user.sessionVersion ?? 1,
    },
  };
}

/**
 * Password rules, applied when an account is created or its password changed.
 *
 * Length only, with no character-class requirements. Those push people toward
 * `Password1!` while a long passphrase scores worse, and NIST's own guidance
 * has recommended against composition rules since SP 800-63B.
 */
export function validatePassword(password: string): void {
  if (password.length < LOGIN_POLICY.minPasswordLength) {
    throw new ValidationError(
      `Use at least ${LOGIN_POLICY.minPasswordLength} characters.`,
      { fields: { password: `At least ${LOGIN_POLICY.minPasswordLength} characters.` } }
    );
  }
  if (password.length > 200) {
    throw new ValidationError("That password is too long.", {
      fields: { password: "Keep it under 200 characters." },
    });
  }
}
