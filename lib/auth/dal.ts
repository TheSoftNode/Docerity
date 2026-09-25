import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE, readSession, type SessionPayload } from "@/lib/auth/token";
import { findSessionUser } from "@/lib/repositories/user.repository";
import { ForbiddenError, UnauthorizedError } from "@/lib/core/errors";
import { isStaff, type Role } from "@/lib/auth/permissions";
import { createLogger } from "@/lib/core/logger";

/**
 * The Data Access Layer.
 *
 * Every authorization decision is made here, next to the data, rather than in
 * the page that renders or the action that mutates. The reason is that a check
 * in a layout protects what that layout renders and nothing else: a Server
 * Action is a POST endpoint reachable without ever loading the page, and
 * `proxy.ts` runs at the CDN on a cookie it cannot verify against the
 * database. Neither is a security boundary. This is.
 *
 * `cache` is React's per-render memoization, so a page that calls
 * `requireUser()` in the layout and again in three components makes one
 * database query, not four. It is scoped to a single render pass, so it never
 * serves one request's user to another.
 */

const logger = createLogger("auth");

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

/**
 * The optimistic half: reads and verifies the cookie's signature, without
 * touching the database. Enough to know whether to bother with a query.
 */
export const getSessionPayload = cache(async (): Promise<SessionPayload | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return readSession(token);
});

/**
 * The authoritative check. A valid signature is not enough on its own:
 *
 * - the account may have been deleted since the token was issued
 * - it may have been disabled
 * - `sessionVersion` may have moved, which is how a password change or a
 *   "sign out everywhere" revokes tokens that have not expired yet
 *
 * Returns null rather than redirecting, so a caller can decide between
 * rendering a signed-out view and refusing.
 */
export const getCurrentUser = cache(async (): Promise<AdminUser | null> => {
  const session = await getSessionPayload();
  if (!session) return null;

  try {
    const user = await findSessionUser(session.userId);

    if (!user) return null;
    if (user.disabledAt) return null;
    if ((user.sessionVersion ?? 1) !== session.sessionVersion) {
      logger.info("session rejected: version mismatch", { userId: session.userId });
      return null;
    }

    return {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role as Role,
    };
  } catch (error) {
    /*
      The database being unreachable must not read as "authorized". It is
      logged and treated as no session, which sends the operator to the login
      screen rather than into a half-rendered admin page whose queries all
      throw.
    */
    logger.error("could not verify session against the database", error);
    return null;
  }
});

/**
 * For pages and layouts: redirects to the login screen, carrying the path so
 * signing in returns to where the person was headed.
 */
export async function requireUser(returnTo?: string): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (user) return user;

  const target = returnTo
    ? `/admin/login?next=${encodeURIComponent(returnTo)}`
    : "/admin/login";
  redirect(target);
}

/**
 * For Server Actions and route handlers: throws instead of redirecting.
 *
 * A `redirect()` inside an action aborts it with a navigation, which a form
 * awaiting a result reads as success. A thrown `UnauthorizedError` is
 * something the caller can report.
 */
export async function requireUserOrThrow(): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError("Please sign in again.");
  return user;
}

export async function requireOwner(): Promise<AdminUser> {
  const user = await requireUserOrThrow();
  if (user.role !== "owner") {
    throw new ForbiddenError("Only the account owner can do that.");
  }
  return user;
}

/**
 * Owner or editor, for everything a contributor has no business seeing:
 * enquiries, the subscriber list, review moderation, publishing.
 *
 * Throws rather than redirecting, for the same reason as `requireUserOrThrow`.
 */
export async function requireStaffOrThrow(): Promise<AdminUser> {
  const user = await requireUserOrThrow();
  if (!isStaff(user.role)) {
    throw new ForbiddenError("That part of the admin area is not open to contributors.");
  }
  return user;
}

/**
 * The page-level counterpart: a contributor who types one of those URLs is sent
 * to the one page they can use rather than shown an error.
 */
export async function requireStaff(returnTo?: string): Promise<AdminUser> {
  const user = await requireUser(returnTo);
  if (!isStaff(user.role)) redirect("/admin/posts");
  return user;
}
