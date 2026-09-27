/**
 * Validation for a project, shared by the editor and the Server Actions it
 * calls. Same arrangement as posts and reviews: the client runs it to show
 * errors without a round trip, the server runs it because the client can be
 * bypassed.
 */

export const PROJECT_LIMITS = {
  nameMin: 2,
  nameMax: 200,
  descriptionMin: 40,
  descriptionMax: 4000,
  slugMax: 120,
  maxTags: 12,
  maxGroups: 4,
  maxResults: 6,
  maxSections: 20,
} as const;

export type ProjectStatus = "Live" | "In progress" | "On hold";
export type ProjectPreview = "dashboard" | "grid" | "list";

export const PROJECT_STATUSES: ProjectStatus[] = ["Live", "In progress", "On hold"];
export const PROJECT_PREVIEWS: ProjectPreview[] = ["dashboard", "grid", "list"];

/*
  The buckets currently in use, offered as suggestions rather than enforced.

  The filter on the work page derives its list from whatever the projects
  actually carry, so a new bucket needs no code change. These are here so the
  editor can offer the existing ones and stop "Web3" and "web3" both becoming
  facets.
*/
export const SUGGESTED_GROUPS = [
  "AI",
  "Web3",
  "Full-stack",
  "Backend / API",
  "Fintech",
  "Hackathon",
] as const;

export type ProjectMediaInput = {
  type: "image" | "video";
  /** A Cloudinary public_id, for anything uploaded through the admin. */
  publicId: string;
  /** A path under `public/`, for the projects imported from the code. */
  src: string;
  alt: string;
  poster: string;
};

export type CaseStudySectionInput = {
  heading: string;
  paragraphs: string[];
};

export type ProjectInput = {
  slug: string;
  name: string;
  category: string;
  groups: string[];
  description: string;
  tags: string[];
  status: ProjectStatus;
  preview: ProjectPreview;
  liveUrl: string;
  repoUrl: string;
  media: ProjectMediaInput | null;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  role: string;
  timeline: string;
  results: string[];
  body: CaseStudySectionInput[];
};

export type ProjectFieldErrors = Partial<
  Record<
    | "slug"
    | "name"
    | "description"
    | "groups"
    | "tags"
    | "liveUrl"
    | "repoUrl"
    | "media"
    | "body"
    | "form",
    string
  >
>;

export function slugifyProject(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, PROJECT_LIMITS.slugMax);
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/* Slugs the work routes already use. `/work` itself is a page, so a project
   slugged "work" would be unreachable. */
const RESERVED_SLUGS = new Set(["work", "new", "edit", "admin"]);

/**
 * Only http and https.
 *
 * These become anchors on a public page, and `javascript:` in an href is stored
 * cross-site scripting. `new URL()` parses that happily, so the protocol is
 * checked rather than relying on the parse succeeding.
 */
export function normaliseProjectUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function validateProject(input: ProjectInput): ProjectFieldErrors {
  const errors: ProjectFieldErrors = {};

  const slug = input.slug.trim();
  if (!slug) {
    errors.slug = "A slug is required. It becomes the URL.";
  } else if (!SLUG.test(slug)) {
    errors.slug = "Lowercase words separated by single hyphens.";
  } else if (RESERVED_SLUGS.has(slug)) {
    errors.slug = `"${slug}" is used by the work section itself. Pick another.`;
  }

  const name = input.name.trim();
  if (name.length < PROJECT_LIMITS.nameMin) {
    errors.name = "What is it called?";
  } else if (name.length > PROJECT_LIMITS.nameMax) {
    errors.name = "That name is too long.";
  }

  const description = input.description.trim();
  if (description.length < PROJECT_LIMITS.descriptionMin) {
    errors.description = `A sentence or two about what it does. At least ${PROJECT_LIMITS.descriptionMin} characters.`;
  } else if (description.length > PROJECT_LIMITS.descriptionMax) {
    errors.description = "That is longer than 4000 characters.";
  }

  /*
    Groups are required only to publish. A project can be drafted while you
    decide where it belongs, but one on the live grid with no bucket is
    invisible to every filter except "All".
  */
  if (input.published && input.groups.filter((g) => g.trim()).length === 0) {
    errors.groups = "Pick at least one bucket, or it only appears under All.";
  }

  if (input.groups.length > PROJECT_LIMITS.maxGroups) {
    errors.groups = `Up to ${PROJECT_LIMITS.maxGroups} buckets.`;
  }

  if (input.tags.length > PROJECT_LIMITS.maxTags) {
    errors.tags = `Up to ${PROJECT_LIMITS.maxTags} tags.`;
  }

  if (input.liveUrl.trim() && !normaliseProjectUrl(input.liveUrl)) {
    errors.liveUrl = "That does not look like a web address.";
  }
  if (input.repoUrl.trim() && !normaliseProjectUrl(input.repoUrl)) {
    errors.repoUrl = "That does not look like a web address.";
  }

  /*
    Alt text is required once there is an image, not optional with a nudge.
    A screenshot with no description is invisible to anybody using a screen
    reader, and the card is mostly image.
  */
  if (input.media && (input.media.publicId || input.media.src) && !input.media.alt.trim()) {
    errors.media = "Describe the screenshot, for anybody who cannot see it.";
  }

  if (input.body.length > PROJECT_LIMITS.maxSections) {
    errors.body = `That is more than ${PROJECT_LIMITS.maxSections} sections.`;
  }

  return errors;
}

/** Drops blank rows and trims. */
export function cleanList(values: string[], max: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const value of values) {
    const trimmed = value.trim().slice(0, 60);
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }

  return out.slice(0, max);
}

export function cleanSections(
  sections: CaseStudySectionInput[]
): CaseStudySectionInput[] {
  return sections
    .map((section) => ({
      heading: section.heading.trim(),
      paragraphs: section.paragraphs.map((p) => p.trim()).filter(Boolean),
    }))
    .filter((section) => section.heading || section.paragraphs.length > 0)
    .slice(0, PROJECT_LIMITS.maxSections);
}

export function emptyProject(): ProjectInput {
  return {
    slug: "",
    name: "",
    category: "",
    groups: [],
    description: "",
    tags: [],
    status: "Live",
    preview: "dashboard",
    liveUrl: "",
    repoUrl: "",
    media: null,
    featured: false,
    published: false,
    sortOrder: 0,
    role: "",
    timeline: "",
    results: [],
    body: [],
  };
}
