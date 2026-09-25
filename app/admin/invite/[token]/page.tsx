import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { BrandMark } from "@/components/shared/brand-mark";
import { InviteForm } from "@/components/admin/invite-form";
import { hashInviteToken } from "@/lib/auth/invite";
import { findPendingInvite } from "@/lib/repositories/user.repository";
import { database } from "@/lib/config/env";
import { ROLES } from "@/lib/auth/permissions";

export const metadata: Metadata = {
  title: "Accept your invitation",
  robots: { index: false, follow: false },
};

/* Reads a token from the path and queries on it, so it can never be cached. */
export const dynamic = "force-dynamic";

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  /* Looked up by digest, so the URL carries no account id: the link reveals
     nothing about whose invitation it is, and a guessed id is useless. */
  const invite = database.isConfigured
    ? await findPendingInvite(hashInviteToken(token))
    : null;

  const role = ROLES.find((r) => r.value === invite?.role);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-background px-5 py-12">
      <div className="w-full max-w-[26rem]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          Docerity
        </Link>

        <div className="mt-8 rounded-2xl bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--brand-primary),transparent_55%),var(--border)_45%,color-mix(in_oklch,var(--brand-violet),transparent_60%))] p-px">
          <div className="rounded-2xl bg-card px-6 py-7 sm:px-7">
            <BrandMark />

            {invite ? (
              <>
                <h1 className="mt-5 font-heading text-xl font-semibold tracking-tight text-foreground">
                  Welcome, {invite.name.split(" ")[0]}
                </h1>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  Pick a password and the account is yours.{" "}
                  {role ? (
                    <>
                      You are joining as a{" "}
                      <span className="text-foreground">{role.label.toLowerCase()}</span>:{" "}
                      {role.summary.toLowerCase()}
                    </>
                  ) : null}
                </p>

                <InviteForm token={token} />
              </>
            ) : (
              <>
                <h1 className="mt-5 font-heading text-xl font-semibold tracking-tight text-foreground">
                  This link has expired
                </h1>
                {/*
                  One message for every failure: used, expired, revoked, never
                  existed. Saying which would let somebody with a guessed token
                  learn whether it was ever real.
                */}
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  Invitations work once and last three days. Ask for a new one
                  and it will take a moment to send.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
