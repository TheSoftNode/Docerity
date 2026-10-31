import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthHeading, AuthShell } from "@/components/admin/auth-shell";
import { AccountSignUpForm } from "@/components/account/account-forms";
import { PORTAL_PANEL } from "@/components/account/portal-panel";
import { getCurrentAccount } from "@/lib/account/session";

export const metadata: Metadata = { title: "Create an account", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Creating a client account. The address is confirmed by email before anything private shows. */
export default async function AccountSignUpPage() {
  if (await getCurrentAccount()) redirect("/account");

  return (
    <AuthShell panel={PORTAL_PANEL}>
      <AuthHeading title="Create an account">Track your projects live and keep everything you&apos;ve sent us in one place.</AuthHeading>
      <AccountSignUpForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have one?{" "}
        <Link href="/account/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
