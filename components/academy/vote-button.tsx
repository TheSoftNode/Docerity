"use client";

import { useState, useTransition } from "react";
import { ArrowUpIcon } from "lucide-react";

import { voteAction } from "@/app/academy/projects/actions";
import { cn } from "@/lib/utils";

/** The upvote on a showcase card: on, off, and the count, saved on the server. */
export function VoteButton({ buildId, votes, voted, disabled, hint }: { buildId: string; votes: number; voted: boolean; disabled: boolean; hint: string }) {
  const [state, setState] = useState({ votes, voted });
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        aria-pressed={state.voted}
        aria-label={`${state.voted ? "Remove your upvote" : "Upvote"} (${state.votes})`}
        title={disabled ? hint : undefined}
        disabled={disabled || pending}
        onClick={() =>
          start(async () => {
            const result = await voteAction(buildId);
            if (result.ok && typeof result.votes === "number") {
              setState({ votes: result.votes, voted: Boolean(result.voted) });
              setMessage("");
            } else setMessage(result.message ?? "");
          })
        }
        className={cn(
          "inline-flex min-h-10 items-center gap-1.5 rounded-full border-[1.5px] px-3.5 text-[14px] font-bold transition-colors disabled:cursor-default",
          state.voted ? "border-[var(--ld-accent)] bg-[var(--ld-accent)] text-[#08102e]" : "border-[var(--ld-line-2)] text-[var(--ld-ink)] enabled:hover:border-[var(--ld-accent)]"
        )}
      >
        <ArrowUpIcon className="size-4" /> {state.votes}
      </button>
      {message ? (
        <span role="status" className="text-[12px] text-[var(--ld-text-muted)]">
          {message}
        </span>
      ) : null}
    </span>
  );
}
