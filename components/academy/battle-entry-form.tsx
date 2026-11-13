"use client";

import { useActionState } from "react";
import { LoaderCircleIcon, SwordsIcon } from "lucide-react";

import { enterBattleAction, type EntryState } from "@/app/academy/battles/actions";
import { cn } from "@/lib/utils";

const input =
  "h-12 w-full rounded-[14px] border-[1.5px] border-[var(--ld-line)] bg-white px-4 text-[15px] font-normal text-[var(--ld-ink)] outline-none transition-colors focus:border-[var(--ld-deep)] aria-invalid:border-[#ff7a59]";

type Values = { title: string; repoUrl: string; liveUrl: string; note: string };

function Field({ name, label, error, children }: { name: string; label: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-[14px] font-semibold text-[var(--ld-ink)]">
      <span>{label}</span>
      {children}
      {error ? (
        <span id={`${name}-error`} className="text-[13px] font-normal text-[#b4401f]">
          {error}
        </span>
      ) : null}
    </label>
  );
}

/** Entering a battle, or updating the entry while entries are open. */
export function BattleEntryForm({ slug, initial, entered }: { slug: string; initial: Values; entered: boolean }) {
  const [state, action, pending] = useActionState<EntryState, FormData>(enterBattleAction, {});
  const values = state.values ?? initial;
  const errors = state.errors ?? {};
  const isIn = entered || state.ok;
  const aria = (name: keyof Values) => ({ "aria-invalid": Boolean(errors[name as keyof typeof errors]), "aria-describedby": errors[name as keyof typeof errors] ? `${name}-error` : undefined });

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="battle" value={slug} />
      <Field name="title" label="Name your entry" error={errors.title}>
        <input name="title" required maxLength={120} defaultValue={values.title} placeholder="Pocket Budget" className={input} {...aria("title")} />
      </Field>
      <Field name="repoUrl" label="GitHub repository" error={errors.repoUrl}>
        <input name="repoUrl" type="url" required defaultValue={values.repoUrl} placeholder="https://github.com/you/project" className={input} {...aria("repoUrl")} />
      </Field>
      <Field name="liveUrl" label="Live site" error={errors.liveUrl}>
        <input name="liveUrl" type="url" required defaultValue={values.liveUrl} placeholder="https://your-entry.vercel.app" className={input} {...aria("liveUrl")} />
      </Field>
      <Field
        name="note"
        label={
          <>
            What makes it yours <span className="font-normal text-[var(--ld-text-muted)]">(optional)</span>
          </>
        }
      >
        <textarea name="note" rows={3} defaultValue={values.note} placeholder="The idea, the part you're proudest of." className={cn(input, "h-auto py-3")} />
      </Field>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--ld-accent)] px-6 text-[15px] font-bold text-[#08102e] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? <LoaderCircleIcon className="size-4 animate-spin" /> : <SwordsIcon className="size-4" />}
        {isIn ? "Update my entry" : "Enter the battle"}
      </button>
      {state.message ? (
        <p role={state.ok ? "status" : "alert"} className={cn("rounded-2xl px-4 py-3 text-[15px]", state.ok ? "bg-[#e3f6ec] text-[#0f4d33]" : "bg-[#fff0eb] text-[#7a2a14]")}>
          {state.message}
          {state.xp ? <strong className="ml-1">+{state.xp} XP</strong> : null}
        </p>
      ) : null}
    </form>
  );
}
