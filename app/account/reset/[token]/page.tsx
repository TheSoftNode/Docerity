import type { Metadata } from "next";
import Link from "next/link";

import { AuthHeading, AuthShell } from "@/components/admin/auth-shell";
import { AccountResetForm } from "@/components/account/account-forms";
import { PORTAL_PANEL } from "@/components/account/portal-panel";
import { hashInviteToken } from "@/lib/auth/invite";
import { findPendingAccountReset } from "@/lib/repositories/client-account.repository";
import { database } from "@/lib/config/env";

export const metadata: Metadata = { title: "Choose a new password", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AccountResetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const reset = database.isConfigured ? await findPendingAccountReset(hashInviteToken(token)) : null;

  return (
    <AuthShell panel={PORTAL_PANEL} back={{ href: "/account/login", label: "Back to sign in" }}>
      {reset ? (
        <>
          <AuthHeading title="Choose a new password">
            For <span className="font-medium text-foreground">{reset.email}</span>. Saving it signs you in here and out everywhere else.
          </AuthHeading>
          <AccountResetForm token={token} />
        </>
      ) : (
        <>
          <AuthHeading title="This link has expired" />
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Reset links work once and last an hour.{" "}
            <Link href="/account/forgot" className="font-medium text-primary underline-offset-4 hover:underline">
              Ask for a new one
            </Link>
            .
          </p>
        </>
      )}
    </AuthShell>
  );
}
