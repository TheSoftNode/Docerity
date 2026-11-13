"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowRightIcon, CheckIcon, LoaderCircleIcon, RotateCcwIcon } from "lucide-react";

import { submitQuizAction } from "@/app/academy/actions";
import type { Earned } from "@/lib/academy/types";
import { EarnedNote } from "@/components/academy/earned-toast";
import type { QuizResult } from "@/lib/academy/types";
import { cn } from "@/lib/utils";

/** A question as the browser gets it: no answers, those stay on the server. */
export type PublicQuestion = { id: string; prompt: string; code: string; options: string[]; multi: boolean };

const LETTERS = "ABCDEFGH";

/**
 * A quiz: every question on one page, options as large tiles. Submitting
 * marks it on the server and turns each question green or red with the
 * reason, in place, so nothing jumps elsewhere. Retake as often as needed;
 * the best score is kept.
 */
export function Quiz({
  slug,
  lessonId,
  questions,
  passMark,
  best,
  tracked,
  nextHref,
}: {
  slug: string;
  lessonId: string;
  questions: PublicQuestion[];
  passMark: number;
  best: number | null;
  tracked: boolean;
  nextHref: string | null;
}) {
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [earned, setEarned] = useState<Earned | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const answered = questions.filter((question) => (answers[question.id] ?? []).length > 0).length;
  const review = new Map(result?.review.map((item) => [item.id, item] as const));

  function choose(question: PublicQuestion, option: number) {
    if (result) return;
    setAnswers((current) => {
      const chosen = current[question.id] ?? [];
      const next = question.multi ? (chosen.includes(option) ? chosen.filter((value) => value !== option) : [...chosen, option]) : [option];
      return { ...current, [question.id]: next };
    });
  }

  function submit() {
    setError("");
    start(async () => {
      const outcome = await submitQuizAction(slug, lessonId, answers);
      if (outcome.ok) {
        setResult(outcome.result);
        setEarned(outcome.earned);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError(outcome.message);
      }
    });
  }

  function retake() {
    setAnswers({});
    setResult(null);
    setEarned(null);
  }

  return (
    <div>
      {result ? (
        <div
          className={cn(
            "ld-pop mb-8 rounded-[24px] p-6 sm:p-7",
            result.passed ? "bg-[#e3f6ec] text-[#0f4d33]" : "bg-[#fff0eb] text-[#7a2a14]"
          )}
          role="status"
        >
          <p className="ld-display text-[40px] leading-none font-extrabold tracking-[-0.04em]">{result.score}%</p>
          <p className="mt-2 text-[16px] font-semibold">
            {result.perfect ? "Perfect. Every answer right." : result.passed ? "Passed. The next module is open." : `Not yet. You need ${passMark}% to pass; read the reasons below and try again.`}
          </p>
          {earned ? <EarnedNote earned={earned} /> : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={retake}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-current/25 px-5 text-[15px] font-semibold"
            >
              <RotateCcwIcon className="size-4" /> {result.passed ? "Take it again" : "Try again"}
            </button>
            {result.passed && nextHref ? (
              <Link href={nextHref} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#08102e] px-5 text-[15px] font-semibold text-[#f4f5fa]">
                Next lesson <ArrowRightIcon className="size-4" />
              </Link>
            ) : null}
          </div>
        </div>
      ) : best !== null ? (
        <p className="mb-6 text-[15px] text-[var(--ld-text-muted)]">
          Your best so far: <strong className="text-[var(--ld-ink)]">{best}%</strong>
          {best >= passMark ? ", passed." : `. Pass mark ${passMark}%.`}
        </p>
      ) : null}

      <ol className="grid gap-5 pb-2">
        {questions.map((question, index) => {
          const chosen = answers[question.id] ?? [];
          const marked = review.get(question.id);
          return (
            <li
              key={question.id}
              className={cn(
                "rounded-[22px] border bg-[var(--ld-card)] p-5 sm:p-6",
                marked ? (marked.correct ? "border-[#4cc59a]" : "border-[#ff7a59]") : "border-[var(--ld-line)]"
              )}
            >
              <p className="text-[13px] font-semibold text-[var(--ld-text-muted)]">
                Question {index + 1} of {questions.length}
                {question.multi ? " · choose all that apply" : ""}
              </p>
              <p className="mt-1.5 text-[18px] leading-snug font-semibold text-[var(--ld-ink)]">{question.prompt}</p>
              {question.code ? (
                <pre className="mt-3 overflow-x-auto rounded-[14px] bg-[#0b1433] px-4 py-3 font-mono text-[13.5px] leading-[1.7] text-[#dfe6ff]">
                  <code>{question.code}</code>
                </pre>
              ) : null}
              <div role={question.multi ? "group" : "radiogroup"} aria-label={question.prompt} className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {question.options.map((option, optionIndex) => {
                  const picked = chosen.includes(optionIndex);
                  const right = marked?.answer.includes(optionIndex);
                  return (
                    <button
                      key={optionIndex}
                      type="button"
                      role={question.multi ? "checkbox" : "radio"}
                      aria-checked={picked}
                      disabled={Boolean(result)}
                      onClick={() => choose(question, optionIndex)}
                      className={cn(
                        "flex min-h-13 items-center gap-3 rounded-[14px] border-[1.5px] px-3.5 py-2.5 text-left text-[15px] transition-colors",
                        marked
                          ? right
                            ? "border-[#4cc59a] bg-[#e3f6ec] text-[#0f4d33]"
                            : picked
                              ? "border-[#ff7a59] bg-[#fff0eb] text-[#7a2a14]"
                              : "border-[var(--ld-line)] text-[var(--ld-text-muted)]"
                          : picked
                            ? "border-[var(--ld-deep)] bg-[#e6ecff] text-[var(--ld-ink)]"
                            : "border-[var(--ld-line)] text-[var(--ld-ink)] hover:border-[var(--ld-line-2)] hover:bg-[var(--ld-paper)]"
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-lg text-[13px] font-bold",
                          picked && !marked ? "bg-[var(--ld-deep)] text-white" : marked && right ? "bg-[#4cc59a] text-white" : "bg-[var(--ld-paper-2)] text-[var(--ld-text-muted)]"
                        )}
                      >
                        {marked && right ? <CheckIcon className="size-4" /> : LETTERS[optionIndex]}
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>
              {marked ? (
                <p className={cn("mt-4 text-[15px] leading-relaxed", marked.correct ? "text-[#0f4d33]" : "text-[#7a2a14]")}>
                  <strong>{marked.correct ? "Right. " : "Not quite. "}</strong>
                  {marked.explain}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      {!result ? (
        <div className="sticky bottom-4 z-10 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-full border border-[var(--ld-line)] bg-[var(--ld-card)]/95 py-2 pr-2 pl-5 shadow-[0_20px_40px_-24px_rgb(8_16_46/0.45)] backdrop-blur">
          <span className="text-[14px] text-[var(--ld-text-muted)]">
            {answered} of {questions.length} answered
          </span>
          {tracked ? (
            <button
              type="button"
              onClick={submit}
              disabled={pending || answered < questions.length}
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--ld-accent)] px-5 text-[15px] font-bold text-[#08102e] transition-opacity disabled:opacity-50"
            >
              {pending ? <LoaderCircleIcon className="size-4 animate-spin" /> : null}
              Check my answers
            </button>
          ) : (
            <span className="text-[14px] font-semibold text-[var(--ld-ink)]">Enrol to take the quiz</span>
          )}
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-sm text-[#b4401f]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
