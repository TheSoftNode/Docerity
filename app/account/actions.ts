"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { createInviteToken, hashInviteToken } from "@/lib/auth/invite";
import { DUMMY_HASH_PROMISE, hashPassword, verifyPassword } from "@/lib/auth/password";
import { looksLikeEmail } from "@/lib/auth/reset";
import { ACCOUNT_PASSWORD_MIN, validateSignup } from "@/lib/account/rules";
import { createAccountSession, destroyAccountSession, getCurrentAccount, safeAccountPath } from "@/lib/account/session";
import {
  completeAccountReset,
  createAccount,
  findAccountByEmailWithHash,
  recordAccountFailure,
  recordAccountLogin,
  reissueVerification,
  startAccountReset,
  updateAccountProfile,
  verifyAccountEmail,
} from "@/lib/repositories/client-account.repository";
import { addClientReply } from "@/lib/repositories/client-project.repository";
import { sendMail } from "@/lib/email/mailer";
import { renderAccountReset, renderClientReplyNotice, renderVerifyEmail } from "@/lib/email/templates/account";
import { database, email as emailConfig, runtime } from "@/lib/config/env";
import { createLogger } from "@/lib/core/logger";
import { isAppError, ValidationError } from "@/lib/core/errors";
import { submitEnquiry } from "@/lib/services/enquiry.service";

/**
 * The client portal's actions: signing up, confirming an address, signing in
 * and out, and resetting a password.
 *
 * Everything that could tell somebody whether an address has an account says
 * the same thing either way, and every emailed link is a single-use token
 * stored only as its digest, exactly as in the admin.
 */

const logger = createLogger("account");

const VERIFY_TTL_MS = 48 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;
const THROTTLE_MS = 2 * 60 * 1000;
const LOCKOUT = { maxAttempts: 5, lockMinutes: 15 };
const GENERIC = "That email and password don't match an account.";

const link = (path: string, token: string) => `${runtime.siteUrl.replace(/\/$/, "")}/account/${path}/${token}`;

async function sendVerification(email: string, name: string, token: string) {
  const mail = renderVerifyEmail({ name, url: link("verify", token) });
  const delivery = await sendMail({ to: email, subject: mail.subject, html: mail.html, text: mail.text });
  if (!delivery.ok) logger.error("verification email failed", new Error(delivery.error));
}

/* ── Sign up ──────────────────────────────────────────────────────────── */

export type SignUpState = { errors?: Record<string, string>; message?: string; sent?: string; values?: { name: string; email: string; company: string } } | undefined;

export async function signUp(_state: SignUpState, formData: FormData): Promise<SignUpState> {
  const values = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    company: String(formData.get("company") ?? "").trim().slice(0, 160),
  };
  const password = String(formData.get("password") ?? "");

  /* A field people never see; a bot filling every input fills this too. */
  if (String(formData.get("website") ?? "")) return { sent: values.email };

  if (!database.isConfigured) return { message: "Accounts are not available right now. Please try again later.", values };

  const errors = validateSignup({ ...values, password });
  if (Object.keys(errors).length > 0) return { errors, values };

  try {
    const token = createInviteToken();
    const created = await createAccount({
      ...values,
      passwordHash: await hashPassword(password),
      verifyTokenHash: hashInviteToken(token),
      verifyExpiresAt: new Date(Date.now() + VERIFY_TTL_MS),
    });

    if (created) {
      await sendVerification(created.email, created.name, token);
      logger.info("account created", { accountId: created.id });
    } else {
      /*
        The address already has an account. The same answer as a new one, so
        the form says nothing about who is signed up; if it is unverified, it
        gets a fresh link, and if it is verified, they can sign in or reset.
      */
      const again = createInviteToken();
      const pending = await reissueVerification(values.email, hashInviteToken(again), new Date(Date.now() + VERIFY_TTL_MS), THROTTLE_MS);
      if (pending) await sendVerification(pending.email, pending.name, again);
    }
  } catch (error) {
    logger.error("sign-up failed", error);
    return { message: "That didn't work. Please try again in a moment.", values };
  }

  return { sent: values.email };
}

/* ── Confirming the address ──────────────────────────────────────────── */

/** Used by the link in the confirmation email: confirms, signs in, and goes to the account. */
export async function confirmEmail(token: string): Promise<boolean> {
  if (!database.isConfigured || !token) return false;
  const account = await verifyAccountEmail(hashInviteToken(token));
  if (!account) return false;
  await createAccountSession({ accountId: String(account._id), sessionVersion: account.sessionVersion ?? 1 });
  logger.info("email confirmed", { accountId: String(account._id) });
  return true;
}

export type ResendState = { sent?: boolean } | undefined;

export async function resendVerification(_state: ResendState): Promise<ResendState> {
  const account = await getCurrentAccount();
  if (!account || account.verified) return { sent: true };
  const token = createInviteToken();
  const pending = await reissueVerification(account.email, hashInviteToken(token), new Date(Date.now() + VERIFY_TTL_MS), THROTTLE_MS);
  if (pending) await sendVerification(pending.email, pending.name, token);
  return { sent: true };
}

/* ── Sign in and out ─────────────────────────────────────────────────── */

export type SignInState = { message?: string; email?: string } | undefined;

export async function signInAccount(_state: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeAccountPath(formData.get("next"));

  if (!database.isConfigured) return { message: "Accounts are not available right now. Please try again later.", email };
  if (!email || !password) return { message: GENERIC, email };

  let session;
  try {
    const account = await findAccountByEmailWithHash(email);

    /* The same scrypt work for an unknown address as a real one, so timing says nothing either. */
    if (!account || account.disabledAt || !account.passwordHash) {
      await verifyPassword(password, await DUMMY_HASH_PROMISE);
      return { message: GENERIC, email };
    }

    if (account.lockedUntil && new Date(account.lockedUntil).getTime() > Date.now()) {
      const minutes = Math.ceil((new Date(account.lockedUntil).getTime() - Date.now()) / 60_000);
      return { message: `Too many attempts. Try again in ${minutes} ${minutes === 1 ? "minute" : "minutes"}, or reset your password.`, email };
    }

    if (!(await verifyPassword(password, account.passwordHash))) {
      const { locked } = await recordAccountFailure(account._id, LOCKOUT);
      return { message: locked ? `Too many attempts. Try again in ${LOCKOUT.lockMinutes} minutes, or reset your password.` : GENERIC, email };
    }

    await recordAccountLogin(account._id);
    session = { accountId: String(account._id), sessionVersion: account.sessionVersion ?? 1 };
  } catch (error) {
    logger.error("sign-in failed", error);
    return { message: "That didn't work. Please try again in a moment.", email };
  }

  await createAccountSession(session);
  redirect(next);
}

export async function signOutAccount(): Promise<void> {
  await destroyAccountSession();
  redirect("/account/login");
}

/* ── Forgotten password ──────────────────────────────────────────────── */

export type ForgotState = { sent?: boolean; message?: string; email?: string } | undefined;

export async function requestAccountReset(_state: ForgotState, formData: FormData): Promise<ForgotState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!looksLikeEmail(email)) return { message: "Enter the email you signed up with.", email };
  if (!database.isConfigured) return { message: "Accounts are not available right now. Please try again later.", email };

  try {
    const token = createInviteToken();
    const account = await startAccountReset(email, hashInviteToken(token), new Date(Date.now() + RESET_TTL_MS), THROTTLE_MS);
    if (account) {
      const mail = renderAccountReset({ name: account.name, url: link("reset", token) });
      const delivery = await sendMail({ to: account.email, subject: mail.subject, html: mail.html, text: mail.text });
      if (!delivery.ok) logger.error("account reset email failed", new Error(delivery.error));
    }
  } catch (error) {
    logger.error("account reset request failed", error);
    return { message: "That didn't work. Please try again in a moment.", email };
  }
  return { sent: true, email };
}

export type ResetState = { message?: string } | undefined;

export async function resetAccountPassword(_state: ResetState, formData: FormData): Promise<ResetState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!token) return { message: "That reset link is incomplete." };
  if (password.length < ACCOUNT_PASSWORD_MIN) return { message: `Use at least ${ACCOUNT_PASSWORD_MIN} characters.` };
  if (password.length > 200) return { message: "Keep it under 200 characters." };
  if (password !== confirm) return { message: "Those two passwords don't match." };

  let session;
  try {
    const account = await completeAccountReset(hashInviteToken(token), await hashPassword(password));
    if (!account) return { message: "That reset link has already been used or has expired. Ask for a new one." };
    session = { accountId: String(account._id), sessionVersion: account.sessionVersion ?? 1 };
  } catch (error) {
    logger.error("account reset failed", error);
    return { message: "That didn't work. Please try again." };
  }

  await createAccountSession(session);
  redirect("/account");
}

/* ── Profile ─────────────────────────────────────────────────────────── */

export type ProfileState = { saved?: boolean; message?: string } | undefined;

export async function saveProfile(_state: ProfileState, formData: FormData): Promise<ProfileState> {
  const account = await getCurrentAccount();
  if (!account) return { message: "Please sign in again." };
  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  if (name.length < 2 || name.length > 120) return { message: "Your name should be between 2 and 120 characters." };
  if (company.length > 160) return { message: "Keep the company under 160 characters." };
  await updateAccountProfile(account.id, { name, company });
  revalidatePath("/account");
  return { saved: true };
}

/* ── Replying on a project ───────────────────────────────────────────── */

export type ReplyState = { sent?: number; message?: string } | undefined;

/**
 * A client's reply under an update on their project. Only a confirmed
 * account, only on a project matched to its own address (the repository
 * checks that in the same query that writes), and the team hears by email.
 */
export async function replyToUpdate(state: ReplyState, formData: FormData): Promise<ReplyState> {
  const account = await getCurrentAccount();
  if (!account || !account.verified) return { message: "Please sign in again." };

  const projectId = String(formData.get("projectId") ?? "");
  const updateId = String(formData.get("updateId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { message: "Write a reply first." };
  if (body.length > 4000) return { message: "Keep it under 4,000 characters." };

  try {
    const project = await addClientReply(projectId, updateId, account.email, { name: account.name, body });
    if (!project) return { message: "That update is no longer there." };

    if (emailConfig.isConfigured && emailConfig.owner) {
      const mail = renderClientReplyNotice({
        client: account.name,
        project: project.title,
        update: String(formData.get("updateTitle") ?? "an update").slice(0, 160),
        body,
        url: `${runtime.siteUrl.replace(/\/$/, "")}/admin/client-projects/${projectId}`,
      });
      const delivery = await sendMail({ to: emailConfig.owner, replyTo: account.email, subject: mail.subject, html: mail.html, text: mail.text });
      if (!delivery.ok) logger.error("reply notice failed", new Error(delivery.error), { projectId });
    }
  } catch (error) {
    logger.error("client reply failed", error);
    return { message: "That didn't send. Please try again." };
  }

  revalidatePath(`/account/projects/${projectId}`);
  revalidatePath("/admin", "layout");
  return { sent: (state?.sent ?? 0) + 1 };
}

/* ── Sending a request from the account ──────────────────────────────── */

export type RequestState = { reference?: string; errors?: Record<string, string>; message?: string } | undefined;

/**
 * A project brief, mentorship application or other request, sent from inside
 * the account. It goes through the contact form's own service, so the same
 * validation, rate limit and emails apply; the name, email and company come
 * from the account, which is what makes it appear in "Your requests".
 */
export async function sendRequest(_state: RequestState, formData: FormData): Promise<RequestState> {
  const account = await getCurrentAccount();
  if (!account || !account.verified) return { message: "Please confirm your email first." };

  const field = (name: string) => String(formData.get(name) ?? "");
  const projectType = field("projectType");
  const forwarded = (await headers()).get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || "unknown";

  try {
    const result = await submitEnquiry(
      {
        name: account.name,
        email: account.email,
        company: account.company,
        role: field("role"),
        projectType,
        budget: projectType === "software" ? field("budget") : "",
        timeline: projectType === "software" ? field("timeline") : "",
        message: field("message"),
        stage: field("stage"),
        codeLink: field("codeLink"),
        attachments: [],
        submittedFromIp: ip,
        userAgent: (await headers()).get("user-agent") ?? "",
      },
      { logger }
    );
    after(async () => {
      try {
        await result.deliver();
      } catch (error) {
        logger.error("request delivery failed", error, { reference: result.reference });
      }
    });
    revalidatePath("/account");
    return { reference: result.reference };
  } catch (error) {
    if (error instanceof ValidationError) {
      const fields: Record<string, string> = { ...(error.fields ?? {}) };
      return { errors: fields, message: Object.keys(fields).length ? undefined : error.publicMessage };
    }
    if (isAppError(error)) return { message: error.publicMessage };
    logger.error("request from account failed", error);
    return { message: "That didn't send. Please try again in a moment." };
  }
}
