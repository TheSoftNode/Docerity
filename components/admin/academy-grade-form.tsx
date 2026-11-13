"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckIcon } from "lucide-react";

import { gradeSubmissionAction } from "@/app/admin/academy/assignment-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Line = { criterion: string; max: number; points: number | ""; comment: string };

/**
 * Marks a hand-in against its guide. When the AI marked it first, its points
 * and comments are already filled in: confirm as they are, or change them.
 */
export function GradeForm({ id, lines, feedback, confirmLabel }: { id: string; lines: Line[]; feedback: string; confirmLabel: string }) {
  const router = useRouter();
  const [rows, setRows] = useState(lines);
  const [note, setNote] = useState(feedback);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const max = rows.reduce((sum, row) => sum + row.max, 0);
  const got = rows.reduce((sum, row) => sum + (Number(row.points) || 0), 0);
  const score = max ? Math.round((got / max) * 100) : 0;

  return (
    <div className="grid gap-3">
      {rows.map((row, index) => (
        <div key={row.criterion} className="grid gap-1.5 rounded-xl border border-border p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] font-medium text-foreground">{row.criterion}</p>
            <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Input
                type="number"
                min={0}
                max={row.max}
                value={row.points}
                onChange={(event) => setRows(rows.map((item, i) => (i === index ? { ...item, points: event.target.value === "" ? "" : Number(event.target.value) } : item)))}
                aria-label={`Points for ${row.criterion}`}
                className="h-9 w-16"
              />
              / {row.max}
            </span>
          </div>
          <Input value={row.comment} onChange={(event) => setRows(rows.map((item, i) => (i === index ? { ...item, comment: event.target.value } : item)))} placeholder="Why (optional)" aria-label={`Comment on ${row.criterion}`} className="h-9" />
        </div>
      ))}
      <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="Feedback for the student: what works, and the one or two things to fix." aria-label="Feedback" />
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          disabled={pending}
          onClick={() => {
            if (rows.some((row) => row.points === "")) return setError("Give points for every line.");
            start(async () => {
              const result = await gradeSubmissionAction(id, { criteria: rows.map((row) => ({ points: Number(row.points), comment: row.comment })), feedback: note });
              if (result.ok) router.refresh();
              else setError(result.message);
            });
          }}
        >
          <CheckIcon /> {confirmLabel}
        </Button>
        <span className="text-sm font-semibold text-foreground">
          {score}% · {score >= 70 ? "passes" : "doesn't pass"}
        </span>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
