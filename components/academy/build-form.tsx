"use client";

import { useActionState } from "react";
import { LoaderCircleIcon, RocketIcon } from "lucide-react";

import { submitBuildAction, type SubmitState } from "@/app/academy/projects/actions";
import { cn } from "@/lib/utils";

const input =
  "h-12 w-full rounded-[14px] border-[1.5px] border-[var(--ld-line)] bg-white px-4 text-[15px] text-[var(--ld-ink)] outline-none transition-colors focus:border-[var(--ld-deep)] aria-invalid:border-[#ff7a59]";

/** Handing a build in: the repository, the live site, and a note for the reviewer. */
export function BuildForm({ briefId, initial, again }: { briefId: string; initial: { repoUrl: string; liveUrl: string; note: string }; again: boolean }) {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitBuildAction, {});
  const values = state.values ?? initial;

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="briefId" value={briefId} />
      <label className="grid gap-1.5 text-[14px] font-semibold text-[var(--ld-ink)]">
        GitHub repository
        <input
          name="repoUrl"
          type="url"
          required
          defaultValue={values.repoUrl}
          placeholder="https://github.com/you/project"
          aria-invalid={Boolean(state.errors?.repoUrl)}
          aria-describedby={state.errors?.repoUrl ? "repo-error" : undefined}
          className={input}
        />
        {state.errors?.repoUrl ? (
          <span id="repo-error" className="text-[13px] font-normal text-[#b4401f]">
            {state.errors.repoUrl}
          </span>
        ) : null}
      </label>
      <label className="grid gap-1.5 text-[14px] font-semibold text-[var(--ld-ink)]">
        Live site
        <input
          name="liveUrl"
          type="url"
          required
          defaultValue={values.liveUrl}
          placeholder="https://your-project.vercel.app"
          aria-invalid={Boolean(state.errors?.liveUrl)}
          aria-describedby={state.errors?.liveUrl ? "live-error" : undefined}
          className={input}
        />
        {state.errors?.liveUrl ? (
          <span id="live-error" className="text-[13px] font-normal text-[#b4401f]">
            {state.errors.liveUrl}
          </span>
        ) : null}
      </label>
      <label className="grid gap-1.5 text-[14px] font-semibold text-[var(--ld-ink)]">
        <span>
          A note for the reviewer <span className="font-normal text-[var(--ld-text-muted)]">(optional)</span>
        </span>
        <textarea
          name="note"
          rows={3}
          defaultValue={values.note}
          placeholder="What you are proud of, what you'd do next, anything you got stuck on."
          className={cn(input, "h-auto py-3")}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 items-center justify-center gap-2 justify-self-start rounded-full bg-[var(--ld-accent)] px-6 text-[15px] font-bold text-[#08102e] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {pending ? <LoaderCircleIcon className="size-4 animate-spin" /> : <RocketIcon className="size-4" />}
        {again ? "Hand it in again" : "Hand it in"}
      </button>
      {state.message ? (
        <p role={state.ok ? "status" : "alert"} className={cn("rounded-2xl px-4 py-3 text-[15px]", state.ok ? "bg-[#e3f6ec] text-[#0f4d33]" : "bg-[#fff0eb] text-[#7a2a14]")}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
