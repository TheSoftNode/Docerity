"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowUpIcon } from "lucide-react";

import { battleVoteAction } from "@/app/academy/battles/actions";
import { cn } from "@/lib/utils";

/**
 * A vote on a battle entry. The page re-renders after each vote so the
 * "votes left" count above the entries stays true.
 */
export function BattleVote({ slug, entryId, votes, voted, disabled, hint }: { slug: string; entryId: string; votes: number; voted: boolean; disabled: boolean; hint: string }) {
  const router = useRouter();
  const [state, setState] = useState({ votes, voted });
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-2">
      {message ? (
        <span role="status" className="text-[12px] text-[var(--ld-text-muted)]">
          {message}
        </span>
      ) : null}
      <button
        type="button"
        aria-pressed={state.voted}
        aria-label={`${state.voted ? "Take back your vote" : "Vote"} (${state.votes})`}
        title={disabled ? hint : undefined}
        disabled={disabled || pending}
        onClick={() =>
          start(async () => {
            const result = await battleVoteAction(slug, entryId);
            if (result.ok && typeof result.votes === "number") {
              setState({ votes: result.votes, voted: Boolean(result.voted) });
              setMessage("");
              router.refresh();
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
    </span>
  );
}
