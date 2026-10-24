import { test, expect } from "@playwright/test";

import {
  buildBoardRows,
  fitToBoard,
  headlinePhrases,
  splitEmphasis,
  splitPhrase,
} from "@/components/sections/home/hero-content";
import { BOARD_WIDTH, boardRows } from "@/components/sections/home/home-data";

/*
  Unit tests for the homepage's pure content helpers.

  These never open a page: they import the module and call it in Node, like
  auth-unit.spec.ts. They pin the rules that turn editable content into what
  the hero and the contact section draw, so an editor typing something long or
  odd gets a sensible result rather than a broken board.
*/
test.describe("fitToBoard", () => {
  test("upper-cases and keeps letters, digits and single spaces", () => {
    expect(fitToBoard("Code  reviews!")).toBe("CODE REVIEWS");
    expect(fitToBoard("  API · Scan  ")).toBe("API SCAN");
  });

  test("cuts at the last whole word that fits", () => {
    expect(fitToBoard("System Design Review")).toBe("SYSTEM DESIGN");
    expect(fitToBoard("System Design Review").length).toBeLessThanOrEqual(BOARD_WIDTH);
  });

  test("hard-cuts a single word longer than the row", () => {
    expect(fitToBoard("Supercalifragilistic")).toBe("SUPERCALIFRAG");
  });
});

test.describe("headline phrases", () => {
  test("splits a line so its last word carries the accent", () => {
    expect(splitPhrase("Software, shipped.")).toEqual({ lead: "Software,", accent: "shipped." });
  });

  test("treats a one-word line as all accent", () => {
    expect(splitPhrase("Shipped.")).toEqual({ lead: "", accent: "Shipped." });
  });

  test("makes one phrase per non-empty line of the title", () => {
    expect(headlinePhrases("Software, shipped.\n\nEngineers, grown.\n")).toEqual([
      { lead: "Software,", accent: "shipped." },
      { lead: "Engineers,", accent: "grown." },
    ]);
  });
});

test.describe("splitEmphasis", () => {
  test("marks the words between asterisks", () => {
    expect(splitEmphasis("Got work *worth doing properly*?")).toEqual([
      { text: "Got work ", emphasis: false },
      { text: "worth doing properly", emphasis: true },
      { text: "?", emphasis: false },
    ]);
  });

  test("leaves an unclosed asterisk as written", () => {
    expect(splitEmphasis("A *lonely asterisk")).toEqual([
      { text: "A *lonely asterisk", emphasis: false },
    ]);
  });
});

test.describe("buildBoardRows", () => {
  test("draws one row per track, in order, from the site's content", () => {
    const rows = buildBoardRows({
      projects: [{ name: "MetaPilot", href: "https://example.com/metapilot" }],
      checkpoints: ["Foundations", "Code Reviews"],
      concepts: ["Caching"],
    });

    expect(rows.map((row) => row.label)).toEqual(boardRows.map((row) => row.label));
    expect(rows[0]).toMatchObject({ words: ["METAPILOT"], hrefs: ["https://example.com/metapilot"] });
    expect(rows[1].words).toEqual(["FOUNDATIONS", "CODE REVIEWS"]);
    expect(rows[2]).toMatchObject({ words: ["CACHING"], hrefs: ["/blog"] });
  });

  test("falls back to the track's own name when a source is empty", () => {
    const rows = buildBoardRows({ projects: [], checkpoints: [], concepts: [] });

    expect(rows.every((row) => row.words.length === 1)).toBe(true);
    expect(rows[0].words).toEqual(["BUILD"]);
  });

  test("drops entries that clean down to nothing", () => {
    const rows = buildBoardRows({ projects: [{ name: "···", href: "/x" }], checkpoints: [], concepts: [] });
    expect(rows[0].words).toEqual(["BUILD"]);
  });
});
