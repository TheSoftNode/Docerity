import type { Metadata } from "next";
import Link from "next/link";

import { requireAccount } from "@/lib/account/session";
import { ProfileForm } from "@/components/account/profile-form";
import { PortalCard, formatDate } from "@/components/account/portal-ui";

export const metadata: Metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

/** The client's own details, and how to change the parts that need care. */
export default async function AccountProfilePage() {
  const account = await requireAccount("/account/profile");

  return (
    <>
      <h1 className="font-heading text-[clamp(34px,4vw,52px)] leading-none font-extrabold tracking-[-0.04em] text-foreground">Profile</h1>
      <p className="mt-3 pb-8 text-[17px] text-muted-foreground">Your details, as we see them.</p>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <PortalCard title="Your details">
          <ProfileForm name={account.name} company={account.company} />
        </PortalCard>

        <PortalCard title="Sign-in">
          <dl className="grid gap-3 text-[15px]">
            <div>
              <dt className="text-sm text-muted-foreground">Email</dt>
              <dd className="font-medium break-all text-foreground">{account.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Status</dt>
              <dd className="font-medium text-foreground">{account.verified ? "Confirmed" : "Waiting for you to confirm it"}</dd>
            </div>
            {account.since ? (
              <div>
                <dt className="text-sm text-muted-foreground">Member since</dt>
                <dd className="font-medium text-foreground">{formatDate(account.since)}</dd>
              </div>
            ) : null}
          </dl>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Your email is what links your projects to you, so it can&apos;t be changed here.{" "}
            <Link href="/contact" className="font-medium text-primary hover:underline">
              Ask us
            </Link>{" "}
            if it needs to. To change your password, use{" "}
            <Link href="/account/forgot" className="font-medium text-primary hover:underline">
              reset password
            </Link>
            .
          </p>
        </PortalCard>
      </div>
    </>
  );
}
