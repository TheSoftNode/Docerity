"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowUpIcon, ArrowUpRightIcon, EyeIcon, EyeOffIcon, TrophyIcon } from "lucide-react";

import { finaliseBattleAction, hideEntryAction } from "@/app/admin/academy/battle-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AdminEntry = { id: string; title: string; name: string; email: string; votes: number; liveUrl: string; repoUrl: string; hidden: boolean; place: number };

/**
 * A battle's entries for the admin, most votes first: take one out of the
 * battle (off-brief, copied, broken link) or put it back, and once voting
 * has ended confirm the podium.
 */
export function BattleEntries({ slug, entries, canFinalise, finished }: { slug: string; entries: AdminEntry[]; canFinalise: boolean; finished: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const run = (action: () => Promise<{ ok: boolean; message?: string }>) =>
    start(async () => {
      const result = await action();
      if (result.ok) {
        setError("");
        router.refresh();
      } else setError(result.message ?? "That didn't work.");
    });

  return (
    <div className="grid gap-4">
      {canFinalise ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-[#ff7a59]/40 bg-[#ff7a59]/10 p-5">
          <p className="text-sm text-foreground">Voting has ended. Check the top entries, take out any that break the rules, then confirm the podium. The top three earn their XP.</p>
          <Button type="button" disabled={pending} onClick={() => run(() => finaliseBattleAction(slug))}>
            <TrophyIcon /> Confirm results
          </Button>
        </div>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {entries.length === 0 ? (
        <p className="rounded-[20px] border border-border bg-card p-5 text-sm text-muted-foreground">No entries yet.</p>
      ) : (
        <ul className="overflow-hidden rounded-[24px] border border-border bg-card">
          {entries.map((entry) => (
            <li key={entry.id} className={cn("flex flex-wrap items-center gap-4 border-t border-border px-5 py-4 first:border-t-0", entry.hidden && "opacity-55")}>
              <span className="w-9 text-center font-heading text-[20px] font-bold text-foreground">{entry.place ? ["", "1st", "2nd", "3rd"][entry.place] : ""}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium text-foreground">
                  {entry.title} {entry.hidden ? <span className="text-[12px] text-muted-foreground">· taken out</span> : null}
                </span>
                <span className="block truncate text-[13px] text-muted-foreground">
                  {entry.name} · {entry.email}
                </span>
              </span>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                <ArrowUpIcon className="size-4" /> {entry.votes}
              </span>
              <a href={entry.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Live <ArrowUpRightIcon className="size-4" />
              </a>
              <a href={entry.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Code <ArrowUpRightIcon className="size-4" />
              </a>
              {!finished ? (
                <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={() => run(() => hideEntryAction(entry.id, !entry.hidden))}>
                  {entry.hidden ? <EyeIcon /> : <EyeOffIcon />} {entry.hidden ? "Put back" : "Take out"}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
