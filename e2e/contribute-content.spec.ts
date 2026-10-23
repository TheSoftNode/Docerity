import { test, expect } from "@playwright/test";

import {
  TIMING,
  draftText,
  finalText,
  heroDoc,
  maxIdeas,
  notesAt,
  phaseAt,
  planEdits,
  readTimeFor,
  rungFor,
  runsAt,
  visibleText,
  wordCount,
  type Piece,
  type Size,
} from "@/components/sections/contribute-page/contribute-content";
import { DEFAULTS } from "@/lib/content/blocks/defaults";

/*
  Unit tests for the Write for us page's self-editing hero and sizing
  slider. Like home-content.spec.ts these never open a page.
*/
const block = DEFAULTS.contribute as Record<string, unknown>;
const headings = block.headings as Record<string, { title: string }>;
const defaults = heroDoc(
  headings["contribute-hero"].title,
  block.draft as { crossedOut: string; note: string },
  block.edits as Piece[]
);

test.describe("heroDoc", () => {
  test("the heading's lit words replace the crossed-out phrase", () => {
    expect(defaults.title).toEqual([
      { keep: "Getting your name on" },
      { before: "a blog post", after: "an explainer", note: "An explainer, not a post: one idea, one analogy." },
    ]);
    expect(defaults.stop).toBe(true);
  });

  test("a piece the same before and after is text left alone", () => {
    expect(defaults.lede).toContainEqual({ keep: "Explaining something clearly is hard," });
  });

  test("no crossed-out phrase means no edit to the heading", () => {
    const doc = heroDoc("Write *for us.*", { crossedOut: "", note: "" }, []);
    expect(doc.title.every((segment) => "keep" in segment)).toBe(true);
  });

  test("reads as the final pitch, and as the draft it replaced", () => {
    expect(finalText(defaults.lede)).toBe(
      "There is no submit button here, and that is deliberate. Explaining something clearly is hard, and these pieces are worth reading because somebody edited them properly."
    );
    expect(draftText(defaults.title)).toBe("Getting your name on a blog post");
  });
});

test.describe("planEdits", () => {
  const plan = planEdits(defaults);

  test("numbers every change, the heading first", () => {
    expect(plan.count).toBe(4);
    expect(plan.steps["title-1"].n).toBe(1);
  });

  test("each change is selected, struck, typed and noted in that order", () => {
    for (const step of Object.values(plan.steps)) {
      if (Number.isFinite(step.selectAt)) expect(step.selectAt).toBeLessThan(step.strikeAt);
      if (Number.isFinite(step.typeStart)) {
        expect(step.typeStart).toBeLessThan(step.typeEnd);
        expect(step.noteAt).toBe(step.typeEnd);
      }
    }
    expect(plan.acceptAt).toBeGreaterThan(Math.max(...Object.values(plan.steps).map((step) => step.noteAt)));
  });

  test("the phases run draft, suggesting, final", () => {
    expect(phaseAt(plan, 0)).toBe(0);
    expect(phaseAt(plan, TIMING.opening)).toBe(1);
    expect(phaseAt(plan, plan.acceptAt)).toBe(2);
  });
});

test.describe("runsAt", () => {
  const plan = planEdits(defaults);
  const step = plan.steps["title-1"];

  test("opens on the draft, untouched", () => {
    expect(runsAt(defaults, plan, "title", 0)).toEqual([
      { text: "Getting your name on", state: "plain", caret: false, mark: 0 },
      { text: "a blog post", state: "plain", caret: false, mark: 0 },
    ]);
  });

  test("selects, strikes, then types the new words behind a caret", () => {
    expect(runsAt(defaults, plan, "title", step.selectAt)[1].state).toBe("selected");
    const typing = runsAt(defaults, plan, "title", step.typeStart + 3);
    expect(typing[1].state).toBe("struck");
    expect(typing[2]).toEqual({ text: "an ", state: "inserted", caret: true, mark: 0 });
  });

  test("notes the change once it is typed, and ends clean", () => {
    expect(runsAt(defaults, plan, "title", step.noteAt)[2].mark).toBe(1);
    expect(runsAt(defaults, plan, "title", plan.acceptAt)).toEqual([
      { text: "Getting your name on", state: "plain", caret: false, mark: 0 },
      { text: "an explainer", state: "plain", caret: false, mark: 0 },
    ]);
  });

  test("struck text stops counting, so the edit visibly cuts the draft", () => {
    const words = (tick: number) =>
      wordCount(`${visibleText(runsAt(defaults, plan, "title", tick))} ${visibleText(runsAt(defaults, plan, "lede", tick))}`);
    expect(words(plan.acceptAt)).toBeLessThan(words(0));
  });

  test("the margin fills in order and keeps every note", () => {
    expect(notesAt(defaults, plan, 0)).toEqual([]);
    expect(notesAt(defaults, plan, plan.acceptAt).map((note) => note.n)).toEqual([1, 2, 3, 4]);
  });
});

test.describe("sizing", () => {
  const sizes = block.sizes as Size[];

  test("runs to the last step's limit", () => {
    expect(maxIdeas(sizes)).toBe(12);
    expect(maxIdeas([])).toBe(1);
  });

  test("the first step is the right size, the last too wide, between is getting wide", () => {
    expect(rungFor(sizes, 1)?.verdict).toBe("right");
    expect(rungFor(sizes, 3)?.verdict).toBe("wide");
    expect(rungFor(sizes, 12)).toMatchObject({ topic: "Databases", verdict: "too" });
    expect(rungFor([], 1)).toBeNull();
  });

  test("reading time", () => {
    expect(readTimeFor(1)).toBe("≈ 4 min");
  });
});
