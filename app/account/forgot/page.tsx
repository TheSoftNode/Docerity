import type { Metadata } from "next";

import { AuthHeading, AuthShell } from "@/components/admin/auth-shell";
import { AccountForgotForm } from "@/components/account/account-forms";
import { PORTAL_PANEL } from "@/components/account/portal-panel";

export const metadata: Metadata = { title: "Reset your password", robots: { index: false, follow: false } };

export default function AccountForgotPage() {
  return (
    <AuthShell panel={PORTAL_PANEL} back={{ href: "/account/login", label: "Back to sign in" }}>
      <AuthHeading title="Forgot your password?">Enter the email you signed up with and we&apos;ll send you a link to choose a new one.</AuthHeading>
      <AccountForgotForm />
    </AuthShell>
  );
}
