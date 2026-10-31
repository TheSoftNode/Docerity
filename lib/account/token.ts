import { SignJWT, jwtVerify } from "jose";

import { auth as authConfig } from "@/lib/config/env";

/**
 * Client sessions: a signed token in their own cookie, for their own audience.
 *
 * The same secret as the admin's, but a different audience and cookie name, so
 * a client token is rejected by the admin and an admin token by the portal:
 * each `jwtVerify` checks the audience it expects.
 */
export const ACCOUNT_COOKIE = "docerity_account";
export const ACCOUNT_SESSION_MS = 30 * 24 * 60 * 60 * 1000;
const AUDIENCE = "docerity-account";

export type AccountSession = { accountId: string; sessionVersion: number };

function key() {
  return new TextEncoder().encode(authConfig.sessionSecret);
}

export async function signAccountSession(payload: AccountSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(new Date(Date.now() + ACCOUNT_SESSION_MS))
    .setIssuer("docerity")
    .setAudience(AUDIENCE)
    .sign(key());
}

export async function readAccountSession(token: string | undefined): Promise<AccountSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"], issuer: "docerity", audience: AUDIENCE });
    if (typeof payload.accountId !== "string" || typeof payload.sessionVersion !== "number") return null;
    return { accountId: payload.accountId, sessionVersion: payload.sessionVersion };
  } catch {
    return null;
  }
}
