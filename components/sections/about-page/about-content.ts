/*
  The About page's career graph and small rules, as pure functions.

  The hero draws the Experience list as a git branch graph. Each role is a
  branch off main in the year it started. A finished role merges back the
  year it ended, and one still going runs on into HEAD, which is Docerity.
  Nothing in the graph is typed separately: add a role in the admin and it
  gets a branch. Pure, so it is tested without a browser (see
  e2e/about-content.spec.ts).
*/

import type { ExperienceView } from "@/lib/content/blocks/views";

/** The graph's drawing space, in SVG units. It scales to fit its box. */
export const GRAPH = {
  width: 1200,
  height: 470,
  main: 235,
  /** Where the first year starts, and where the last one ends. */
  left: 60,
  right: 1100,
  /** The HEAD commit, where every ongoing branch lands. */
  head: 1150,
  /** The lanes a branch can run along, nearest the edges first. */
  rows: [50, 125, 345, 420, 180, 290],
} as const;

/** The years a period mentions, in order: "2023 – 2024" → [2023, 2024]. */
export function yearsIn(period: string): number[] {
  return (period.match(/\d{4}/g) ?? []).map(Number);
}

/** Whether a role is still going. */
export function isCurrent(period: string): boolean {
  return /present|now|current/i.test(period);
}

/**
 * Where a moment in time sits across the graph.
 *
 * Not linear: each year's width is a baseline plus a share for every role
 * that started in it, so the years that had several roles at once get room
 * for their branches and the quiet ones do not take up half the graph.
 */
export function timeScale(startYears: number[], nowYear: number): (t: number) => number {
  const first = Math.min(...startYears, nowYear);
  const years = Array.from({ length: nowYear - first + 1 }, (_, index) => first + index);
  const weights = years.map((year) => 0.5 + startYears.filter((start) => start === year).length);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const unit = (GRAPH.right - GRAPH.left) / total;
  const edges = weights.reduce<number[]>((acc, weight) => [...acc, acc[acc.length - 1] + weight * unit], [GRAPH.left]);

  return (t) => {
    const index = Math.min(Math.max(Math.floor(t) - first, 0), years.length - 1);
    const within = Math.min(Math.max(t - (first + index), 0), 1);
    return edges[index] + within * (edges[index + 1] - edges[index]);
  };
}

export type Lane = {
  /** Its place in the Experience list, so a branch and its release match. */
  index: number;
  org: string;
  role: string;
  period: string;
  summary: string;
  current: boolean;
  /** The lane it runs along, and where it starts and stops along it. */
  y: number;
  x0: number;
  x1: number;
  /** The branch as one path: off main, along the lane, and back in. */
  d: string;
};

/**
 * The branches, oldest first.
 *
 * Roles that start the same year are staggered across it, so they do not
 * branch from one point. Each takes the first lane free by the time it
 * starts, so two branches never run along the same lane at once while there
 * is a free one.
 */
export function lanesFor(experience: readonly ExperienceView[], nowYear: number): Lane[] {
  const dated = experience
    .map((entry, index) => {
      const years = yearsIn(entry.period);
      return { entry, index, start: years[0] ?? nowYear, end: years[1] ?? years[0] ?? nowYear, current: isCurrent(entry.period) };
    })
    .sort((a, b) => a.start - b.start || a.index - b.index);

  const x = timeScale(
    dated.map((role) => role.start),
    nowYear
  );
  const sameYear: Record<number, number> = {};
  const freeFrom: number[] = GRAPH.rows.map(() => -Infinity);
  const { main, head } = GRAPH;

  return dated.map(({ entry, index, start, end, current }) => {
    const nth = (sameYear[start] = (sameYear[start] ?? 0) + 1) - 1;
    const begins = start + Math.min(nth * 0.3, 0.8);
    const ends = current ? Infinity : end + 0.85;

    let row = freeFrom.findIndex((free) => free + 0.25 <= begins);
    if (row === -1) row = freeFrom.indexOf(Math.min(...freeFrom));
    freeFrom[row] = ends;

    const y = GRAPH.rows[row];
    const x0 = Math.round(x(begins));
    const x1 = Math.round(current ? head - 56 : x(ends));
    const off = `M ${Math.max(24, x0 - 36)} ${main} C ${x0 - 14} ${main} ${x0 - 22} ${y} ${x0} ${y}`;
    const back = current
      ? `C ${x1 + 36} ${y} ${x1 + 26} ${main} ${head} ${main}`
      : `C ${x1 + 22} ${y} ${x1 + 14} ${main} ${x1 + 36} ${main}`;

    return {
      index,
      org: entry.org,
      role: entry.role,
      period: entry.period,
      summary: entry.summary,
      current,
      y,
      x0,
      x1,
      d: `${off} L ${x1} ${y} ${back}`,
    };
  });
}

/** A short, readable id for a role's "commit": "dcr:uri-creative". */
export function commitId(org: string): string {
  return `dcr:${slugOf(org)}`;
}

/** "Data & messaging" → "data-messaging". */
export function slugOf(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type ExperienceFilter = "all" | "current" | "earlier";

export const FILTERS: readonly { value: ExperienceFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "current", label: "Current" },
  { value: "earlier", label: "Earlier" },
];

/** Whether a role belongs under a filter. */
export function matchesFilter(period: string, filter: ExperienceFilter): boolean {
  if (filter === "all") return true;
  return filter === "current" ? isCurrent(period) : !isCurrent(period);
}

/** How many roles each filter would show. */
export function filterCounts(experience: readonly ExperienceView[]): Record<ExperienceFilter, number> {
  const current = experience.filter((entry) => isCurrent(entry.period)).length;
  return { all: experience.length, current, earlier: experience.length - current };
}

/** "1 note", "5 notes". */
export function notesLabel(count: number): string {
  return `${count} ${count === 1 ? "note" : "notes"}`;
}

/**
 * The label on main's first commit: the earliest qualification and the year
 * it finished, "init · B.Eng, 2018". A long qualification is cut to its first
 * word, which for a degree is the degree.
 */
export function initLabel(education: readonly { qualification: string; period: string }[]): string {
  const dated = education
    .map((entry) => ({ entry, years: yearsIn(entry.period) }))
    .filter(({ years }) => years.length > 0)
    .sort((a, b) => a.years[0] - b.years[0]);
  const first = dated[0];
  if (!first) return "init";
  const name = first.entry.qualification.split(",")[0].trim();
  const short = name.length > 28 ? name.split(/\s+/)[0] : name;
  return `init · ${short}, ${first.years[first.years.length - 1]}`;
}
