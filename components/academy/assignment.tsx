"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRightIcon, CheckIcon, ClockIcon, LoaderCircleIcon, SendIcon, SparklesIcon, UserCheckIcon } from "lucide-react";

import { submitAssignmentAction, type HandInState } from "@/app/academy/actions";
import { EarnedNote } from "@/components/academy/earned-toast";
import type { Grade } from "@/lib/academy/assignments";
import type { HandInKind, RubricItem } from "@/lib/academy/types";
import { cn } from "@/lib/utils";

const input =
  "w-full rounded-[14px] border-[1.5px] border-[var(--ld-line)] bg-white px-4 text-[15px] font-normal text-[var(--ld-ink)] outline-none transition-colors focus:border-[var(--ld-deep)] aria-invalid:border-[#ff7a59]";

export type SubmissionView = {
  status: "waiting" | "graded";
  grade: Grade | null;
  gradedBy: "ai" | "teacher" | "";
  checked: boolean;
  submittedAt: string;
  values: { answer: string; repoUrl: string; liveUrl: string };
};

function GradeCard({ grade, by, checked }: { grade: Grade; by: "ai" | "teacher" | ""; checked: boolean }) {
  return (
    <div className={cn("rounded-[24px] border-[1.5px] p-6 sm:p-7", grade.passed ? "border-[#4cc59a] bg-[#f1fbf6]" : "border-[#ffb59f] bg-[#fff6f2]")} data-grade={grade.score}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={cn("text-[14px] font-semibold", grade.passed ? "text-[#1d7a52]" : "text-[#b4401f]")}>{grade.passed ? "Passed" : "Not passed yet"}</p>
          <p className="ld-display text-[48px] leading-none font-extrabold tracking-[-0.04em] text-[var(--ld-ink)]">{grade.score}%</p>
        </div>
        <p className="inline-flex items-center gap-1.5 text-[13px] text-[var(--ld-text-2)]">
          {by === "ai" ? <SparklesIcon className="size-4" /> : <UserCheckIcon className="size-4" />}
          {by === "ai" ? (checked ? "Marked by AI, checked by your teacher" : "Marked by AI; your teacher may adjust it") : "Marked by your teacher"}
        </p>
      </div>
      {grade.feedback ? <p className="mt-5 text-[16px] leading-relaxed whitespace-pre-line text-[var(--ld-ink)]">{grade.feedback}</p> : null}
      <ul className="mt-5 grid gap-3 border-t border-[rgb(8_16_46/0.1)] pt-5">
        {grade.criteria.map((item) => (
          <li key={item.criterion} className="grid gap-1">
            <p className="flex items-start justify-between gap-4 text-[15px] font-semibold text-[var(--ld-ink)]">
              <span>{item.criterion}</span>
              <span className="shrink-0 tabular-nums">
                {item.points}/{item.max}
              </span>
            </p>
            {item.comment ? <p className="text-[14.5px] leading-relaxed text-[var(--ld-text-2)]">{item.comment}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * An assignment: the marking guide, the hand-in form, and the grade, all in
 * one place. Handing in marks it straight away when AI marking is on; a pass
 * completes the lesson. Not passed yet? Improve it and hand it in again.
 */
export function Assignment({
  slug,
  lessonId,
  handIn,
  rubric,
  tracked,
  aiOn,
  submission,
  nextHref,
}: {
  slug: string;
  lessonId: string;
  handIn: HandInKind;
  rubric: RubricItem[];
  tracked: boolean;
  aiOn: boolean;
  submission: SubmissionView | null;
  nextHref: string | null;
}) {
  const [state, action, pending] = useActionState<HandInState, FormData>(submitAssignmentAction, {});
  const values = state.values ?? submission?.values ?? { answer: "", repoUrl: "", liveUrl: "" };
  const errors = state.errors ?? {};
  const total = rubric.reduce((sum, item) => sum + item.points, 0);

  const justGraded = state.ok && state.outcome === "graded" && state.grade ? state.grade : null;
  const justWaiting = state.ok && state.outcome === "waiting";
  const shownGrade = justGraded ?? (!state.ok && submission?.status === "graded" ? submission.grade : null);
  const shownBy = justGraded ? "ai" : (submission?.gradedBy ?? "");
  const waiting = justWaiting || (!state.ok && submission?.status === "waiting");
  const passed = Boolean(shownGrade?.passed);

  return (
    <div className="grid gap-6">
      <div className="rounded-[28px] bg-[var(--ld-card)] shadow-[0_1px_0_rgb(8_16_46/0.04),0_24px_48px_-32px_rgb(8_16_46/0.22)] ring-1 ring-[rgb(8_16_46/0.06)] p-6 sm:p-7">
        <h2 className="ld-display text-[22px] font-bold tracking-[-0.02em]">How it&apos;s marked</h2>
        <p className="mt-1 text-[14px] text-[var(--ld-text-muted)]">
          {total} points in all; 70% passes. {aiOn ? "It's marked the moment you hand it in, and a teacher can adjust the grade." : "Your teacher marks it and the grade appears here."}
        </p>
        <ul className="mt-4 grid gap-2.5">
          {rubric.map((item) => (
            <li key={item.criterion} className="flex items-start justify-between gap-4 text-[15.5px] leading-relaxed text-[var(--ld-text-2)]">
              <span className="flex gap-3">
                <CheckIcon className="mt-1 size-4 shrink-0 text-[var(--ld-deep)]" />
                {item.criterion}
              </span>
              <span className="shrink-0 font-semibold text-[var(--ld-ink)] tabular-nums">{item.points} pts</span>
            </li>
          ))}
        </ul>
      </div>

      {shownGrade ? <GradeCard grade={shownGrade} by={shownBy} checked={Boolean(submission?.checked) && !justGraded} /> : null}
      {state.earned ? <EarnedNote earned={state.earned} /> : null}

      {waiting ? (
        <p role="status" className="flex items-start gap-3 rounded-[20px] bg-[#e6ecff] p-5 text-[15.5px] leading-relaxed text-[var(--ld-ink)]">
          <ClockIcon className="mt-0.5 size-5 shrink-0 text-[var(--ld-deep)]" />
          {state.message ?? "Handed in. Your teacher will mark it and you'll see the grade here."}
        </p>
      ) : null}

      {passed ? (
        nextHref ? (
          <Link href={nextHref} className="inline-flex h-12 items-center gap-2 justify-self-start rounded-full bg-[var(--ld-ink)] px-6 text-[15px] font-bold text-[var(--ld-paper)]">
            Next lesson <ArrowRightIcon className="size-4" />
          </Link>
        ) : null
      ) : !tracked ? (
        <p className="rounded-[20px] bg-[#e6ecff] p-5 text-[15px] text-[var(--ld-ink)]">Enrol in the course to hand this in.</p>
      ) : (
        <form action={action} className="grid gap-4 rounded-[28px] bg-[var(--ld-card)] shadow-[0_1px_0_rgb(8_16_46/0.04),0_24px_48px_-32px_rgb(8_16_46/0.22)] ring-1 ring-[rgb(8_16_46/0.06)] p-6 sm:p-7" id="hand-in">
          <h2 className="ld-display text-[22px] font-bold tracking-[-0.02em]">{shownGrade || waiting ? "Hand it in again" : "Hand it in"}</h2>
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="lessonId" value={lessonId} />
          {handIn === "link" ? (
            <>
              <label className="grid gap-1.5 text-[14px] font-semibold text-[var(--ld-ink)]">
                <span>GitHub repository</span>
                <input name="repoUrl" type="url" required defaultValue={values.repoUrl} placeholder="https://github.com/you/project" className={cn(input, "h-12")} aria-invalid={Boolean(errors.repoUrl)} />
                {errors.repoUrl ? <span className="text-[13px] font-normal text-[#b4401f]">{errors.repoUrl}</span> : null}
              </label>
              <label className="grid gap-1.5 text-[14px] font-semibold text-[var(--ld-ink)]">
                <span>
                  Live site <span className="font-normal text-[var(--ld-text-muted)]">(optional)</span>
                </span>
                <input name="liveUrl" type="url" defaultValue={values.liveUrl} placeholder="https://your-project.vercel.app" className={cn(input, "h-12")} aria-invalid={Boolean(errors.liveUrl)} />
                {errors.liveUrl ? <span className="text-[13px] font-normal text-[#b4401f]">{errors.liveUrl}</span> : null}
              </label>
            </>
          ) : null}
          <label className="grid gap-1.5 text-[14px] font-semibold text-[var(--ld-ink)]">
            <span>{handIn === "link" ? "What you built, and how" : "Your answer"}</span>
            <textarea
              name="answer"
              required
              rows={handIn === "link" ? 5 : 12}
              defaultValue={values.answer}
              placeholder={handIn === "link" ? "The choices you made, what was hard, what you'd do next." : "Write your answer, or paste your code."}
              className={cn(input, "py-3 font-mono text-[14px] leading-relaxed")}
              aria-invalid={Boolean(errors.answer)}
            />
            {errors.answer ? <span className="text-[13px] font-normal text-[#b4401f]">{errors.answer}</span> : null}
          </label>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 items-center justify-center gap-2 justify-self-start rounded-full bg-[var(--ld-accent)] px-6 text-[15px] font-bold text-[#08102e] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {pending ? <LoaderCircleIcon className="size-4 animate-spin" /> : <SendIcon className="size-4" />}
            {pending ? (aiOn ? "Marking…" : "Sending…") : "Hand it in"}
          </button>
          {state.message && !state.ok ? (
            <p role="alert" className="rounded-2xl bg-[#fff0eb] px-4 py-3 text-[15px] text-[#7a2a14]">
              {state.message}
            </p>
          ) : null}
          {justGraded && !justGraded.passed ? (
            <p role="status" className="text-[14px] text-[var(--ld-text-2)]">
              {state.message}
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}
