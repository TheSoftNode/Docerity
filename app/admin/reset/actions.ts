"use server";

import { redirect } from "next/navigation";

import { createInviteToken, hashInviteToken } from "@/lib/auth/invite";
import { RESET_THROTTLE_MS, RESET_TTL_MS, looksLikeEmail, resetExpiry, resetUrl } from "@/lib/auth/reset";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { homeFor, type Role } from "@/lib/auth/permissions";
import { completePasswordReset, startPasswordReset } from "@/lib/repositories/user.repository";
import { validatePassword } from "@/lib/services/auth.service";
import { sendMail } from "@/lib/email/mailer";
import { renderPasswordReset } from "@/lib/email/templates/password-reset";
import { database, runtime } from "@/lib/config/env";
import { isAppError } from "@/lib/core/errors";
import { createLogger } from "@/lib/core/logger";

/**
 * Forgotten passwords: asking for a link, and using it.
 *
 * Asking always gets the same answer, whether or not the address has an
 * account, so the form cannot be used to find out who has one. The link is
 * emailed to the account's own address and nowhere else, works once, and
 * lasts an hour; using it signs out every other device.
 */

const logger = createLogger("auth.reset");

export type ForgotState = { sent?: boolean; message?: string; email?: string } | undefined;
export type ResetState = { message?: string } | undefined;

export async function requestPasswordReset(_state: ForgotState, formData: FormData): Promise<ForgotState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!looksLikeEmail(email)) return { message: "Enter the email address you sign in with.", email };
  if (!database.isConfigured) return { message: "The admin has no database connection, so there are no accounts to reset." };

  try {
    const token = createInviteToken();
    const user = await startPasswordReset(email, hashInviteToken(token), resetExpiry(), RESET_THROTTLE_MS);

    if (user) {
      const mail = renderPasswordReset({ name: user.name, url: resetUrl(runtime.siteUrl, token), minutes: RESET_TTL_MS / 60_000 });
      const delivery = await sendMail({ to: user.email, subject: mail.subject, html: mail.html, text: mail.text });
      if (!delivery.ok) logger.error("password reset email failed", new Error(delivery.error), { userId: String(user._id) });
      else logger.info("password reset sent", { userId: String(user._id) });
    }
  } catch (error) {
    logger.error("password reset request failed", error);
    return { message: "That did not work. Please try again in a moment.", email };
  }

  return { sent: true, email };
}

export async function resetPassword(_state: ResetState, formData: FormData): Promise<ResetState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  let session;

  try {
    if (!token) return { message: "That reset link is incomplete." };

    validatePassword(password);
    if (password !== confirm) return { message: "Those two passwords do not match." };

    /* The token is checked here, not only on the page: this is a POST endpoint
       somebody can call directly with any token they like. */
    const user = await completePasswordReset(hashInviteToken(token), await hashPassword(password));
    if (!user) return { message: "That reset link has already been used or has expired. Ask for a new one." };

    logger.info("password reset completed", { userId: String(user._id) });
    session = { userId: String(user._id), role: user.role as Role, sessionVersion: user.sessionVersion ?? 1 };
  } catch (error) {
    if (isAppError(error)) return { message: error.publicMessage };
    logger.error("completing a password reset failed", error);
    return { message: "That did not work. Please try again." };
  }

  /* Signed straight in: they have just proved they can read the account's
     email and chosen a new password, so asking for it again adds nothing. */
  await createSession(session);
  redirect(homeFor(session.role));
}
