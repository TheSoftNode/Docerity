import { test, expect } from "@playwright/test";

import {
  formatDate,
  inElementOrder,
  readingOrder,
  shortReadTime,
  symbolFor,
  heroPairs,
  tagCounts,
  titleParts,
  toElements,
} from "@/components/sections/blog-page/blog-content";
import { toArticleView, toExplainerView } from "@/lib/content/entry-view";
import { articlePosts, explainerPosts } from "@/components/sections/blog/blog-data";

/*
  Unit tests for the blog's pure helpers: the periodic-table framing and the
  reading order. Like home-content.spec.ts these never open a page.
*/
const elements = toElements([...explainerPosts.map(toExplainerView), ...articlePosts.map(toArticleView)]);

test.describe("symbolFor", () => {
  test("takes two letters from a name", () => {
    expect(symbolFor("Caching")).toBe("Ca");
    expect(symbolFor("Load Balancing")).toBe("Lb");
    expect(symbolFor("API Requests")).toBe("Ar");
  });

  test("skips the words that carry no meaning in a title", () => {
    expect(symbolFor("Why I default to boring technology")).toBe("Db");
    expect(symbolFor("Notes on writing code reviews people actually read")).toBe("Wc");
    expect(symbolFor("Case study: rebuilding a client's checkout flow")).toBe("Rc");
  });
});

test.describe("element order", () => {
  test("is publishing order, oldest first, numbered from one", () => {
    const dates = elements.map((element) => element.publishedAt);
    expect(dates).toEqual([...dates].sort());
    expect(elements.map((element) => element.number)).toEqual(elements.map((_, index) => index + 1));
  });

  test("keeps arrival order for a tie", () => {
    const tied = inElementOrder([
      { slug: "b", publishedAt: "2026-01-01" },
      { slug: "a", publishedAt: "2026-01-01" },
    ]);
    expect(tied.map((entry) => entry.slug)).toEqual(["b", "a"]);
  });
});

test.describe("heroPairs", () => {
  test("the explainers, concept and analogy, in publishing order; articles have no analogy", () => {
    const pairs = heroPairs(elements);
    expect(pairs.length).toBeGreaterThan(0);
    expect(pairs.every((pair) => pair.concept && pair.analogy)).toBe(true);
    const explainers = elements.filter((element) => element.type === "explainer").map((element) => element.slug);
    expect(pairs.map((pair) => pair.slug)).toEqual(explainers.filter((slug) => pairs.some((pair) => pair.slug === slug)));
    expect(pairs.some((pair) => pair.analogy.endsWith("."))).toBe(false);
  });
});

test.describe("reading order", () => {
  test("next is the following piece of the same kind, wrapping round", () => {
    expect(readingOrder(elements, "caching").next?.slug).toBe("load-balancing");
    const explainers = elements.filter((element) => element.type === "explainer");
    expect(readingOrder(elements, explainers.at(-1)!.slug).next?.slug).toBe(explainers[0].slug);
  });

  test("related shares a topic first, and never repeats this piece or the next", () => {
    const { next, related } = readingOrder(elements, "caching");
    expect(related.length).toBeLessThanOrEqual(3);
    expect(related.map((element) => element.slug)).not.toContain("caching");
    expect(related.map((element) => element.slug)).not.toContain(next?.slug);
    expect(related[0].tags.some((tag) => ["Performance", "Databases"].includes(tag))).toBe(true);
  });

  test("an unknown slug has nothing to follow", () => {
    expect(readingOrder(elements, "nope")).toEqual({ next: undefined, related: [] });
  });
});

test.describe("small formatting rules", () => {
  test("read times and dates", () => {
    expect(shortReadTime("4 min read")).toBe("4 min");
    expect(formatDate("2026-05-04")).toBe("4 May 2026");
    expect(formatDate("not a date")).toBe("not a date");
  });

  test("a title ends on one full stop, unless it asks or exclaims", () => {
    expect(titleParts("A sticky note on your monitor")).toEqual({ text: "A sticky note on your monitor", stop: "." });
    expect(titleParts("Already ends.")).toEqual({ text: "Already ends", stop: "." });
    expect(titleParts("Is this a question?")).toEqual({ text: "Is this a question?", stop: "" });
  });

  test("tags are counted, most used first", () => {
    const counts = tagCounts(elements);
    expect(counts[0].count).toBeGreaterThanOrEqual(counts.at(-1)!.count);
  });
});
