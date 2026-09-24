import { SignJWT, jwtVerify } from "jose";

import { auth as authConfig } from "@/lib/config/env";

/**
 * Signing and verifying a session token, and nothing else.
 *
 * Deliberately separate from `session.ts`, which reads and writes the cookie.
 * That file is marked `server-only` and imports `next/headers`, so it can only
 * run inside a request; this one is pure and can be imported by the proxy, by a
 * route handler, and by a test in plain Node.
 *
 * The split is not cosmetic: the signature check is the thing that decides
 * whether somebody is an administrator, and it is worth being able to test
 * directly rather than through a form.
 */

export const SESSION_COOKIE = "docerity_session";

/* Seven days. Long enough not to be a nuisance for somebody checking enquiries
   once a week, short enough that a token copied from a machine left logged in
   stops working. `refreshSession` slides the window on real use. */
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

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
    /*
      Both the claim and the cookie carry an expiry, and `jwtVerify` enforces
      this one. A token whose only expiry is the cookie's `expires` attribute is
      not actually expiring: that attribute is an instruction to the browser, and
      a token replayed by something that is not a browser ignores it entirely.
    */
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
      /* Pinned. Without it a token could arrive claiming `alg: "none"`, or
         signed with an algorithm the secret was never meant for. */
      algorithms: ["HS256"],
      issuer: "docerity",
      audience: "docerity-admin",
    });

    /*
      The shape is checked as well as the signature. A validly signed token from
      an older version of this code could be missing `sessionVersion`, and
      accepting it would mean a session that cannot be revoked.
    */
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
