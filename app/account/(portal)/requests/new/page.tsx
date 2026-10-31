import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { requireAccount } from "@/lib/account/session";
import { getGroup } from "@/lib/content/blocks/source";
import type { StageView } from "@/lib/content/blocks/views";
import { RequestForm } from "@/components/account/request-form";
import { VerifyBanner } from "@/components/account/verify-banner";

export const metadata: Metadata = { title: "New request" };
export const dynamic = "force-dynamic";

/** Starting a project, applying for mentorship, or anything else, from inside the account. */
export default async function NewRequestPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const account = await requireAccount("/account/requests/new");
  const { type } = await searchParams;
  const stages = ((await getGroup<StageView[]>("mentorship", "stages")) ?? []).map((stage) => stage.label).filter(Boolean);

  return (
    <>
      <Link href="/account" className="inline-flex items-center gap-2 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeftIcon className="size-4" />
        Your account
      </Link>
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <h1 className="font-heading text-[clamp(40px,4.6vw,60px)] leading-[0.95] font-extrabold tracking-[-0.045em] text-foreground">
            What can we
            <br />
            <span className="text-primary">do for you?</span>
          </h1>
          <p className="mt-4 mb-8 max-w-[56ch] text-[17px] text-muted-foreground">
            Sent as {account.name} ({account.email}), so it shows in your account the moment it&apos;s in.
          </p>
          {account.verified ? <RequestForm initialType={type ?? "software"} stages={stages} /> : <VerifyBanner email={account.email} />}
        </div>

        <aside aria-label="What happens next" className="rounded-[26px] bg-[#08102e] p-7 text-[#f4f5fa] lg:sticky lg:top-24 lg:mt-[150px]">
          <h2 className="font-heading text-2xl font-bold tracking-[-0.025em]">What happens next</h2>
          <ol className="mt-5">
            {[
              ["A person reads it", "No sales team or inbox triage. Usually within one or two working days."],
              ["We reply by email", "With an answer, or a time to talk it through if that's quicker."],
              ["You follow it here", "Every request has its own page showing where it stands."],
            ].map(([title, line], index) => (
              <li key={title} className="flex gap-3.5 border-t border-[rgb(175_196_255/0.14)] py-4 first:border-t-0 first:pt-0 last:pb-0">
                <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full bg-[#afc4ff] text-sm font-bold text-[#08102e]">
                  {index + 1}
                </span>
                <span>
                  <span className="block text-[15px] font-semibold">{title}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-[#c4cbe3]">{line}</span>
                </span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </>
  );
}
