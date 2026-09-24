/**
 * Validation for a post, shared by the editor and the Server Actions it calls.
 *
 * Same arrangement as the contact and review forms: the client runs it to show
 * errors without a round trip, the server runs it because the client can be
 * bypassed. Hand-rolled to match the rest of the codebase rather than pulling
 * in a schema library for one more form.
 */

export const POST_LIMITS = {
  titleMin: 4,
  titleMax: 200,
  hookMin: 20,
  hookMax: 400,
  slugMax: 120,
  maxTags: 6,
  maxSections: 30,
  headingMin: 3,
  sidenoteMax: 1000,
} as const;

export type PostType = "explainer" | "article";
export type PostStatus = "draft" | "published";

export type SectionInput = {
  heading: string;
  paragraphs: string[];
  sidenote: string;
  media: { type: "image" | "video"; alt: string; caption: string } | null;
};

export type TermInput = {
  label: string;
  caption: string;
  iconName: string;
};

export type PostInput = {
  type: PostType;
  slug: string;
  title: string;
  hook: string;
  readTime: string;
  tags: string[];
  status: PostStatus;
  /** An ISO date string, or "" to mean "stamp it when it is published". */
  publishedAt: string;
  body: SectionInput[];
  concept: TermInput | null;
  analogy: TermInput | null;
  topic: string;
  iconName: string;
};

export type PostFieldErrors = Partial<
  Record<
    | "slug"
    | "title"
    | "hook"
    | "tags"
    | "body"
    | "concept"
    | "analogy"
    | "topic"
    | "iconName"
    | "publishedAt"
    | "form",
    string
  >
>;

/**
 * Turns a title into a slug.
 *
 * Normalised to NFD first so accented characters decompose and the combining
 * marks can be stripped: without it "Café" becomes "caf" rather than "cafe",
 * because the accented character is not in the allowed set.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, POST_LIMITS.slugMax);
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/*
  Slugs the blog's own routes already use.

  `/blog/rss.xml` is a route handler in the same segment, so a post slugged
  "rss.xml" would collide with it. The dot makes it fail the slug pattern
  anyway, but the reserved list is the explicit statement of why.
*/
const RESERVED_SLUGS = new Set(["rss.xml", "rss", "feed", "new", "edit", "admin"]);

export function validatePost(input: PostInput): PostFieldErrors {
  const errors: PostFieldErrors = {};

  const slug = input.slug.trim();
  if (!slug) {
    errors.slug = "A slug is required. It becomes the URL.";
  } else if (!SLUG.test(slug)) {
    errors.slug = "Lowercase words separated by single hyphens.";
  } else if (RESERVED_SLUGS.has(slug)) {
    errors.slug = `"${slug}" is used by the blog itself. Pick another.`;
  }

  const title = input.title.trim();
  if (title.length < POST_LIMITS.titleMin) {
    errors.title = "A title, please.";
  } else if (title.length > POST_LIMITS.titleMax) {
    errors.title = "That title is too long.";
  }

  const hook = input.hook.trim();
  if (hook.length < POST_LIMITS.hookMin) {
    errors.hook = "One sentence that makes somebody want to read it.";
  } else if (hook.length > POST_LIMITS.hookMax) {
    errors.hook = "Keep the hook under 400 characters.";
  }

  if (input.tags.length > POST_LIMITS.maxTags) {
    errors.tags = `Up to ${POST_LIMITS.maxTags} tags.`;
  }

  /*
    A draft can be half-written; a published post cannot.

    Checking the body only on publish is what makes the editor usable: being
    forced to write a complete section before the first save would mean losing
    an outline every time, which is exactly when a draft is most useful.
  */
  if (input.status === "published") {
    const usable = input.body.filter(
      (section) =>
        section.heading.trim().length >= POST_LIMITS.headingMin &&
        section.paragraphs.some((paragraph) => paragraph.trim().length > 0)
    );

    if (usable.length === 0) {
      errors.body =
        "A published post needs at least one section with a heading and a paragraph.";
    }
  }

  if (input.body.length > POST_LIMITS.maxSections) {
    errors.body = `That is more than ${POST_LIMITS.maxSections} sections. Consider splitting the post.`;
  }

  if (input.type === "explainer") {
    /*
      An explainer is the pairing of a concept with an analogy, and the index
      page tickers the two against each other. One without the other renders an
      empty half, so both are required even in a draft.
    */
    if (!input.concept?.label.trim() || !input.concept.caption.trim()) {
      errors.concept = "An explainer needs the concept it explains, with a caption.";
    }
    if (!input.analogy?.label.trim() || !input.analogy.caption.trim()) {
      errors.analogy = "And the everyday thing it is compared to.";
    }
  } else {
    if (!input.topic.trim()) {
      errors.topic = "A topic, which is the label above the title.";
    }
    if (!input.iconName.trim()) {
      errors.iconName = "Pick an icon.";
    }
  }

  if (input.publishedAt && Number.isNaN(Date.parse(input.publishedAt))) {
    errors.publishedAt = "That date could not be read.";
  }

  return errors;
}

/** Drops blank paragraphs and empty sections, and trims everything. */
export function cleanSections(sections: SectionInput[]): SectionInput[] {
  return sections
    .map((section) => ({
      heading: section.heading.trim(),
      paragraphs: section.paragraphs.map((p) => p.trim()).filter(Boolean),
      sidenote: section.sidenote.trim().slice(0, POST_LIMITS.sidenoteMax),
      media: section.media
        ? {
            type: section.media.type,
            alt: section.media.alt.trim(),
            caption: section.media.caption.trim(),
          }
        : null,
    }))
    .filter((section) => section.heading || section.paragraphs.length > 0)
    .slice(0, POST_LIMITS.maxSections);
}

export function cleanTags(tags: string[]): string[] {
  /* Deduplicated case-insensitively but stored as typed, so "Performance" and
     "performance" do not both end up as facets on the index page. */
  const seen = new Set<string>();
  const out: string[] = [];

  for (const tag of tags) {
    const trimmed = tag.trim().slice(0, 40);
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(trimmed);
  }

  return out.slice(0, POST_LIMITS.maxTags);
}

/** A blank post for the editor to open with. */
export function emptyPost(type: PostType): PostInput {
  return {
    type,
    slug: "",
    title: "",
    hook: "",
    readTime: "",
    tags: [],
    status: "draft",
    publishedAt: "",
    body: [{ heading: "", paragraphs: [""], sidenote: "", media: null }],
    concept: type === "explainer" ? { label: "", caption: "", iconName: "ZapIcon" } : null,
    analogy:
      type === "explainer" ? { label: "", caption: "", iconName: "StickyNoteIcon" } : null,
    topic: "",
    iconName: type === "article" ? "PenLineIcon" : "",
  };
}
