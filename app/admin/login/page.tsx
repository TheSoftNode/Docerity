import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthHeading, AuthShell } from "@/components/admin/auth-shell";
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
    <AuthShell>
      <AuthHeading title="Sign in">Welcome back.</AuthHeading>
      {database.isConfigured ? (
        <>
          <LoginForm next={typeof next === "string" ? next : "/admin"} />
          <p className="mt-6 text-center text-sm">
            <Link href="/admin/forgot" className="font-medium text-primary underline-offset-4 hover:underline">
              Forgot your password?
            </Link>
          </p>
        </>
      ) : (
        /*
          Said plainly rather than letting the form fail on submit. With no
          MONGODB_URI there are no accounts, so every attempt would look like a
          forgotten password.
        */
        <p className="mt-8 rounded-[20px] border border-border bg-card px-4 py-3.5 text-sm leading-relaxed text-muted-foreground">
          There is no database connection, so there are no accounts to sign in to. Set{" "}
          <code className="text-foreground">MONGODB_URI</code>, then create the first account with{" "}
          <code className="text-foreground">node scripts/create-admin.mjs</code>.
        </p>
      )}
    </AuthShell>
  );
}
