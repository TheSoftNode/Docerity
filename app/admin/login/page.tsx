import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { BrandMark } from "@/components/shared/brand-mark";
import { LoginForm } from "@/components/admin/login-form";
import { getCurrentUser } from "@/lib/auth/dal";
import { database } from "@/lib/config/env";

export const metadata: Metadata = {
  title: "Sign in",
  /* Kept out of search results and out of any link preview. An admin login
     page has nothing to gain from being indexed. */
  robots: { index: false, follow: false },
};

/* Reads a query parameter, so it cannot be prerendered. */
export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  /*
    Sending an already-signed-in visitor to the dashboard, decided here rather
    than in `proxy.ts`.

    The proxy can only see that a cookie exists. Acting on that was an infinite
    redirect, because an expired cookie satisfied it and the Data Access Layer
    sent the request straight back. `getCurrentUser` verifies the signature and
    checks the account, so this only fires for a session that is genuinely
    valid.
  */
  if (await getCurrentUser()) redirect("/admin");

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-5 py-12">
      <div className="w-full max-w-[24rem]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to the site
        </Link>

        <div className="mt-8 rounded-2xl bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--brand-primary),transparent_55%),var(--border)_45%,color-mix(in_oklch,var(--brand-violet),transparent_60%))] p-px">
          <div className="rounded-2xl bg-card px-6 py-7 sm:px-7">
            <BrandMark />
            <h1 className="mt-5 font-heading text-xl font-semibold tracking-tight text-foreground">
              Docerity admin
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Enquiries, reviews and writing.
            </p>

            {database.isConfigured ? (
              <LoginForm next={typeof next === "string" ? next : "/admin"} />
            ) : (
              /*
                Said plainly rather than letting the form fail on submit. With
                no MONGODB_URI there is no user collection to check against, so
                every attempt would return the same "email and password don't
                match" and look like a forgotten password.
              */
              <p className="mt-8 rounded-lg border border-border bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
                There is no database connection, so there are no accounts to
                sign in to. Set <code className="text-foreground">MONGODB_URI</code>,
                then create the first account with{" "}
                <code className="text-foreground">node scripts/create-admin.mjs</code>.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
