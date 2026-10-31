"use client";

import { useActionState, useState } from "react";
import { LoaderCircleIcon, MessageCircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { replyToUpdate, type ReplyState } from "@/app/account/actions";
import { timeAgo } from "@/components/admin/admin-content";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export type ThreadReply = { id: string; from: "client" | "team"; name: string; body: string; createdAt: string };

/**
 * The conversation under one update: what has been said, in order, and a box
 * to add to it. The box starts open on an update that asks for the client's
 * input, and a button away on the rest.
 */
function UpdateThread({
  projectId,
  updateId,
  updateTitle,
  replies,
  askingYou,
}: {
  projectId: string;
  updateId: string;
  updateTitle: string;
  replies: ThreadReply[];
  askingYou: boolean;
}) {
  const [state, action, pending] = useActionState<ReplyState, FormData>(replyToUpdate, undefined);
  const [open, setOpen] = useState(askingYou && replies.length === 0);

  return (
    <div className="mt-4">
      {replies.length > 0 ? (
        <ol className="grid gap-3 border-l-2 border-border pl-4">
          {replies.map((reply) => (
            <li key={reply.id}>
              <p className="text-xs text-muted-foreground">
                <span className={cn("font-semibold", reply.from === "team" ? "text-primary" : "text-foreground")}>
                  {reply.from === "client" ? "You" : `${reply.name || "Docerity"} · Docerity`}
                </span>{" "}
                · {timeAgo(reply.createdAt)}
              </p>
              <p className="mt-1 text-[15px] leading-relaxed whitespace-pre-line text-foreground/90">{reply.body}</p>
            </li>
          ))}
        </ol>
      ) : null}

      {open ? (
        /* Keyed by how many have been sent, so the box empties after each one. */
        <form key={state?.sent ?? 0} action={action} className="mt-4 grid gap-2">
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="updateId" value={updateId} />
          <input type="hidden" name="updateTitle" value={updateTitle} />
          <label htmlFor={`reply-${updateId}`} className="sr-only">
            Your reply to {updateTitle}
          </label>
          <Textarea
            id={`reply-${updateId}`}
            name="body"
            required
            maxLength={4000}
            rows={3}
            placeholder={askingYou ? "Your answer" : "Write a reply"}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? <LoaderCircleIcon className="animate-spin" /> : null}
              Send reply
            </Button>
            {state?.message ? (
              <p role="alert" className="text-sm text-destructive">
                {state.message}
              </p>
            ) : state?.sent ? (
              <p role="status" className="text-sm font-medium text-brand-teal">
                Sent. The team has been told.
              </p>
            ) : null}
          </div>
        </form>
      ) : (
        <Button variant="ghost" size="sm" className="mt-2 -ml-3" onClick={() => setOpen(true)}>
          <MessageCircleIcon />
          {replies.length > 0 ? "Reply" : askingYou ? "Answer" : "Reply"}
        </Button>
      )}
    </div>
  );
}

export { UpdateThread };
