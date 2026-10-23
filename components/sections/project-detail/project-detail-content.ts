import type { CaseStudySection, Project } from "@/components/sections/work/work-data";

/*
  The project page's pure helpers.

  Everything a visitor reads comes from the project itself; these only shape
  it: where it sits among the others, which facts it has, the figure a result
  leads with, and how long the write-up takes to read. Pure functions, so they
  are tested without a browser (see e2e/project-detail-content.spec.ts).
*/

/** Words per minute for the reading-time estimate. */
export const READING_WPM = 220;

export type Siblings<T> = {
  /** 1-based position in the list, for "Project 05 / 31". */
  position: number;
  total: number;
  previous: T;
  next: T;
};

/**
 * Where a project sits among the published ones, with its neighbours.
 *
 * The ends wrap round, so the last project's "Up next" is the first rather
 * than nothing: the page always offers somewhere to go. Undefined when the
 * project is not in the list or is the only one.
 */
export function siblingsOf<T extends { slug: string }>(
  projects: readonly T[],
  slug: string
): Siblings<T> | undefined {
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1 || projects.length < 2) return undefined;
  const total = projects.length;
  return {
    position: index + 1,
    total,
    previous: projects[(index - 1 + total) % total],
    next: projects[(index + 1) % total],
  };
}

const squash = (value: string) => value.toLowerCase().replace(/[\s-]/g, "");

/**
 * The filter groups the category does not already say.
 *
 * A project's category is "AI · Learning platform" and its groups are
 * ["AI", "Full-stack"]; printing both gave "AI · Learning platform · AI ·
 * Full-stack". Matched case- and space-insensitively, because the two are
 * free text edited in different places.
 */
export function extraGroups(project: Pick<Project, "category" | "groups">): string[] {
  const said = project.category.split("·").map((part) => squash(part.trim()));
  return project.groups.filter((group) => !said.includes(squash(group)));
}

/**
 * The hostname, for the address bar and the fact sheet. Empty for anything
 * unparseable: a malformed URL in the admin must not throw a public page.
 */
export function hostOf(url?: string): string {
  if (!url) return "";
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * A link written out for reading: "github.com/owner/repo" for a repository.
 * The URL itself when it will not parse.
 */
export function linkLabel(url: string): string {
  try {
    const parsed = new URL(url);
    return (parsed.host.replace(/^www\./, "") + parsed.pathname).replace(/\/$/, "");
  } catch {
    return url;
  }
}

export type Fact = { label: string; value: string };

/**
 * The hero's manifest: only the facts this project actually has. An empty
 * "Built for" on a personal project reads as missing data rather than as a
 * project that had no client, so absent facts are left out, not blanked.
 */
export function manifestOf(project: Project): Fact[] {
  const facts: Fact[] = [{ label: "Status", value: project.status }];
  if (project.client) facts.push({ label: "Built for", value: project.client });
  if (project.role) facts.push({ label: "Role", value: project.role });
  if (project.timeline) facts.push({ label: "Timeline", value: project.timeline });
  if (project.tags.length > 0) {
    const more = project.tags.length - 3;
    facts.push({ label: "Stack", value: project.tags.slice(0, 3).join(" · ") + (more > 0 ? ` +${more}` : "") });
  }
  return facts;
}

export type ResultFigure = { figure: string; suffix: string };

/**
 * The number a result leads with: "at 90% lower routing cost" → 90 and %.
 *
 * Results are sentences written in the admin, not structured metrics, so the
 * figure is found rather than stored. A result with no number in it has no
 * figure, and is shown as its sentence alone; nothing is invented for it.
 */
export function resultFigure(result: string): ResultFigure | undefined {
  /* A standalone number: not part of a name like "GPT-4o" or "S3", which is
     why it may not touch a letter, a hyphen or a dot on the left, and may
     only be followed by a letter when that letter is its unit. */
  const match = result.match(/(?<![\w.-])(\d[\d,]*(?:\.\d+)?)(%|[x×](?![a-z]))?(?![a-z\d])/i);
  if (!match) return undefined;
  return { figure: match[1], suffix: match[2] ?? "" };
}

/** How long the write-up takes to read, in whole minutes, at least one. */
export function readingMinutes(sections: readonly Pick<CaseStudySection, "paragraphs">[]): number {
  const words = sections.reduce(
    (count, section) =>
      count + section.paragraphs.reduce((sum, paragraph) => sum + paragraph.split(/\s+/).filter(Boolean).length, 0),
    0
  );
  return Math.max(1, Math.round(words / READING_WPM));
}

/**
 * A chapter's anchor, from its heading.
 *
 * Derived rather than stored, because headings are edited freely and a stored
 * id would drift from its text. Prefixed with the position so two chapters
 * with one heading still get two anchors.
 */
export function chapterId(heading: string, index: number): string {
  const slug = heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `chapter-${index + 1}${slug ? `-${slug}` : ""}`;
}

/** "5" → "05", for the mono counters. */
export function pad(value: number | string): string {
  return String(value).padStart(2, "0");
}
