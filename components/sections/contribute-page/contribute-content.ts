/*
  The Write for us page's self-editing hero and sizing slider, as pure
  functions.

  The hero is the page's own heading and pitch, arriving as a weak first
  draft and edited in front of the reader. Everything in it comes from the
  contribute block: the heading as it ends up, the phrase it replaced, and
  the pitch as a list of before-and-after pieces. This file turns that into
  a schedule (what is selected, struck, typed and noted at each moment) and
  into the tracked-change runs for one moment. Pure, so it is tested without
  a browser (see e2e/contribute-content.spec.ts).
*/

import { titlePieces } from "@/components/sections/mentorship-page/mentorship-content";

/** One piece of the pitch, as edited in the admin. */
export type Piece = { before: string; after: string; note: string };

/** A run of text either left alone or changed, with the editor's note on it. */
export type Segment = { keep: string } | { before: string; after: string; note: string };

export type HeroDoc = { title: Segment[]; lede: Segment[]; stop: boolean };

/** The heading and pitch as segments, ready to schedule. */
export function heroDoc(title: string, draft: { crossedOut: string; note: string }, edits: readonly Piece[]): HeroDoc {
  const pieces = titlePieces(title);
  const stop = pieces.some((piece) => piece.stop);
  const words = pieces.filter((piece) => !piece.stop);
  const lit = words.findIndex((piece) => piece.emphasis);
  const crossed = draft.crossedOut.trim();

  const titleSegments: Segment[] = [];
  words.forEach((piece, index) => {
    const text = piece.text.trim();
    if (!text) return;
    if (index === lit && crossed) titleSegments.push({ before: crossed, after: text, note: draft.note.trim() });
    else titleSegments.push({ keep: text });
  });

  const lede: Segment[] = edits
    .map((piece) => ({ before: piece.before.trim(), after: piece.after.trim(), note: piece.note.trim() }))
    .filter((piece) => piece.before || piece.after)
    .map((piece) => (piece.before === piece.after ? { keep: piece.after } : piece));

  return { title: titleSegments, lede, stop };
}

/** What a list of segments reads as once every edit is accepted. */
export function finalText(segments: readonly Segment[]): string {
  return segments
    .map((segment) => ("keep" in segment ? segment.keep : segment.after))
    .filter(Boolean)
    .join(" ");
}

/** What it read as before anybody touched it. */
export function draftText(segments: readonly Segment[]): string {
  return segments
    .map((segment) => ("keep" in segment ? segment.keep : segment.before))
    .filter(Boolean)
    .join(" ");
}

export function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** When one change happens, in ticks. */
export type Step = {
  /** Its number in the margin. */
  n: number;
  selectAt: number;
  strikeAt: number;
  typeStart: number;
  typeEnd: number;
  /** Characters typed per tick. */
  speed: number;
  noteAt: number;
};

export type Plan = { steps: Record<string, Step>; count: number; acceptAt: number; end: number };

/** How long the draft sits untouched, and the final version holds, in ticks. */
export const TIMING = { tick: 60, opening: 24, select: 14, strike: 8, note: 18, beforeAccept: 6, holdFinal: 80 } as const;

/**
 * The edit as a schedule: each change in turn is selected, struck, retyped
 * and noted in the margin, the heading first and slowly, then the pitch.
 * Text left alone takes no time.
 */
export function planEdits(doc: HeroDoc): Plan {
  let t: number = TIMING.opening;
  let n = 0;
  const steps: Record<string, Step> = {};

  for (const part of ["title", "lede"] as const) {
    doc[part].forEach((segment, index) => {
      if ("keep" in segment) return;
      const speed = part === "title" ? 1 : 3;
      const step: Step = { n: ++n, selectAt: Infinity, strikeAt: Infinity, typeStart: Infinity, typeEnd: Infinity, speed, noteAt: 0 };
      if (segment.before) {
        step.selectAt = t;
        t += TIMING.select;
        step.strikeAt = t;
        t += TIMING.strike;
      }
      if (segment.after) {
        step.typeStart = t;
        t += Math.ceil(segment.after.length / speed);
        step.typeEnd = t;
      }
      step.noteAt = t;
      t += TIMING.note;
      steps[`${part}-${index}`] = step;
    });
  }

  const acceptAt = t + TIMING.beforeAccept;
  return { steps, count: n, acceptAt, end: acceptAt + TIMING.holdFinal };
}

export type RunState = "plain" | "selected" | "struck" | "inserted";
export type Run = { text: string; state: RunState; caret: boolean; mark: number };

/** One part of the hero (heading or pitch) as tracked-change runs at a moment. */
export function runsAt(doc: HeroDoc, plan: Plan, part: "title" | "lede", tick: number): Run[] {
  const accepted = tick >= plan.acceptAt;
  const runs: Run[] = [];

  doc[part].forEach((segment, index) => {
    if ("keep" in segment) {
      runs.push({ text: segment.keep, state: "plain", caret: false, mark: 0 });
      return;
    }
    const step = plan.steps[`${part}-${index}`];
    const noted = tick >= step.noteAt && segment.note !== "";

    if (segment.before && !accepted) {
      const struck = tick >= step.strikeAt;
      const selected = tick >= step.selectAt && !struck;
      runs.push({
        text: segment.before,
        state: struck ? "struck" : selected ? "selected" : "plain",
        caret: false,
        mark: noted && !segment.after ? step.n : 0,
      });
    }
    if (segment.after) {
      const typed = accepted ? segment.after.length : Math.max(0, Math.min(segment.after.length, (tick - step.typeStart) * step.speed));
      if (typed > 0) {
        runs.push({
          text: segment.after.slice(0, typed),
          state: accepted ? "plain" : "inserted",
          caret: !accepted && tick < step.typeEnd,
          mark: noted && !accepted ? step.n : 0,
        });
      }
    }
  });

  return runs;
}

/** The text a reader would count at a moment: struck text no longer counts. */
export function visibleText(runs: readonly Run[]): string {
  return runs
    .filter((run) => run.state !== "struck")
    .map((run) => run.text)
    .join(" ");
}

/** The editor's notes that have been left by a moment, in order. */
export function notesAt(doc: HeroDoc, plan: Plan, tick: number): { n: number; text: string }[] {
  const notes: { n: number; text: string }[] = [];
  for (const part of ["title", "lede"] as const) {
    doc[part].forEach((segment, index) => {
      if ("keep" in segment || !segment.note) return;
      const step = plan.steps[`${part}-${index}`];
      if (tick >= step.noteAt) notes.push({ n: step.n, text: segment.note });
    });
  }
  return notes.sort((a, b) => a.n - b.n);
}

/** Where the edit is: the draft as it came in, the editor at work, or done. */
export function phaseAt(plan: Plan, tick: number): 0 | 1 | 2 {
  if (tick >= plan.acceptAt) return 2;
  return tick >= TIMING.opening ? 1 : 0;
}

export type Size = { upTo: string; topic: string; why: string };
export type Rung = { topic: string; why: string; verdict: "right" | "wide" | "too" };

/** The slider's range: one idea up to the last step's limit. */
export function maxIdeas(sizes: readonly Size[]): number {
  const limits = sizes.map((size) => Number.parseInt(size.upTo, 10)).filter((limit) => limit > 0);
  return limits.length ? Math.max(...limits) : 1;
}

/**
 * The step a number of ideas falls in. The first step is the right size,
 * the last is too wide, and anything between is getting wide.
 */
export function rungFor(sizes: readonly Size[], ideas: number): Rung | null {
  const ordered = sizes
    .map((size) => ({ ...size, limit: Number.parseInt(size.upTo, 10) }))
    .filter((size) => size.limit > 0)
    .sort((a, b) => a.limit - b.limit);
  if (ordered.length === 0) return null;
  const found = ordered.findIndex((size) => ideas <= size.limit);
  const at = found === -1 ? ordered.length - 1 : found;
  const verdict = at === 0 ? "right" : at === ordered.length - 1 ? "too" : "wide";
  return { topic: ordered[at].topic, why: ordered[at].why, verdict };
}

/** "≈ 4 min", at roughly four minutes an idea. */
export function readTimeFor(ideas: number): string {
  return `≈ ${ideas * 4} min`;
}
