/*
  A project's write-up, pasted into the editor in one go.

  The write-ups are drafted outside the admin (from the project's repo) as one
  JSON block, so that filling in a project is a paste and a read-through
  rather than twenty fields typed by hand. Only words are taken from it:
  the slug, the screenshots, publishing and ordering stay as the editor has
  them, so a paste can never move a page or unpublish it. A section image
  already in place stays with the section at the same position.
*/

import {
  PROJECT_LIMITS,
  PROJECT_SHOWCASES,
  PROJECT_STATUSES,
  type ProjectInput,
  type ProjectShowcase,
  type ProjectStatus,
} from "@/lib/content/project-schema";

const TEXT_FIELDS = [
  "name",
  "category",
  "description",
  "role",
  "timeline",
  "client",
  "recognition",
  "recognitionUrl",
  "demoUrl",
  "proofUrl",
  "proofLabel",
  "liveUrl",
  "repoUrl",
] as const;

const LIST_FIELDS = { groups: PROJECT_LIMITS.maxGroups, tags: PROJECT_LIMITS.maxTags, results: PROJECT_LIMITS.maxResults, contributions: PROJECT_LIMITS.maxContributions } as const;

/** What a paste changed, in the editor's own words, for the line shown after it. */
const LABELS: Record<string, string> = {
  name: "name",
  category: "caption",
  description: "what it does",
  role: "role",
  timeline: "timeline",
  client: "client",
  recognition: "recognition",
  recognitionUrl: "recognition link",
  demoUrl: "walkthrough video",
  proofUrl: "proof link",
  proofLabel: "proof label",
  liveUrl: "live link",
  repoUrl: "repo link",
  groups: "buckets",
  tags: "tags",
  results: "results",
  contributions: "my part",
  status: "status",
  showcase: "portfolio placement",
  confidential: "confidential",
  body: "write-up sections",
};

export type WriteUpResult = { ok: true; project: ProjectInput; changed: string[] } | { ok: false; error: string };

function strings(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
}

/** Tolerates the block arriving inside a ```json fence, as it does when copied from a chat. */
function parse(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  return JSON.parse(trimmed);
}

export function applyWriteUp(project: ProjectInput, text: string): WriteUpResult {
  let data: unknown;
  try {
    data = parse(text);
  } catch {
    return { ok: false, error: "That isn't a complete write-up block. Copy all of it, from the first { to the last }." };
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return { ok: false, error: "That isn't a write-up block." };
  }
  const input = data as Record<string, unknown>;
  const next: ProjectInput = { ...project };
  const changed: string[] = [];

  for (const key of TEXT_FIELDS) {
    const value = input[key];
    if (typeof value === "string" && value.trim() && value.trim() !== project[key]) {
      next[key] = value.trim();
      changed.push(key);
    }
  }

  for (const [key, max] of Object.entries(LIST_FIELDS) as [keyof typeof LIST_FIELDS, number][]) {
    const value = strings(input[key]);
    if (value && value.length > 0) {
      next[key] = value.slice(0, max);
      changed.push(key);
    }
  }

  if (typeof input.status === "string" && PROJECT_STATUSES.includes(input.status as ProjectStatus) && input.status !== project.status) {
    next.status = input.status as ProjectStatus;
    changed.push("status");
  }
  if (typeof input.showcase === "string" && PROJECT_SHOWCASES.some((option) => option.value === input.showcase) && input.showcase !== project.showcase) {
    next.showcase = input.showcase as ProjectShowcase;
    changed.push("showcase");
  }
  if (typeof input.confidential === "boolean" && input.confidential !== project.confidential) {
    next.confidential = input.confidential;
    changed.push("confidential");
  }

  if (Array.isArray(input.body)) {
    const body = input.body
      .filter((section): section is Record<string, unknown> => !!section && typeof section === "object")
      .map((section, index) => ({
        heading: typeof section.heading === "string" ? section.heading.trim() : "",
        paragraphs: strings(section.paragraphs) ?? [],
        image: project.body[index]?.image ?? null,
      }))
      .filter((section) => section.heading || section.paragraphs.length > 0)
      .slice(0, PROJECT_LIMITS.maxSections);
    if (body.length > 0) {
      next.body = body;
      changed.push("body");
    }
  }

  if (changed.length === 0) return { ok: false, error: "Nothing in that block was new for this project." };
  return { ok: true, project: next, changed: changed.map((key) => LABELS[key] ?? key) };
}
