import { test, expect } from "@playwright/test";

import { editDistance, nearestPage, normalisePath, shelfFrom, shelfWithGap } from "@/components/sections/small-pages/shelf-content";

/*
  Unit tests for the not-found page's shelf. Like home-content.spec.ts these
  never open a page.
*/
const pages = shelfFrom(
  [
    { label: "Projects", href: "/projects" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
  ],
  [
    { label: "Projects", href: "/projects" },
    { label: "Reviews", href: "/reviews/" },
    { label: "GitHub", href: "https://github.com/x" },
    { label: "Home", href: "/" },
  ]
);

test.describe("shelfFrom", () => {
  test("the site's own pages, once each, in menu order", () => {
    expect(pages.map((page) => page.href)).toEqual(["/projects", "/blog", "/about", "/reviews"]);
  });
});

test.describe("nearestPage", () => {
  test("a typo finds the page it was meant to be", () => {
    expect(nearestPage("/projets", pages)?.href).toBe("/projects");
    expect(nearestPage("/Blogg/", pages)?.href).toBe("/blog");
  });

  test("an address under a page finds the page", () => {
    expect(nearestPage("/blog/an-old-slug", pages)?.href).toBe("/blog");
  });

  test("nothing close, nothing offered", () => {
    expect(nearestPage("/qwertyuiop", pages)).toBeNull();
    expect(nearestPage("/", pages)).toBeNull();
  });
});

test.describe("shelfWithGap", () => {
  test("the gap sits beside the likely page, which leans", () => {
    const spots = shelfWithGap(pages, pages[1]);
    expect(spots.map((spot) => (spot.kind === "gap" ? "gap" : spot.page.href))).toEqual(["/projects", "/blog", "gap", "/about", "/reviews"]);
    expect(spots.find((spot) => spot.kind === "book" && spot.leaning)).toMatchObject({ page: { href: "/blog" } });
  });

  test("with no likely page, the gap is at the end", () => {
    expect(shelfWithGap(pages, null).at(-1)).toEqual({ kind: "gap" });
  });
});

test.describe("small rules", () => {
  test("edit distance", () => {
    expect(editDistance("kitten", "sitting")).toBe(3);
    expect(editDistance("", "abc")).toBe(3);
  });

  test("an address as somebody typed it", () => {
    expect(normalisePath("/Blog/?x=1#top")).toBe("/blog");
    expect(normalisePath("")).toBe("/");
  });
});
