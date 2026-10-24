import { test, expect } from "@playwright/test";

import {
  BAR_BUDGET,
  MIN_BARS,
  averageRating,
  captionWords,
  clipsFor,
  distribution,
  filterByKind,
  initialsOf,
  kindCounts,
  kindOption,
  kindTag,
  monthOf,
  type ShownReview,
} from "@/components/sections/reviews-page/reviews-content";

/*
  Unit tests for the reviews page's caption reel and record. Like
  home-content.spec.ts these never open a page.
*/
const review = (id: string, kind: ShownReview["kind"], rating: number, body: string): ShownReview => ({
  id,
  fullName: "Ada Lovelace",
  title: "Engineer",
  body,
  rating,
  kind,
  photoUrl: "",
  links: [],
  publishedAt: "2026-10-01T00:00:00.000Z",
});

const reviews = [
  review("a", "client", 5, "They rebuilt the payments flow and explained every decision as they went along."),
  review("b", "mentee", 4, "Weekly reviews that changed how I write code."),
  review("c", "reader", 5, "Short."),
];

test.describe("clipsFor", () => {
  test("a clip per review, longer for a longer review", () => {
    const clips = clipsFor(reviews);
    expect(clips.map((clip) => clip.id)).toEqual(["a", "b", "c"]);
    expect(clips[0].heights.length).toBeGreaterThan(clips[1].heights.length);
  });

  test("even a one-word review is something to click", () => {
    expect(clipsFor(reviews)[2].heights.length).toBe(MIN_BARS);
  });

  test("the strip stays within its budget however much people wrote", () => {
    const long = Array.from({ length: 20 }, (_, index) => review(String(index), "client", 5, "word ".repeat(200)));
    const total = clipsFor(long).reduce((sum, clip) => sum + clip.heights.length, 0);
    expect(total).toBeLessThanOrEqual(BAR_BUDGET);
  });

  test("a longer word draws a taller bar", () => {
    const [clip] = clipsFor([review("x", "client", 5, "a a a a a a extraordinary extraordinary extraordinary extraordinary extraordinary extraordinary")]);
    expect(Math.max(...clip.heights.slice(6))).toBeGreaterThan(Math.max(...clip.heights.slice(0, 6)));
  });

  test("nothing to draw with nothing approved", () => {
    expect(clipsFor([])).toEqual([]);
  });
});

test.describe("the record", () => {
  test("filters by how the person knows us, and counts each", () => {
    expect(filterByKind(reviews, "mentee").map((entry) => entry.id)).toEqual(["b"]);
    expect(filterByKind(reviews, "all")).toHaveLength(3);
    expect(kindCounts(reviews)).toEqual({ all: 3, client: 1, mentee: 1, reader: 1 });
  });

  test("the average and the breakdown", () => {
    expect(averageRating(reviews)).toBe("4.7");
    expect(averageRating([])).toBeNull();
    const rows = distribution(reviews);
    expect(rows.map((row) => row.stars)).toEqual([5, 4, 3, 2, 1]);
    expect(rows[0]).toEqual({ stars: 5, count: 2, share: 2 / 3 });
    expect(distribution([])[0].share).toBe(0);
  });
});

test.describe("small rules", () => {
  test("initials", () => {
    expect(initialsOf("Ada Lovelace")).toBe("AL");
    expect(initialsOf("Plato")).toBe("PL");
    expect(initialsOf("  ")).toBe("?");
  });

  test("a caption a word at a time", () => {
    expect(captionWords("One two three")).toEqual([
      { word: "One", delay: 0 },
      { word: "two", delay: 0.045 },
      { word: "three", delay: 0.09 },
    ]);
  });

  test("kinds and dates", () => {
    expect(kindTag("mentee")).toBe("Mentee");
    expect(kindOption("client").label).toBe("You built something for me");
    expect(monthOf("2026-10-01T00:00:00.000Z")).toBe("Oct 2026");
    expect(monthOf("not a date")).toBe("");
  });
});
