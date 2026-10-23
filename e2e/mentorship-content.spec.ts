import { test, expect } from "@playwright/test";

import {
  orbitPositions,
  pathThrough,
  REVIEW_BEATS,
  startStageIndex,
  stationsFor,
  titlePieces,
} from "@/components/sections/mentorship-page/mentorship-content";
import { audiences, stages } from "@/components/sections/mentorship-program/mentorship-program-data";

/*
  Unit tests for the mentorship page's pure helpers. Like home-content.spec.ts
  these never open a page.
*/
test.describe("startStageIndex", () => {
  test("finds the named stage, ignoring case and spacing", () => {
    expect(startStageIndex("system  design", stages)).toBe(2);
    expect(startStageIndex(" Code Reviews ", stages)).toBe(1);
  });

  test("falls back to the first stage for a blank or stale name", () => {
    expect(startStageIndex(undefined, stages)).toBe(0);
    expect(startStageIndex("", stages)).toBe(0);
    expect(startStageIndex("A stage that was renamed", stages)).toBe(0);
  });

  test("every built-in audience points at a real stage", () => {
    for (const audience of audiences) {
      expect(stages[startStageIndex(audience.startsAt, stages)].label).toBe(audience.startsAt);
    }
  });
});

test.describe("titlePieces", () => {
  test("lights the last word and sets the full stop apart", () => {
    expect(titlePieces("A clear path to your next level.")).toEqual([
      { text: "A clear path to your next ", emphasis: false },
      { text: "level", emphasis: true },
      { text: ".", emphasis: false, stop: true },
    ]);
  });

  test("follows *asterisks* when the editor marks the emphasis", () => {
    expect(titlePieces("Your next level starts with a *short note.*")).toEqual([
      { text: "Your next level starts with a ", emphasis: false },
      { text: "short note", emphasis: true },
      { text: ".", emphasis: false, stop: true },
    ]);
  });

  test("leaves a title without a full stop, or of one word, whole", () => {
    expect(titlePieces("Grow")).toEqual([{ text: "Grow", emphasis: true }]);
    expect(titlePieces("Grow with us")).toEqual([
      { text: "Grow with ", emphasis: false },
      { text: "us", emphasis: true },
    ]);
  });

  test("the pieces always read back as the title", () => {
    for (const title of ["A clear path to your next level.", "Your next level starts with a *short note.*", "One."]) {
      expect(titlePieces(title).map((piece) => piece.text).join("")).toBe(title.replace(/\*/g, ""));
    }
  });
});

test.describe("the path's geometry", () => {
  test("stations spread end to end, alternating low and high", () => {
    const stations = stationsFor(4);
    expect(stations.map((station) => station.x)).toEqual([5, 35, 65, 95]);
    expect(stations.map((station) => station.high)).toEqual([false, true, false, true]);
    expect(stations.map((station) => station.along)).toEqual([0, 33, 67, 100]);
  });

  test("copes with one stage, or none", () => {
    expect(stationsFor(0)).toEqual([]);
    expect(stationsFor(1)).toHaveLength(1);
    expect(pathThrough([])).toBe("");
  });

  test("the curve starts at the first station and ends at the last", () => {
    const d = pathThrough(stationsFor(4));
    expect(d.startsWith("M60 230")).toBe(true);
    expect(d.endsWith("1140 80")).toBe(true);
  });
});

test.describe("orbitPositions", () => {
  test("starts at the top and stays inside the circle", () => {
    const points = orbitPositions(5);
    expect(points[0]).toEqual({ x: 50, y: 10 });
    for (const point of points) {
      expect(Math.hypot(point.x - 50, point.y - 50)).toBeLessThanOrEqual(40.1);
    }
  });
});

test.describe("the review", () => {
  test("ends approved, and only an open or resolved comment carries a note", () => {
    expect(REVIEW_BEATS.at(-1)?.tone).toBe("success");
    const notes = REVIEW_BEATS.flatMap((beat) => beat.lines.flatMap((line) => (line.note ? [line.note.state] : [])));
    expect(notes).toEqual(["open", "resolved"]);
  });
});
