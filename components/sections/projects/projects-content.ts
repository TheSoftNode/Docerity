import type { Project } from "@/components/sections/work/work-data";

/*
  The projects page's design copy and its pure helpers.

  As on the homepage, everything a visitor reads as content (the projects,
  the headings, the capabilities, the process steps, the stack) comes from
  the work section and the editable blocks. What lives here is scaffolding:
  the label of the catch-all filter, the shape of the project wall, and the
  log lines the process console types for each stage.

  Pure functions only, so they can be tested without a browser (see
  e2e/projects-content.spec.ts).
*/

/** The catch-all filter, exported so tests can name it without typing it. */
export const ALL_FILTER = "All projects";

/** How many columns the hero's project wall has. */
export const WALL_COLUMNS = 5;

/** How long the process console holds each stage. */
export const PROCESS_INTERVAL_MS = 5200;

/*
  What the console types while a stage runs, by the stage's position. These
  describe the way of working the step already promises; they are not claims
  about any particular project. A step beyond these (the steps are editable)
  gets lines derived from its own title and summary.
*/
const PROCESS_LOGS: readonly (readonly string[])[] = [
  [
    "interviewing the people who live with the problem",
    "mapping what is actually broken",
    "writing down what success looks like",
    "scope agreed and signed off",
  ],
  [
    "modelling the data",
    "drawing the integration boundaries",
    "marking the parts most likely to change",
    "architecture reviewed",
  ],
  [
    "slice 1: the core flow, in review",
    "slice 2: the integrations, in review",
    "slice 3: the edge cases, in review",
    "every slice merged and running",
  ],
  [
    "deploying to production",
    "monitoring and alerts on",
    "documentation handed over",
    "live, and supported after launch",
  ],
];

/** The lines the console types for the stage at `position`; the last is the ✓. */
export function processLog(position: number, step: { title: string; summary: string }): string[] {
  const known = PROCESS_LOGS[position];
  if (known) return [...known];
  return [`working through ${step.title.toLowerCase()}`, step.summary.toLowerCase(), `${step.title.toLowerCase()} complete`];
}

/** A step's identifier on the console's command line: "Ship & support" → "ship-support". */
export function stageSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type GroupCount = { label: string; count: number };

/**
 * The filter buckets with how many projects each holds, busiest first, so
 * the filters read as a summary of the work rather than an alphabetical list
 * where a one-project bucket leads. Ties keep the order they first appear in.
 */
export function groupCounts(projects: readonly Pick<Project, "groups">[]): GroupCount[] {
  const counts = new Map<string, number>();
  for (const project of projects) {
    for (const group of project.groups) counts.set(group, (counts.get(group) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

/** The projects that `filter` shows. */
export function filterProjects<T extends Pick<Project, "groups">>(projects: readonly T[], filter: string): T[] {
  return filter === ALL_FILTER ? [...projects] : projects.filter((project) => project.groups.includes(filter));
}

/** How many projects have each status. */
export function statusCounts(projects: readonly Pick<Project, "status">[]) {
  return {
    live: projects.filter((project) => project.status === "Live").length,
    inProgress: projects.filter((project) => project.status === "In progress").length,
    onHold: projects.filter((project) => project.status === "On hold").length,
  };
}

/**
 * The projects dealt into the wall's columns, round-robin so every column
 * mixes kinds of work, and each column doubled so its scroll can loop
 * without a seam.
 */
export function wallColumns<T>(projects: readonly T[], columns = WALL_COLUMNS): T[][] {
  return Array.from({ length: columns }, (_, column) => {
    const own = projects.filter((_, index) => index % columns === column);
    return [...own, ...own];
  });
}
