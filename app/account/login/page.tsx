import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthHeading, AuthShell } from "@/components/admin/auth-shell";
import { AccountSignInForm } from "@/components/account/account-forms";
import { PORTAL_PANEL } from "@/components/account/portal-panel";
import { getCurrentAccount, safeAccountPath } from "@/lib/account/session";

export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Signing in to the client portal. Somebody already signed in goes straight on. */
export default async function AccountLoginPage({ searchParams }: { searchParams: Promise<{ next?: string; expired?: string }> }) {
  const { next, expired } = await searchParams;
  const target = safeAccountPath(next);
  if (await getCurrentAccount()) redirect(target);

  return (
    <AuthShell panel={PORTAL_PANEL}>
      <AuthHeading title="Sign in">Follow your projects and requests with Docerity.</AuthHeading>
      {expired ? (
        <p role="status" className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          That confirmation link has expired or was already used. Sign in and we can send you a new one.
        </p>
      ) : null}
      <AccountSignInForm next={target} />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/account/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
