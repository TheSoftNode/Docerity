import { test, expect } from "@playwright/test";

import { projects } from "@/components/sections/work/work-data";
import {
  chapterId,
  extraGroups,
  hostOf,
  linkLabel,
  manifestOf,
  readingMinutes,
  resultFigure,
  siblingsOf,
} from "@/components/sections/project-detail/project-detail-content";

/*
  Unit tests for the project page's pure helpers. Like home-content.spec.ts
  these never open a page.
*/
test.describe("siblingsOf", () => {
  const list = [{ slug: "a" }, { slug: "b" }, { slug: "c" }];

  test("gives the position and both neighbours", () => {
    expect(siblingsOf(list, "b")).toEqual({ position: 2, total: 3, previous: list[0], next: list[2] });
  });

  test("wraps round at both ends", () => {
    expect(siblingsOf(list, "a")?.previous).toBe(list[2]);
    expect(siblingsOf(list, "c")?.next).toBe(list[0]);
  });

  test("has nothing for an unknown slug or a list of one", () => {
    expect(siblingsOf(list, "z")).toBeUndefined();
    expect(siblingsOf([{ slug: "a" }], "a")).toBeUndefined();
  });
});

test.describe("extraGroups", () => {
  test("drops the groups the category already says, however they are spelt", () => {
    expect(extraGroups({ category: "AI · Learning platform", groups: ["AI", "Full-stack"] })).toEqual(["Full-stack"]);
    expect(extraGroups({ category: "Full stack · Tools", groups: ["Full-stack"] })).toEqual([]);
  });
});

test.describe("links", () => {
  test("hostOf keeps the host and survives garbage", () => {
    expect(hostOf("https://www.example.com/path")).toBe("example.com");
    expect(hostOf("not a url")).toBe("");
    expect(hostOf(undefined)).toBe("");
  });

  test("linkLabel writes a repository out for reading", () => {
    expect(linkLabel("https://github.com/owner/repo/")).toBe("github.com/owner/repo");
    expect(linkLabel("nonsense")).toBe("nonsense");
  });
});

test.describe("manifestOf", () => {
  test("lists only the facts a project has", () => {
    const bare = projects.find((project) => !project.client && !project.role && !project.timeline)!;
    expect(manifestOf(bare).map((fact) => fact.label)).toEqual(["Status", "Stack"]);

    const written = projects.find((project) => project.slug === "uri-social")!;
    expect(manifestOf(written).map((fact) => fact.label)).toEqual(["Status", "Built for", "Role", "Timeline", "Stack"]);
  });

  test("shortens a long stack to three and a count", () => {
    const [, , , , stack] = manifestOf(projects.find((project) => project.slug === "uri-social")!);
    expect(stack.value).toBe("FastAPI · Next.js · MongoDB +3");
  });
});

test.describe("resultFigure", () => {
  test("finds the figure a result leads with", () => {
    expect(resultFigure("processing millions of posts at 90% lower routing cost")).toEqual({ figure: "90", suffix: "%" });
    expect(resultFigure("Above 99.99% uptime")).toEqual({ figure: "99.99", suffix: "%" });
    expect(resultFigure("on 1,536-dimension embeddings")).toEqual({ figure: "1,536", suffix: "" });
    expect(resultFigure("3x faster deploys")).toEqual({ figure: "3", suffix: "x" });
  });

  test("skips numbers that are part of a name", () => {
    expect(resultFigure("A router over GPT-4o and Gemini at 90% lower cost")).toEqual({ figure: "90", suffix: "%" });
    expect(resultFigure("Stored in S3 for 30 days")).toEqual({ figure: "30", suffix: "" });
  });

  test("invents nothing for a result without a number", () => {
    expect(resultFigure("Migrated from Azure to AWS without taking the number offline.")).toBeUndefined();
  });
});

test.describe("the write-up", () => {
  test("reading time is whole minutes, at least one", () => {
    expect(readingMinutes([{ paragraphs: ["one two three"] }])).toBe(1);
    expect(readingMinutes([{ paragraphs: [Array(660).fill("word").join(" ")] }])).toBe(3);
  });

  test("chapter anchors are unique even for repeated headings", () => {
    expect(chapterId("Routing by difficulty, not by default", 0)).toBe("chapter-1-routing-by-difficulty-not-by-default");
    expect(chapterId("Notes", 1)).not.toBe(chapterId("Notes", 2));
    expect(chapterId("!!!", 0)).toBe("chapter-1");
  });
});
