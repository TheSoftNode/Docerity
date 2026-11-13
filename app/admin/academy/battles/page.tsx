import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

import { requireStaff } from "@/lib/auth/dal";
import { database } from "@/lib/config/env";
import { PHASE_LABEL, battlePhase, watLabel } from "@/lib/academy/battles";
import { getBattles } from "@/lib/academy/battle-store";
import { countBattleEntries } from "@/lib/repositories/academy.repository";
import { AdminEmptyState, AdminNoDatabase, AdminPageHeader } from "@/components/admin/admin-page-header";
import { NewBattleButton } from "@/components/admin/academy-new-battle";

export const metadata: Metadata = { title: "Build battles" };
export const dynamic = "force-dynamic";

/** Every battle, live ones first, with where each one is and how many have entered. */
export default async function AdminBattlesPage() {
  await requireStaff("/admin/academy/battles");
  if (!database.isConfigured) return <AdminNoDatabase what="The Academy" />;
  const battles = await getBattles({ drafts: true });
  const counts = await Promise.all(battles.map((battle) => countBattleEntries(battle.slug).catch(() => 0)));

  return (
    <>
      <Link href="/admin/academy" className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" /> Academy
      </Link>
      <AdminPageHeader eyebrow="Academy" title="Build battles" description="Timed challenges: set the brief and the times, publish, and the battle runs itself. When voting ends, confirm the podium.">
        <NewBattleButton />
      </AdminPageHeader>
      {battles.length === 0 ? (
        <AdminEmptyState title="No battles yet" description="Create one, set its times, and publish it when you're ready." />
      ) : (
        <ul className="grid gap-3">
          {battles.map((battle, index) => {
            const phase = battlePhase(battle);
            return (
              <li key={battle.slug}>
                <Link href={`/admin/academy/battles/${battle.slug}`} className="group flex flex-wrap items-center gap-4 rounded-[22px] border border-border bg-card p-5 transition-colors hover:border-foreground/25">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] text-muted-foreground">
                      {battle.status === "draft" ? "Draft" : PHASE_LABEL[phase]} · entries close {watLabel(battle.submitBy)}
                    </span>
                    <span className="block truncate font-heading text-[19px] font-bold text-foreground">{battle.title}</span>
                  </span>
                  {phase === "judging" && battle.status === "published" ? (
                    <span className="rounded-full bg-[#ff7a59] px-3 py-1 text-[13px] font-bold text-[#08102e]">Confirm results</span>
                  ) : null}
                  <span className="text-sm text-muted-foreground">
                    {counts[index]} {counts[index] === 1 ? "entry" : "entries"}
                  </span>
                  <ArrowRightIcon className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
