import type { Metadata } from "next";

import { AuthHeading, AuthShell } from "@/components/admin/auth-shell";
import { ForgotForm } from "@/components/admin/forgot-form";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};

/** Forgotten password: the address to send a reset link to. */
export default function ForgotPasswordPage() {
  return (
    <AuthShell back={{ href: "/admin/login", label: "Back to sign in" }}>
      <AuthHeading title="Forgot your password?">
        Enter the email you sign in with and we&apos;ll send you a link to choose a new one.
      </AuthHeading>
      <ForgotForm />
    </AuthShell>
  );
}
