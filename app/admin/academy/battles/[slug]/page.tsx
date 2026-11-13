import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowUpRightIcon } from "lucide-react";

import { requireStaff } from "@/lib/auth/dal";
import { database } from "@/lib/config/env";
import { PHASE_LABEL, battlePhase } from "@/lib/academy/battles";
import { getBattle } from "@/lib/academy/battle-store";
import { listBattleEntries } from "@/lib/repositories/academy.repository";
import { AdminNoDatabase, AdminPageHeader } from "@/components/admin/admin-page-header";
import { BattleEditor } from "@/components/admin/academy-battle-editor";
import { BattleEntries } from "@/components/admin/academy-battle-entries";

export const metadata: Metadata = { title: "Edit battle" };
export const dynamic = "force-dynamic";

/** One battle: its brief and times, then its entries and, after voting, the podium to confirm. */
export default async function AdminBattlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await requireStaff(`/admin/academy/battles/${slug}`);
  if (!database.isConfigured) return <AdminNoDatabase what="The Academy" />;
  const battle = await getBattle(slug, { drafts: true });
  if (!battle) notFound();
  const entries = await listBattleEntries(slug, { includeHidden: true });
  const phase = battlePhase(battle);
  const places = battle.results ? [battle.results.first, battle.results.second, battle.results.third] : [];

  return (
    <>
      <Link href="/admin/academy/battles" className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" /> Build battles
      </Link>
      <AdminPageHeader eyebrow={battle.status === "draft" ? "Draft" : PHASE_LABEL[phase]} title={battle.title} description="Times are in West Africa Time. The battle moves through its phases on its own once it's published.">
        {battle.status === "published" ? (
          <Link href={`/academy/battles/${battle.slug}`} target="_blank" className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-semibold text-foreground">
            View the battle <ArrowUpRightIcon className="size-4" />
          </Link>
        ) : null}
      </AdminPageHeader>
      <BattleEditor key={JSON.stringify(battle)} battle={battle} />
      <h2 className="mt-4 mb-3 font-heading text-[22px] font-bold text-foreground">Entries</h2>
      <BattleEntries
        slug={battle.slug}
        canFinalise={phase === "judging" && entries.some((entry) => !entry.hidden)}
        finished={Boolean(battle.results)}
        entries={entries.map((entry) => ({
          id: String(entry._id),
          title: entry.title,
          name: entry.name,
          email: entry.email,
          votes: entry.votes,
          liveUrl: entry.liveUrl,
          repoUrl: entry.repoUrl,
          hidden: Boolean(entry.hidden),
          place: places.indexOf(String(entry._id)) + 1,
        }))}
      />
    </>
  );
}
