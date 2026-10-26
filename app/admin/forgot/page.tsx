import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { BrandMark } from "@/components/shared/brand-mark";
import { ForgotForm } from "@/components/admin/forgot-form";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
};

/** Forgotten password: the address to send a reset link to. */
export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-5 py-12">
      <div className="w-full max-w-[24rem]">
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
            <h1 className="mt-5 font-heading text-xl font-semibold tracking-tight text-foreground">Forgot your password?</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Enter the email you sign in with and we&apos;ll send you a link to choose a new one.
            </p>
            <ForgotForm />
          </div>
        </div>
      </div>
    </main>
  );
}
