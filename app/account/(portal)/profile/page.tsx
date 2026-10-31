import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { requireAccount } from "@/lib/account/session";
import { ProfileForm } from "@/components/account/profile-form";
import { formatDate } from "@/components/account/portal-ui";

export const metadata: Metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

/** The client's own details: who they are on navy, what they can change beside it. */
export default async function AccountProfilePage() {
  const account = await requireAccount("/account/profile");
  const initials = account.name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
      <aside aria-label="Your account" className="rounded-[26px] bg-[#08102e] p-7 text-[#f4f5fa] lg:sticky lg:top-24">
        <span aria-hidden className="grid size-20 place-items-center rounded-full bg-[#1c3a8c] font-heading text-3xl font-extrabold text-[#afc4ff]">
          {initials || "?"}
        </span>
        <h1 className="mt-5 font-heading text-[clamp(32px,3vw,40px)] leading-none font-extrabold tracking-[-0.04em]">{account.name}</h1>
        {account.company ? <p className="mt-2 text-[15px] text-[#c4cbe3]">{account.company}</p> : null}
        <dl className="mt-6 border-t border-[rgb(175_196_255/0.14)]">
          <div className="flex items-baseline justify-between gap-4 border-b border-[rgb(175_196_255/0.14)] py-3">
            <dt className="text-[13px] text-[#9aa7cf]">Email</dt>
            <dd className="min-w-0 truncate text-[15px] font-medium">{account.email}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-b border-[rgb(175_196_255/0.14)] py-3">
            <dt className="text-[13px] text-[#9aa7cf]">Status</dt>
            <dd className="text-[15px] font-medium">
              {account.verified ? (
                <span className="inline-flex items-center gap-1.5">
                  <span aria-hidden className="size-2 rounded-full bg-[#4cc59a]" />
                  Confirmed
                </span>
              ) : (
                "Waiting for you to confirm it"
              )}
            </dd>
          </div>
          {account.since ? (
            <div className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-[13px] text-[#9aa7cf]">Member since</dt>
              <dd className="text-[15px] font-medium">{formatDate(account.since)}</dd>
            </div>
          ) : null}
        </dl>
      </aside>

      <div className="grid min-w-0 gap-5">
        <section aria-labelledby="details-title" className="rounded-[26px] border border-border bg-card p-7">
          <h2 id="details-title" className="font-heading text-[26px] font-bold tracking-[-0.025em] text-foreground">
            Your details
          </h2>
          <p className="mt-1.5 mb-6 text-[15px] text-muted-foreground">How we address you, and the company on your requests.</p>
          <ProfileForm name={account.name} company={account.company} />
        </section>

        <section aria-labelledby="signin-title" className="rounded-[26px] border border-border bg-card p-7">
          <h2 id="signin-title" className="font-heading text-[26px] font-bold tracking-[-0.025em] text-foreground">
            Signing in
          </h2>
          <p className="mt-1.5 max-w-[60ch] text-[15px] leading-relaxed text-muted-foreground">
            Your email links your projects to you, so it can&apos;t be changed here. If it needs to,{" "}
            <Link href="/account/requests/new?type=other" className="font-semibold text-primary hover:underline">
              send us a request
            </Link>
            .
          </p>
          <Link
            href="/account/forgot"
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-full border border-border px-5 text-[15px] font-semibold text-foreground transition-colors hover:border-foreground/30 hover:bg-muted"
          >
            Change your password <ArrowRightIcon className="size-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
