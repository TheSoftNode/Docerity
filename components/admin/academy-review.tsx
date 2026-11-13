"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckIcon, RotateCcwIcon } from "lucide-react";

import { reviewBuildAction } from "@/app/admin/academy/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/** The reviewer's two answers to a handed-in build, with a note the student sees. */
export function BuildReview({ buildId }: { buildId: string }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const decide = (decision: "approved" | "changes") =>
    start(async () => {
      const result = await reviewBuildAction(buildId, decision, feedback);
      if (result.ok) router.refresh();
      else setError(result.message);
    });

  return (
    <div className="grid gap-3">
      <Textarea
        value={feedback}
        onChange={(event) => setFeedback(event.target.value)}
        rows={3}
        placeholder="Feedback for the student: what works, and what to change (needed when asking for changes)."
        aria-label="Feedback"
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={pending} onClick={() => decide("approved")}>
          <CheckIcon /> Approve
        </Button>
        <Button type="button" variant="outline" disabled={pending} onClick={() => decide("changes")}>
          <RotateCcwIcon /> Ask for changes
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
