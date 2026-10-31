import type { Metadata } from "next";

import { AuthHeading, AuthShell } from "@/components/admin/auth-shell";
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
    <AuthShell>
      {invite ? (
        <>
          <AuthHeading title={`Welcome, ${invite.name.split(" ")[0]}`}>
            Pick a password and the account is yours.{" "}
            {role ? (
              <>
                You are joining as {/^[aeiou]/i.test(role.label) ? "an" : "a"}{" "}
                <span className="font-medium text-foreground">{role.label.toLowerCase()}</span>: {role.summary.toLowerCase()}
              </>
            ) : null}
          </AuthHeading>
          <InviteForm token={token} />
        </>
      ) : (
        <>
          <AuthHeading title="This link has expired" />
          {/*
            One message for every failure: used, expired, revoked, never
            existed. Saying which would let somebody with a guessed token learn
            whether it was ever real.
          */}
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Invitations work once and last three days. Ask for a new one and it will take a moment to send.
          </p>
        </>
      )}
    </AuthShell>
  );
}
