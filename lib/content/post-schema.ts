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
/*
  `submitted` sits between the two: a contributor's finished post, waiting for
  somebody who can publish. It validates like a published post, because there
  is no point queueing something incomplete for review.
*/
export type PostStatus = "draft" | "submitted" | "published";

/**
 * What a section's media frame holds while it is being edited.
 *
 * `publicId` is the Cloudinary asset the browser uploaded, `src` a path under
 * /public carried over from `blog-data.ts`. Both can be empty, and then the
 * article renders the dashed placeholder frame: marking where a diagram goes
 * before drawing it is a thing authors do.
 */
export type SectionMediaInput = {
  type: "image" | "video";
  publicId: string;
  src: string;
  alt: string;
  caption: string;
  poster: string;
};

export type SectionInput = {
  heading: string;
  paragraphs: string[];
  sidenote: string;
  media: SectionMediaInput | null;
};

/** A frame with nothing in it yet, which is how one is added in the editor. */
export function emptySectionMedia(type: "image" | "video" = "image"): SectionMediaInput {
  return { type, publicId: "", src: "", alt: "", caption: "", poster: "" };
}

/**
 * Keeps `src` to a file this site actually serves.
 *
 * It is a path under /public, never a URL. The editor never sets it (uploads
 * go to `publicId`), so the only ways a value arrives are the importer and
 * somebody posting to the Server Action by hand, and a contributor can reach
 * that action: writing posts is the one thing their role is for.
 *
 * So an absolute URL is dropped rather than rendered. It would put a stranger's
 * server in an `<img src>` on a published page, which hands them every reader's
 * IP address and lets them swap the picture afterwards. A protocol-relative
 * "//host/x" is the same trick with the scheme left off, which is why the check
 * is on the first two characters rather than on the first.
 */
function safeMediaPath(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  if (!value.startsWith("/") || value.startsWith("//")) return "";
  return value;
}

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
  if (input.status === "published" || input.status === "submitted") {
    const usable = input.body.filter(
      (section) =>
        section.heading.trim().length >= POST_LIMITS.headingMin &&
        section.paragraphs.some((paragraph) => paragraph.trim().length > 0)
    );

    if (usable.length === 0) {
      errors.body =
        input.status === "submitted"
          ? "Before submitting, write at least one section with a heading and a paragraph."
          : "A published post needs at least one section with a heading and a paragraph.";
    }
  }

  if (input.body.length > POST_LIMITS.maxSections) {
    errors.body = `That is more than ${POST_LIMITS.maxSections} sections. Consider splitting the post.`;
  }

  /*
    An uploaded image needs a description, the same rule the work editor has.

    Only once there is something to describe: an empty frame renders as a
    dashed placeholder whose whole job is to say "a diagram goes here", and
    demanding alt text for a picture that does not exist yet would make the
    placeholder useless. A video is exempt because it carries a caption and
    controls, and describing a clip in an alt attribute is not how anybody
    reads one.
  */
  const missingAlt = input.body.findIndex(
    (section) =>
      section.media?.type === "image" &&
      (section.media.publicId || section.media.src) &&
      !section.media.alt.trim()
  );

  if (missingAlt >= 0) {
    errors.body = `Section ${missingAlt + 1} has an image with no alt text. Describe what it shows.`;
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
            publicId: section.media.publicId.trim(),
            /* A video's poster is generated from the clip when it is blank, so
               it is never required of the author. */
            poster: safeMediaPath(section.media.poster),
            src: safeMediaPath(section.media.src),
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
