import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import { auth as authConfig, runtime } from "@/lib/config/env";

/**
 * Stateless sessions: a signed JWT in an HttpOnly cookie.
 *
 * Stateless rather than a session table because the payload is tiny and a
 * database round trip on every request to a mostly-static site is a poor
 * trade. The usual objection to stateless sessions is that you cannot revoke
 * one, and that is answered by `sessionVersion`: it travels in the payload,
 * the Data Access Layer compares it with the stored value, and bumping the
 * stored number invalidates every token ever issued for that account.
 *
 * `server-only` makes importing this from a client component a build error
 * rather than a runtime surprise, because the module reads the signing secret.
 */

export const SESSION_COOKIE = "docerity_session";

/* Seven days. Long enough not to be a nuisance for someone checking enquiries
   once a week, short enough that a token copied from a machine left logged in
   stops working. `refreshSession` slides the window on real use. */
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export type SessionPayload = {
  userId: string;
  role: "owner" | "editor";
  sessionVersion: number;
};

function key() {
  return new TextEncoder().encode(authConfig.sessionSecret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    /* Both claims are set, and `jwtVerify` checks them. A token whose only
       expiry is the cookie's `expires` attribute is not actually expiring:
       the attribute is a hint to the browser, and a copied token replayed by
       something that is not a browser ignores it entirely. */
    .setExpirationTime(new Date(Date.now() + SESSION_DURATION_MS))
    .setIssuer("docerity")
    .setAudience("docerity-admin")
    .sign(key());
}

/** Returns null for anything that does not verify; never throws. */
export async function readSession(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, key(), {
      /* Pinned. Without it a token could arrive with `alg: "none"`, or with a
         different algorithm than the one the secret was meant for. */
      algorithms: ["HS256"],
      issuer: "docerity",
      audience: "docerity-admin",
    });

    if (
      typeof payload.userId !== "string" ||
      (payload.role !== "owner" && payload.role !== "editor") ||
      typeof payload.sessionVersion !== "number"
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      role: payload.role,
      sessionVersion: payload.sessionVersion,
    };
  } catch {
    /* Expired, tampered with, signed by a different secret, or not a JWT at
       all. None of those are distinguishable to a caller and none should be. */
    return null;
  }
}

function cookieOptions(expires: Date) {
  return {
    httpOnly: true,
    /* Not set in development, where the dev server is plain HTTP and a Secure
       cookie would simply never be stored, making login appear to fail. */
    secure: runtime.isProduction,
    /* `lax` rather than `strict`: `strict` would drop the cookie on a
       navigation that arrives from another site, so following a link to an
       admin page from email would land on the login screen despite a valid
       session. `lax` still withholds it on cross-site POSTs, which is the
       CSRF case that matters. */
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
 * because the JWT's own `exp` is what `readSession` enforces; extending only
 * the cookie would produce a cookie the browser keeps and the server rejects.
 */
export async function refreshSession(payload: SessionPayload): Promise<void> {
  await createSession(payload);
}

export async function destroySession(): Promise<void> {
  /* Deleted and also overwritten with an already-expired empty value. Some
     intermediaries drop a bare `Set-Cookie` deletion. */
  const store = await cookies();
  store.set(SESSION_COOKIE, "", cookieOptions(new Date(0)));
  store.delete(SESSION_COOKIE);
}
