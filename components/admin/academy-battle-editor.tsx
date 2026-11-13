"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SaveIcon, Trash2Icon } from "lucide-react";

import { deleteBattleAction, saveBattleAction } from "@/app/admin/academy/battle-actions";
import { fromWat, toWat, type Battle } from "@/lib/academy/battles";
import { COURSE_LEVELS } from "@/lib/academy/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const field = "grid gap-1.5 text-[13px] font-medium text-muted-foreground";
const select = "h-10 rounded-xl border border-input bg-transparent px-3 text-sm text-foreground";

type Draft = Omit<Battle, "startsAt" | "submitBy" | "voteBy" | "rules"> & { startsAt: string; submitBy: string; voteBy: string; rules: string };

/** Everything about one battle. Times are typed in West Africa Time; nothing is stored until "Save battle". */
export function BattleEditor({ battle }: { battle: Battle }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>({ ...battle, startsAt: toWat(battle.startsAt), submitBy: toWat(battle.submitBy), voteBy: toWat(battle.voteBy), rules: battle.rules.join("\n") });
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const set = (patch: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setDirty(true);
    setMessage(null);
  };

  return (
    <div className="grid gap-5 pb-6">
      <div className="grid gap-4 rounded-[24px] border border-border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px_160px]">
          <label className={field}>
            Title
            <Input value={draft.title} onChange={(event) => set({ title: event.target.value })} />
          </label>
          <label className={field}>
            Level
            <select className={select} value={draft.level} onChange={(event) => set({ level: event.target.value as Battle["level"] })}>
              {COURSE_LEVELS.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </label>
          <label className={field}>
            Visibility
            <select className={select} value={draft.status} onChange={(event) => set({ status: event.target.value as Battle["status"] })}>
              <option value="draft">Draft (hidden)</option>
              <option value="published">Published</option>
            </select>
          </label>
        </div>
        <label className={field}>
          One-line pitch
          <Input value={draft.tagline} onChange={(event) => set({ tagline: event.target.value })} placeholder="Build a budget app that makes saving feel like a game." />
        </label>
        <fieldset className="grid gap-4 sm:grid-cols-3">
          <legend className="mb-2 text-[13px] font-medium text-foreground">Times (West Africa Time)</legend>
          <label className={field}>
            Entries open
            <Input type="datetime-local" value={draft.startsAt} onChange={(event) => set({ startsAt: event.target.value })} />
          </label>
          <label className={field}>
            Entries close
            <Input type="datetime-local" value={draft.submitBy} onChange={(event) => set({ submitBy: event.target.value })} />
          </label>
          <label className={field}>
            Voting ends
            <Input type="datetime-local" value={draft.voteBy} onChange={(event) => set({ voteBy: event.target.value })} />
          </label>
        </fieldset>
        <label className={field}>
          The challenge (Markdown: ## headings, - lists, `code`)
          <Textarea value={draft.brief} onChange={(event) => set({ brief: event.target.value })} rows={9} />
        </label>
        <label className={field}>
          Rules (one per line)
          <Textarea value={draft.rules} onChange={(event) => set({ rules: event.target.value })} rows={4} />
        </label>
      </div>

      <div className="sticky bottom-4 z-30 rounded-full border border-border bg-background/95 shadow-[0_20px_40px_-24px_rgb(0_0_0/0.6)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3 py-2 pr-2 pl-5">
          <p role="status" className={cn("text-sm", message ? (message.ok ? "text-[#1d7a52]" : "text-destructive") : "text-muted-foreground")}>
            {message?.text ?? (dirty ? "Unsaved changes." : "No changes yet.")}
          </p>
          <div className="flex gap-2">
            {!battle.results ? (
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={() => {
                  if (!window.confirm(`Delete "${battle.title}" and all its entries? This can't be undone.`)) return;
                  start(async () => {
                    const result = await deleteBattleAction(battle.slug);
                    if (result.ok) router.push("/admin/academy/battles");
                    else setMessage({ ok: false, text: result.message });
                  });
                }}
              >
                <Trash2Icon /> Delete
              </Button>
            ) : null}
            <Button
              type="button"
              disabled={pending || !dirty}
              onClick={() =>
                start(async () => {
                  const result = await saveBattleAction(battle.slug, {
                    ...draft,
                    startsAt: fromWat(draft.startsAt),
                    submitBy: fromWat(draft.submitBy),
                    voteBy: fromWat(draft.voteBy),
                    rules: draft.rules.split("\n"),
                  });
                  if (result.ok) {
                    setDirty(false);
                    setMessage({ ok: true, text: draft.status === "published" ? "Saved. Students see the changes now." : "Saved as a draft." });
                    router.refresh();
                  } else setMessage({ ok: false, text: result.message });
                })
              }
            >
              <SaveIcon /> Save battle
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
