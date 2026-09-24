"use server";

import { redirect } from "next/navigation";

import { authenticate } from "@/lib/services/auth.service";
import { createSession, destroySession } from "@/lib/auth/session";
import { isAppError } from "@/lib/core/errors";
import { createLogger } from "@/lib/core/logger";

/**
 * Sign in and sign out.
 *
 * Both are Server Actions, so the login form works without JavaScript and the
 * password is never in a URL or a client-side fetch this app wrote.
 */

const logger = createLogger("auth.actions");

export type LoginState = { message?: string; email?: string } | undefined;

/**
 * Only relative, same-site paths under /admin are accepted as a return target.
 *
 * `?next=` comes from the query string, so it is attacker-controlled. Passing
 * it to `redirect()` unchecked is an open redirect: a link to
 * `/admin/login?next=https://evil.example` would send someone who just typed
 * their password to another site, with the login page's own styling lending it
 * credibility.
 */
function safeReturnPath(next: unknown): string {
  if (typeof next !== "string") return "/admin";
  /* A protocol-relative `//evil.example` is a valid URL to a browser, so
     checking only for a leading slash is not enough. */
  if (!next.startsWith("/admin") || next.startsWith("//")) return "/admin";
  return next;
}

export async function signIn(
  _state: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = safeReturnPath(formData.get("next"));

  let result;
  try {
    result = await authenticate(email, password);
  } catch (error) {
    /* Lockout and "no database" both arrive here. Their messages are written
       for the person reading them; anything else is not. */
    if (isAppError(error)) return { message: error.publicMessage, email };
    logger.error("sign-in failed unexpectedly", error);
    return { message: "Something went wrong signing you in. Please try again.", email };
  }

  if (!result.ok) return { message: result.message, email };

  await createSession(result.session);

  /* Outside the try: `redirect` works by throwing, so catching around it would
     swallow the navigation and report it as an error. */
  redirect(next);
}

export async function signOut(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
