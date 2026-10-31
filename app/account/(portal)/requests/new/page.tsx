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
      <h1 className="mt-5 font-heading text-[clamp(34px,4vw,52px)] leading-none font-extrabold tracking-[-0.04em] text-foreground">New request</h1>
      <p className="mt-3 max-w-[60ch] pb-8 text-[17px] text-muted-foreground">
        A project, a mentorship application, a talk, or a question. It&apos;s sent as {account.name} ({account.email}).
      </p>
      <div className="max-w-3xl">
        {account.verified ? <RequestForm initialType={type ?? "software"} stages={stages} /> : <VerifyBanner email={account.email} />}
      </div>
    </>
  );
}
