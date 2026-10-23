import { test, expect } from "@playwright/test";

import {
  GRAPH,
  commitId,
  filterCounts,
  initLabel,
  isCurrent,
  lanesFor,
  matchesFilter,
  notesLabel,
  slugOf,
  timeScale,
  yearsIn,
} from "@/components/sections/about-page/about-content";
import { DEFAULTS } from "@/lib/content/blocks/defaults";
import type { AboutContent, ExperienceView } from "@/lib/content/blocks/views";

/*
  Unit tests for the About page's career graph and small rules. Like
  home-content.spec.ts these never open a page.
*/
const about = DEFAULTS.about as unknown as AboutContent;
const role = (period: string, org = "Org"): ExperienceView => ({ role: "Engineer", org, period, summary: "", points: [] });

test.describe("periods", () => {
  test("years are read out in order", () => {
    expect(yearsIn("2023 – 2024")).toEqual([2023, 2024]);
    expect(yearsIn("2024 – present")).toEqual([2024]);
    expect(yearsIn("Ongoing")).toEqual([]);
  });

  test("a role still going says so", () => {
    expect(isCurrent("2025 – present")).toBe(true);
    expect(isCurrent("2023 – 2024")).toBe(false);
  });
});

test.describe("timeScale", () => {
  test("runs from the left edge to the right, in order", () => {
    const x = timeScale([2020, 2024, 2024], 2026);
    expect(x(2020)).toBe(GRAPH.left);
    expect(x(2027)).toBeCloseTo(GRAPH.right);
    expect(x(2021)).toBeLessThan(x(2023));
    expect(x(2024.5)).toBeLessThan(x(2025));
  });

  test("gives a busy year more room than a quiet one", () => {
    const x = timeScale([2020, 2024, 2024, 2024], 2026);
    expect(x(2025) - x(2024)).toBeGreaterThan(x(2022) - x(2021));
  });
});

test.describe("lanesFor", () => {
  test("draws every role, oldest first", () => {
    const lanes = lanesFor(about.experience, 2026);
    expect(lanes).toHaveLength(about.experience.length);
    expect(lanes[0].org).toBe("Freelance & collaborative projects");
    expect(lanes.map((lane) => lane.x0)).toEqual([...lanes.map((lane) => lane.x0)].sort((a, b) => a - b));
  });

  test("an ongoing role runs into HEAD; a finished one merges back into main", () => {
    const [done, going] = lanesFor([role("2020 – 2022", "Done"), role("2023 – present", "Going")], 2026);
    expect(going.current).toBe(true);
    expect(going.d.endsWith(`${GRAPH.head} ${GRAPH.main}`)).toBe(true);
    expect(done.current).toBe(false);
    expect(done.d.endsWith(`${done.x1 + 36} ${GRAPH.main}`)).toBe(true);
  });

  test("two roles at once never share a lane", () => {
    const lanes = lanesFor(about.experience, 2026);
    const overlaps = (a: (typeof lanes)[number], b: (typeof lanes)[number]) => a.x0 < b.x1 && b.x0 < a.x1;
    for (const a of lanes) for (const b of lanes) if (a !== b && overlaps(a, b)) expect(a.y).not.toBe(b.y);
  });

  test("roles from the same year branch from different points", () => {
    const lanes = lanesFor([role("2026 – present", "A"), role("2026 – present", "B")], 2026);
    expect(lanes[0].x0).not.toBe(lanes[1].x0);
  });

  test("keeps each role's place in the list, so a branch and its release match", () => {
    const lanes = lanesFor(about.experience, 2026);
    for (const lane of lanes) expect(about.experience[lane.index].org).toBe(lane.org);
  });
});

test.describe("labels", () => {
  test("commit ids are names, not hashes", () => {
    expect(commitId("URI Creative")).toBe("dcr:uri-creative");
    expect(slugOf("Data & messaging")).toBe("data-messaging");
  });

  test("main starts at the earliest qualification", () => {
    expect(initLabel(about.education)).toBe("init · B.Eng, 2018");
    expect(initLabel([{ qualification: "BSc Physics", period: "2010 – 2014" }])).toBe("init · BSc Physics, 2014");
    expect(initLabel([])).toBe("init");
  });

  test("notes", () => {
    expect(notesLabel(1)).toBe("1 note");
    expect(notesLabel(5)).toBe("5 notes");
  });
});

test.describe("filters", () => {
  test("current and earlier split the roles between them", () => {
    const counts = filterCounts(about.experience);
    expect(counts.current + counts.earlier).toBe(counts.all);
    expect(matchesFilter("2024 – present", "current")).toBe(true);
    expect(matchesFilter("2024 – present", "earlier")).toBe(false);
    expect(matchesFilter("2020 – 2023", "all")).toBe(true);
  });
});
