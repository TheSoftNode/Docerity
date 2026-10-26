import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { BrandMark } from "@/components/shared/brand-mark";
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
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-5 py-12">
      <div className="w-full max-w-[26rem]">
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to sign in
        </Link>

        <div className="mt-8 rounded-2xl bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--brand-primary),transparent_55%),var(--border)_45%,color-mix(in_oklch,var(--brand-violet),transparent_60%))] p-px">
          <div className="rounded-2xl bg-card px-6 py-7 sm:px-7">
            <BrandMark />
            {reset ? (
              <>
                <h1 className="mt-5 font-heading text-xl font-semibold tracking-tight text-foreground">Choose a new password</h1>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  For <span className="text-foreground">{reset.email}</span>. Saving it signs you in here and out everywhere else.
                </p>
                <ResetForm token={token} />
              </>
            ) : (
              <>
                <h1 className="mt-5 font-heading text-xl font-semibold tracking-tight text-foreground">This link has expired</h1>
                {/* One message for used, expired and never-real links alike, so a guessed token learns nothing. */}
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  Reset links work once and last an hour.{" "}
                  <Link href="/admin/forgot" className="text-foreground underline underline-offset-4">
                    Ask for a new one
                  </Link>
                  .
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
