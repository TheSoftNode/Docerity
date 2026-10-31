import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { database, runtime } from "@/lib/config/env";
import { ACCOUNT_COOKIE, ACCOUNT_SESSION_MS, readAccountSession, signAccountSession, type AccountSession } from "@/lib/account/token";
import { findAccountForSession } from "@/lib/repositories/client-account.repository";

export type CurrentAccount = {
  id: string;
  email: string;
  name: string;
  company: string;
  verified: boolean;
  since: Date | null;
};

function cookieOptions(expires: Date) {
  return { httpOnly: true, secure: runtime.isProduction, sameSite: "lax" as const, path: "/", expires };
}

export async function createAccountSession(payload: AccountSession): Promise<void> {
  const token = await signAccountSession(payload);
  (await cookies()).set(ACCOUNT_COOKIE, token, cookieOptions(new Date(Date.now() + ACCOUNT_SESSION_MS)));
}

export async function destroyAccountSession(): Promise<void> {
  const store = await cookies();
  store.set(ACCOUNT_COOKIE, "", cookieOptions(new Date(0)));
  store.delete(ACCOUNT_COOKIE);
}

/**
 * The signed-in client, checked against the database on every request: a
 * disabled account, or one whose sessions were revoked by a password change,
 * reads as signed out even with a valid-looking cookie.
 */
export const getCurrentAccount = cache(async (): Promise<CurrentAccount | null> => {
  if (!database.isConfigured) return null;
  const session = await readAccountSession((await cookies()).get(ACCOUNT_COOKIE)?.value);
  if (!session) return null;
  try {
    const account = await findAccountForSession(session.accountId);
    if (!account || account.disabledAt || (account.sessionVersion ?? 1) !== session.sessionVersion) return null;
    return {
      id: String(account._id),
      email: account.email,
      name: account.name,
      company: account.company ?? "",
      verified: Boolean(account.emailVerifiedAt),
      since: account.createdAt ? new Date(account.createdAt) : null,
    };
  } catch {
    return null;
  }
});

/** Only paths inside the portal are accepted as somewhere to return to, so `?next=` cannot send anyone off-site. */
export function safeAccountPath(next: unknown): string {
  if (typeof next !== "string") return "/account";
  if (!next.startsWith("/account") || next.startsWith("//")) return "/account";
  return next;
}

export async function requireAccount(returnTo?: string): Promise<CurrentAccount> {
  const account = await getCurrentAccount();
  if (account) return account;
  redirect(returnTo ? `/account/login?next=${encodeURIComponent(returnTo)}` : "/account/login");
}
