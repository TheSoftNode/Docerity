"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { PlusIcon } from "lucide-react";

import { createBattleAction } from "@/app/admin/academy/battle-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** "New battle": a title, then straight into the editor. Starts as a draft with a week to build. */
export function NewBattleButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <PlusIcon />
        New battle
      </Button>
    );
  }

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        start(async () => {
          const result = await createBattleAction(title);
          if (result.ok && result.slug) router.push(`/admin/academy/battles/${result.slug}`);
          else if (!result.ok) setError(result.message);
        });
      }}
    >
      <Input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Battle title" aria-label="Battle title" className="w-64" />
      <Button type="submit" disabled={pending || !title.trim()}>
        Create
      </Button>
      <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      {error ? <p className="w-full text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
