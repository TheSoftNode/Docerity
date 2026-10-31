import type { Metadata } from "next";
import Link from "next/link";

import { AuthHeading, AuthShell } from "@/components/admin/auth-shell";
import { ResetForm } from "@/components/admin/reset-form";
import { hashInviteToken } from "@/lib/auth/invite";
import { findPendingReset } from "@/lib/repositories/user.repository";
import { database } from "@/lib/config/env";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};

/* Reads a token from the path and queries on it, so it can never be cached. */
export const dynamic = "force-dynamic";

/** The link from the reset email: choose a new password, or ask for a fresh link. */
export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const reset = database.isConfigured ? await findPendingReset(hashInviteToken(token)) : null;

  return (
    <AuthShell back={{ href: "/admin/login", label: "Back to sign in" }}>
      {reset ? (
        <>
          <AuthHeading title="Choose a new password">
            For <span className="font-medium text-foreground">{reset.email}</span>. Saving it signs you in here and out everywhere else.
          </AuthHeading>
          <ResetForm token={token} />
        </>
      ) : (
        <>
          <AuthHeading title="This link has expired" />
          {/* One message for used, expired and never-real links alike, so a guessed token learns nothing. */}
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Reset links work once and last an hour.{" "}
            <Link href="/admin/forgot" className="font-medium text-primary underline-offset-4 hover:underline">
              Ask for a new one
            </Link>
            .
          </p>
        </>
      )}
    </AuthShell>
  );
}
