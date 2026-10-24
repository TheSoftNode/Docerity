"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import {
  TIMING,
  finalText,
  notesAt,
  phaseAt,
  planEdits,
  runsAt,
  visibleText,
  wordCount,
  type HeroDoc,
  type Run,
} from "@/components/sections/contribute-page/contribute-content";

const PHASES = ["Draft", "Suggesting", "Final"] as const;

/** The editor's caret, with its name tag, at the end of what it is typing. */
function Caret({ big }: { big: boolean }) {
  return (
    <span
      className={cn(
        "relative mx-0.5 inline-block bg-[var(--ld-deep)] align-[-0.08em]",
        big ? "h-[0.9em] w-1" : "h-[1.15em] w-0.5 align-[-3px]"
      )}
    >
      <span className="absolute bottom-full left-[-1px] mb-1 rounded-[6px_6px_6px_0] bg-[var(--ld-deep)] px-1.5 py-px font-mono text-[10px] tracking-normal whitespace-nowrap text-white">
        Editor
      </span>
    </span>
  );
}

function Mark({ n, big }: { n: number; big: boolean }) {
  return (
    <sup
      className={cn(
        "ld-pop mx-0.5 inline-block rounded-[5px] bg-[var(--ld-deep)] px-1.5 py-px font-mono tracking-normal text-white",
        big ? "text-[13px]" : "text-[10px]"
      )}
    >
      {n}
    </sup>
  );
}

const RUN_STYLE: Record<Run["state"], { big: string; small: string }> = {
  plain: { big: "", small: "" },
  selected: { big: "rounded bg-[rgb(28_58_140/0.18)]", small: "rounded-[3px] bg-[rgb(28_58_140/0.18)]" },
  struck: {
    big: "text-[#9aa0b1] line-through decoration-[var(--ld-deep)] decoration-[5px]",
    small: "text-[#9aa0b1] line-through decoration-[var(--ld-deep)] decoration-2",
  },
  inserted: {
    big: "text-[var(--ld-deep)] underline decoration-[#AFC4FF] decoration-[5px] underline-offset-[0.12em]",
    small: "rounded-[3px] bg-[#dfe6fb] text-[var(--ld-ink)] shadow-[inset_0_-2px_0_var(--ld-deep)]",
  },
};

function Runs({ runs, big }: { runs: Run[]; big: boolean }) {
  return (
    <>
      {runs.map((run, index) => (
        <span key={index}>
          {index > 0 ? " " : null}
          <span className={RUN_STYLE[run.state][big ? "big" : "small"]}>{run.text}</span>
          {run.caret ? <Caret big={big} /> : null}
          {run.mark ? <Mark n={run.mark} big={big} /> : null}
        </span>
      ))}
    </>
  );
}

/**
 * The hero: this page's own heading and pitch as a document under review.
 *
 * It opens on a weak first draft, then the editor selects, strikes and
 * retypes each change and leaves a numbered note in the margin, until every
 * note resolves and the stamp lands. Then it plays again. It holds while the
 * pointer is on it and while it is off screen, and under reduced motion it
 * simply shows the finished page.
 *
 * The heading and pitch are given once more as plain, final text for
 * assistive tech and search engines; the tracked changes are decoration.
 */
function ReviewSheet({
  doc,
  eyebrow,
  fileName,
  byline,
  stamp,
  primary,
  secondary,
}: {
  doc: HeroDoc;
  eyebrow: string;
  fileName: string;
  byline: string;
  stamp: string;
  primary: { href: string; label: string };
  secondary: { href: string; label: string };
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const plan = useMemo(() => planEdits(doc), [doc]);
  const [tick, setTick] = useState(0);
  const [held, setHeld] = useState(false);
  const [inView, setInView] = useState(true);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduceMotion || held || !inView) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") setTick((value) => (value + 1) % plan.end);
    }, TIMING.tick);
    return () => window.clearInterval(timer);
  }, [reduceMotion, held, inView, plan.end]);

  /* Under reduced motion, the page as it ends up. */
  const now = reduceMotion ? plan.acceptAt : tick;
  const phase = phaseAt(plan, now);
  const accepted = phase === 2;
  const titleRuns = runsAt(doc, plan, "title", now);
  const ledeRuns = runsAt(doc, plan, "lede", now);
  const notes = notesAt(doc, plan, now);
  const words = wordCount(`${visibleText(titleRuns)} ${visibleText(ledeRuns)}`);

  return (
    <section
      ref={ref}
      aria-labelledby="contribute-title"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      className="relative -mt-[76px] overflow-hidden bg-[radial-gradient(1200px_600px_at_50%_0%,rgb(28_58_140/0.7),transparent_65%),var(--ld-ink)] px-3 pt-28 sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-[1360px]">
        {/* The editor's toolbar. */}
        <div className="ld-up flex flex-wrap items-center justify-between gap-x-[18px] gap-y-2.5 rounded-t-[18px] border border-b-0 border-[rgb(var(--ld-tint-rgb)/0.14)] bg-[#111d45] py-2.5 pr-3.5 pl-[18px] font-mono text-[12.5px] text-[var(--ld-muted-3)]">
          <span className="inline-flex items-center gap-3">
            <span className="text-[var(--ld-paper)]">{fileName}</span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] transition-colors duration-300",
                accepted
                  ? "bg-[rgb(255_122_89/0.16)] text-[#ffb39c]"
                  : phase === 1
                    ? "bg-[rgb(var(--ld-tint-rgb)/0.16)] text-[var(--ld-tint)]"
                    : "bg-[rgb(var(--ld-paper-rgb)/0.08)] text-[#adb0bd]"
              )}
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
              {accepted ? "approved" : phase === 1 ? "editor reviewing" : "first draft"}
            </span>
          </span>
          <ol aria-hidden="true" className="hidden items-center gap-3.5 lg:flex">
            {PHASES.map((label, index) => (
              <li key={label} className={cn("inline-flex items-center gap-1.5 uppercase", index === phase && "text-[var(--ld-paper)]")}>
                <span
                  className={cn(
                    "size-[7px] rounded-full",
                    index < phase
                      ? "bg-[#54D696]"
                      : index === phase
                        ? index === 2
                          ? "bg-[var(--ld-accent)]"
                          : "bg-[var(--ld-tint)]"
                        : "bg-[rgb(var(--ld-tint-rgb)/0.3)]"
                  )}
                />
                {label}
              </li>
            ))}
          </ol>
          <span className="inline-flex items-center gap-2.5">
            <span aria-hidden="true" className="inline-flex font-sans text-[10px] font-bold">
              <span className="grid size-7 place-items-center rounded-full border-2 border-[#111d45] bg-[#dfe6fb] text-[var(--ld-deep)]">YOU</span>
              <span className="-ml-2 grid size-7 place-items-center rounded-full border-2 border-[#111d45] bg-[var(--ld-deep)] text-white">ED</span>
            </span>
            {reduceMotion ? null : (
              <button
                type="button"
                onClick={() => setTick(0)}
                className="min-h-[30px] rounded-[9px] border border-[rgb(var(--ld-tint-rgb)/0.25)] px-2.5 text-xs text-[var(--ld-paper)] outline-none transition-colors hover:bg-[rgb(var(--ld-tint-rgb)/0.1)] focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)]"
              >
                ↺ Replay the edit
              </button>
            )}
          </span>
        </div>

        {/* The page itself, and its margin. */}
        <div className="ld-up ld-delay-1 grid rounded-b bg-white text-[var(--ld-ink)] shadow-[0_60px_120px_-60px_rgb(0_0_0/0.9)] lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="px-[clamp(22px,5vw,80px)] pt-[clamp(36px,5vw,72px)] pb-[clamp(32px,4vw,56px)] lg:border-r lg:border-[#eef1f8]">
            <p className="mb-5 inline-flex flex-wrap items-center gap-2.5 font-mono text-xs tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">
              <span className="rounded-full bg-[var(--ld-ink)] px-2.5 py-[3px] text-[10.5px] text-[var(--ld-paper)]">By invitation</span>
              {eyebrow}
            </p>
            <h1 id="contribute-title" className="ld-display max-w-[16ch] text-[clamp(44px,6.6vw,104px)] leading-[0.94] font-extrabold tracking-[-0.055em]">
              <span className="sr-only">
                {finalText(doc.title)}
                {doc.stop ? "." : ""}
              </span>
              <span aria-hidden="true">
                <Runs runs={titleRuns} big />
                {doc.stop ? <span className="text-[var(--ld-accent)]">.</span> : null}
              </span>
            </h1>
            <p className="mt-[30px] min-h-[6.2em] max-w-[40rem] text-[clamp(17px,1.45vw,20px)] leading-[1.65] text-[var(--ld-text-2)]">
              <span className="sr-only">{finalText(doc.lede)}</span>
              <span aria-hidden="true">
                <Runs runs={ledeRuns} big={false} />
              </span>
            </p>
            <div className="mt-[34px] flex flex-wrap items-center justify-between gap-[18px] border-t border-dashed border-[var(--ld-line)] pt-[22px]">
              <div className="flex flex-wrap gap-2.5">
                <a
                  href={primary.href}
                  className="inline-flex min-h-[50px] items-center gap-2 rounded-full bg-[var(--ld-ink)] px-[22px] text-[15px] font-semibold text-[var(--ld-paper)] outline-none transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)] focus-visible:ring-offset-2"
                >
                  {primary.label} <span aria-hidden="true">↓</span>
                </a>
                <Link
                  href={secondary.href}
                  className="inline-flex min-h-[50px] items-center rounded-full border border-[var(--ld-line-2)] px-[22px] text-[15px] font-semibold outline-none transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)] focus-visible:ring-offset-2"
                >
                  {secondary.label}
                </Link>
              </div>
              <span aria-hidden="true" className="inline-flex flex-wrap items-center gap-2 text-sm text-[var(--ld-text-muted)]">
                By
                <span className="inline-flex items-center gap-1 rounded-lg bg-[#eef1f8] px-2.5 py-[3px] font-semibold text-[var(--ld-ink)]">
                  {byline}
                  <span className="ld-blink inline-block h-[15px] w-0.5 bg-[var(--ld-ink)]" />
                </span>
                {accepted ? (
                  <span className="ld-stamp ml-2 rounded-lg border-2 border-[var(--ld-accent)] px-3 py-1.5 font-mono text-[11.5px] tracking-[0.08em] text-[#c2492b] uppercase">
                    {stamp}
                  </span>
                ) : null}
              </span>
            </div>
          </div>

          <aside aria-label="The editor's notes" className="border-t border-[#eef1f8] bg-[#fbfbfd] px-[18px] pt-[22px] pb-6 lg:border-t-0 lg:pt-[clamp(36px,5vw,72px)]">
            <p className="mb-3.5 font-mono text-[11px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">
              {accepted ? "All resolved" : notes.length ? `${notes.length} ${notes.length === 1 ? "comment" : "comments"}` : "Comments"}
            </p>
            {notes.length === 0 ? (
              <p className="text-sm leading-normal text-[var(--ld-text-muted)]">The draft as it came in. The editor is reading…</p>
            ) : (
              <ol className="grid gap-3">
                {notes.map((note) => (
                  <li
                    key={note.n}
                    className={cn(
                      "ld-note-in rounded-xl border bg-white px-[13px] py-3 shadow-[0_12px_26px_-22px_rgb(var(--ld-ink-rgb)/0.55)] transition-[opacity,border-color] duration-500",
                      accepted ? "border-[#cfe9dc] opacity-60" : "border-[var(--ld-line)]"
                    )}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-[7px]">
                        <span className={cn("rounded-[5px] px-1.5 py-px font-mono text-[10px] text-white", accepted ? "bg-[#2f9e6b]" : "bg-[var(--ld-deep)]")}>
                          {note.n}
                        </span>
                        <span className="text-[12.5px] font-semibold">Editor</span>
                      </span>
                      {accepted ? <span className="font-mono text-[10px] text-[#2f9e6b] uppercase">✓ Resolved</span> : null}
                    </span>
                    <span className="mt-[7px] block text-sm leading-[1.45]">{note.text}</span>
                  </li>
                ))}
              </ol>
            )}
            <dl aria-hidden="true" className="mt-[18px] grid grid-cols-2 gap-2.5 border-t border-[#eef1f8] pt-3.5 font-mono">
              <div className="flex flex-col-reverse">
                <dt className="text-[10.5px] text-[var(--ld-text-muted)] uppercase">Words</dt>
                <dd className="ld-display text-[30px] font-extrabold tracking-[-0.04em]">{words}</dd>
              </div>
              <div className="flex flex-col-reverse">
                <dt className="text-[10.5px] text-[var(--ld-text-muted)] uppercase">Resolved</dt>
                <dd className="ld-display text-[30px] font-extrabold tracking-[-0.04em]">
                  {accepted ? plan.count : 0}/{plan.count}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
        <div aria-hidden="true" className="mx-1 h-[3px] bg-[rgb(var(--ld-tint-rgb)/0.12)]">
          <div className="h-full bg-[var(--ld-tint)]" style={{ width: `${(now / plan.end) * 100}%` }} />
        </div>
        <div className="h-[clamp(56px,6vw,88px)]" />
      </div>
    </section>
  );
}

export { ReviewSheet };
