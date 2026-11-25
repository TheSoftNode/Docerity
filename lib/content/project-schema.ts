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
  /* Enough to show the product, few enough that the page is still a page
     rather than a contact sheet. */
  maxGallery: 8,
  maxContributions: 10,
} as const;

/*
  The project's real-world state, shown on every card. Honest labels for the
  work that never reached users is better than "Live" on a dead link:
  private client work, hackathon builds, prototypes and things shut down all
  have a name of their own.
*/
export type ProjectStatus = "Live" | "In progress" | "On hold" | "Client work" | "Hackathon build" | "Prototype" | "Discontinued";
export type ProjectPreview = "dashboard" | "grid" | "list";

export const PROJECT_STATUSES: ProjectStatus[] = ["Live", "In progress", "Client work", "Hackathon build", "Prototype", "On hold", "Discontinued"];

/** The dot beside a status, the same on every card and page. */
export function statusDot(status: string): string {
  switch (status) {
    case "Live":
      return "bg-[#54D696]";
    case "In progress":
      return "bg-[#FFC94A]";
    case "Client work":
      return "bg-[#AFC4FF]";
    case "Hackathon build":
      return "bg-[#FF7A59]";
    case "Prototype":
      return "bg-[#C9B4FF]";
    default:
      return "bg-[var(--ld-muted-3)]";
  }
}

/*
  Where a project sits on the founder's portfolio (/theo), as a case study.
  "" keeps it off the portfolio; the projects page lists everything anyway.
*/
export type ProjectShowcase = "" | "professional" | "docerity" | "hackathon" | "prototype";
export const PROJECT_SHOWCASES: { value: ProjectShowcase; label: string }[] = [
  { value: "", label: "Not on the portfolio" },
  { value: "professional", label: "Leadership & professional work" },
  { value: "docerity", label: "Docerity" },
  { value: "hackathon", label: "Hackathons" },
  { value: "prototype", label: "Prototypes & experiments" },
];
export const PROJECT_PREVIEWS: ProjectPreview[] = ["dashboard", "grid", "list"];

/*
  The buckets currently in use, offered as suggestions rather than enforced.

  The filter on the projects page derives its list from whatever the projects
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
  "Security",
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

export type ProjectImageInput = {
  publicId: string;
  /** A path under `public/`, for anything that came from the import. */
  src: string;
  alt: string;
  caption: string;
};

export type CaseStudySectionInput = {
  heading: string;
  paragraphs: string[];
  image: ProjectImageInput | null;
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
  gallery: ProjectImageInput[];
  client: string;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  role: string;
  timeline: string;
  results: string[];
  body: CaseStudySectionInput[];
  /** The client's work is under NDA: say so, and name them only as `client` describes them. */
  confidential: boolean;
  /** A prize or mention, e.g. "Winner, ETHGlobal Lagos 2025", and where to check it. */
  recognition: string;
  recognitionUrl: string;
  /** A walkthrough video: YouTube, Loom or Vimeo. */
  demoUrl: string;
  /** "My part": what you did yourself, one per line. */
  contributions: string[];
  /** Public proof when the real code is private: a repo or article showing the same technique. */
  proofUrl: string;
  proofLabel: string;
  showcase: ProjectShowcase;
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
    | "recognitionUrl"
    | "demoUrl"
    | "proofUrl"
    | "media"
    | "gallery"
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

/* Slugs the work routes already use. `/projects` itself is a page, so a project
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
  if (input.recognitionUrl.trim() && !normaliseProjectUrl(input.recognitionUrl)) {
    errors.recognitionUrl = "That does not look like a web address.";
  }
  if (input.demoUrl.trim() && !videoEmbedUrl(input.demoUrl)) {
    errors.demoUrl = "A YouTube, Loom or Vimeo link.";
  }
  if (input.proofUrl.trim() && !normaliseProjectUrl(input.proofUrl)) {
    errors.proofUrl = "That does not look like a web address.";
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

  /* Same rule as the hero image, for the same reason: a gallery of
     undescribed screenshots is a gallery of nothing to a screen reader. */
  if (input.gallery.some((item) => (item.publicId || item.src) && !item.alt.trim())) {
    errors.gallery = "Every screenshot needs a description.";
  }

  if (input.gallery.length > PROJECT_LIMITS.maxGallery) {
    errors.gallery = `Up to ${PROJECT_LIMITS.maxGallery} screenshots.`;
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
      image:
        section.image && (section.image.publicId || section.image.src)
          ? {
              publicId: section.image.publicId,
              src: section.image.src.trim(),
              alt: section.image.alt.trim(),
              caption: section.image.caption.trim(),
            }
          : null,
    }))
    .filter(
      (section) => section.heading || section.paragraphs.length > 0 || section.image
    )
    .slice(0, PROJECT_LIMITS.maxSections);
}

/** Drops entries with nothing in them, and trims the rest. */
export function cleanGallery(items: ProjectImageInput[]): ProjectImageInput[] {
  return items
    .filter((item) => item.publicId || item.src.trim())
    .map((item) => ({
      publicId: item.publicId,
      src: item.src.trim(),
      alt: item.alt.trim(),
      caption: item.caption.trim(),
    }))
    .slice(0, PROJECT_LIMITS.maxGallery);
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
    gallery: [],
    client: "",
    featured: false,
    published: false,
    sortOrder: 0,
    role: "",
    timeline: "",
    results: [],
    body: [],
    confidential: false,
    recognition: "",
    recognitionUrl: "",
    demoUrl: "",
    contributions: [],
    proofUrl: "",
    proofLabel: "",
    showcase: "",
  };
}

/** Trims and drops blank lines, keeping longer text than `cleanList` (a sentence each). */
export function cleanLines(values: string[], max: number, length = 240): string[] {
  return values
    .map((value) => value.trim().slice(0, length))
    .filter(Boolean)
    .slice(0, max);
}

/**
 * The embeddable player address for a walkthrough video, or null when the
 * link isn't one we can play: YouTube (played from the privacy-enhanced
 * host), Loom or Vimeo.
 */
export function videoEmbedUrl(raw: string): string | null {
  const href = normaliseProjectUrl(raw);
  if (!href) return null;
  const url = new URL(href);
  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");
  const id = (value: string | null | undefined) => (value && /^[\w-]{6,64}$/.test(value) ? value : null);
  if (host === "youtube.com") {
    const v = id(url.searchParams.get("v")) ?? id(url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/)?.[1]);
    return v ? `https://www.youtube-nocookie.com/embed/${v}` : null;
  }
  if (host === "youtu.be") {
    const v = id(url.pathname.slice(1));
    return v ? `https://www.youtube-nocookie.com/embed/${v}` : null;
  }
  if (host === "loom.com") {
    const v = id(url.pathname.match(/^\/(?:share|embed)\/([\w-]+)/)?.[1]);
    return v ? `https://www.loom.com/embed/${v}` : null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const v = url.pathname.match(/(\d{6,12})/)?.[1];
    return v ? `https://player.vimeo.com/video/${v}` : null;
  }
  return null;
}
