import { test, expect } from "@playwright/test";

import { projects } from "@/components/sections/work/work-data";
import {
  ALL_FILTER,
  WALL_COLUMNS,
  filterProjects,
  groupCounts,
  processLog,
  stageSlug,
  statusCounts,
  wallColumns,
} from "@/components/sections/projects/projects-content";

/*
  Unit tests for the projects page's pure helpers.

  Like home-content.spec.ts these never open a page. They pin the rules that
  turn the projects and the editable process steps into the wall, the filters
  and the deploy console, so new content gets a sensible result.
*/
test.describe("groupCounts", () => {
  test("counts every group, busiest first", () => {
    const counts = groupCounts([{ groups: ["A", "B"] }, { groups: ["B"] }, { groups: ["C", "B"] }]);
    expect(counts).toEqual([
      { label: "B", count: 3 },
      { label: "A", count: 1 },
      { label: "C", count: 1 },
    ]);
  });

  test("agrees with what the filter shows for the real projects", () => {
    for (const { label, count } of groupCounts(projects)) {
      expect(filterProjects(projects, label)).toHaveLength(count);
    }
  });
});

test.describe("filterProjects", () => {
  test("the catch-all shows everything, as a copy", () => {
    const all = filterProjects(projects, ALL_FILTER);
    expect(all).toEqual(projects);
    expect(all).not.toBe(projects);
  });

  test("an unknown group shows nothing", () => {
    expect(filterProjects(projects, "Not a group")).toEqual([]);
  });
});

test.describe("statusCounts", () => {
  test("adds up to the whole", () => {
    const { live, inProgress, onHold } = statusCounts(projects);
    expect(live + inProgress + onHold).toBe(projects.length);
  });
});

test.describe("wallColumns", () => {
  test("deals every project once, then doubles each column for the loop", () => {
    const columns = wallColumns([1, 2, 3, 4, 5, 6, 7]);
    expect(columns).toHaveLength(WALL_COLUMNS);
    expect(columns[0]).toEqual([1, 6, 1, 6]);
    expect(columns[4]).toEqual([5, 5]);
    const once = columns.flatMap((column) => column.slice(0, column.length / 2));
    expect(once.sort()).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});

test.describe("the process console", () => {
  test("stage slugs are command-line safe", () => {
    expect(stageSlug("Ship & support")).toBe("ship-support");
    expect(stageSlug("  Discover  ")).toBe("discover");
  });

  test("known stages have their own log, ending in the result", () => {
    const log = processLog(0, { title: "Discover", summary: "Find the problem" });
    expect(log.length).toBeGreaterThan(1);
    expect(new Set(log).size).toBe(log.length);
  });

  test("a stage added beyond the written ones gets a log from its own words", () => {
    const log = processLog(9, { title: "Iterate", summary: "Measure and Improve" });
    expect(log).toEqual(["working through iterate", "measure and improve", "iterate complete"]);
  });
});
