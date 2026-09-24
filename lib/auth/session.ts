import "server-only";

import { cookies } from "next/headers";

import { runtime } from "@/lib/config/env";
import {
  SESSION_COOKIE,
  SESSION_DURATION_MS,
  signSession,
  type SessionPayload,
} from "@/lib/auth/token";

/**
 * The session cookie: setting it, refreshing it, clearing it.
 *
 * Signing and verifying live in `lib/auth/token.ts`, which is pure. This file
 * imports `next/headers` and so only works inside a request, which is why it is
 * marked `server-only`: importing it from a client component is then a build
 * error rather than a runtime surprise.
 *
 * Stateless sessions rather than a session table, because the payload is tiny
 * and a database round trip on every request to a mostly-static site is a poor
 * trade. The usual objection is that a stateless session cannot be revoked,
 * which `sessionVersion` answers: it travels in the payload, the Data Access
 * Layer compares it against the stored value, and bumping the stored number
 * invalidates every token ever issued for that account.
 */

export { SESSION_COOKIE, readSession, signSession, type SessionPayload } from "@/lib/auth/token";

function cookieOptions(expires: Date) {
  return {
    httpOnly: true,
    /* Not set in development, where the dev server is plain HTTP and a Secure
       cookie would simply never be stored, making login appear to fail. */
    secure: runtime.isProduction,
    /*
      `lax` rather than `strict`. `strict` withholds the cookie on any navigation
      arriving from another site, so following a link to an admin page from email
      would land on the login screen despite a valid session. `lax` still
      withholds it on cross-site POSTs, which is the CSRF case that matters.
    */
    sameSite: "lax" as const,
    path: "/",
    expires,
  };
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const expires = new Date(Date.now() + SESSION_DURATION_MS);
  const token = await signSession(payload);
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(expires));
}

/**
 * Slides the expiry forward on an existing session.
 *
 * Re-signed rather than re-setting the same token with a later cookie expiry,
 * because the JWT's own `exp` is what verification enforces; extending only the
 * cookie would produce one the browser keeps and the server rejects.
 */
export async function refreshSession(payload: SessionPayload): Promise<void> {
  await createSession(payload);
}

export async function destroySession(): Promise<void> {
  /* Deleted and also overwritten with an already-expired empty value, because
     some intermediaries drop a bare `Set-Cookie` deletion. */
  const store = await cookies();
  store.set(SESSION_COOKIE, "", cookieOptions(new Date(0)));
  store.delete(SESSION_COOKIE);
}
