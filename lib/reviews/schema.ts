/**
 * One source of truth for the review form, shared by the client and the route
 * handler so the two can never disagree about what is valid.
 *
 * Same arrangement as `lib/contact/schema.ts`. The client uses it to show
 * errors before a round trip; the server uses it because the client can be
 * bypassed entirely.
 */

export const REVIEW_LIMITS = {
  nameMin: 2,
  nameMax: 120,
  titleMin: 3,
  titleMax: 160,
  bodyMin: 40,
  bodyMax: 2000,
  maxLinks: 3,
  /* A headshot, not a gallery. Anything larger is a photo straight off a phone
     that nobody resized, and it will be rendered at 96px. */
  maxPhotoBytes: 5 * 1024 * 1024,
} as const;

export const ACCEPTED_PHOTO_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

export const ACCEPTED_PHOTO_EXTENSIONS = ".png,.jpg,.jpeg,.webp";

export type ReviewLinkInput = { title: string; url: string };

export type ReviewInput = {
  fullName: string;
  title: string;
  body: string;
  rating: number;
  contactEmail: string;
  links: ReviewLinkInput[];
};

export type ReviewFieldErrors = Partial<
  Record<"fullName" | "title" | "body" | "rating" | "contactEmail" | "links" | "photo" | "form", string>
>;

/* Deliberately permissive; the same regex the enquiry form uses. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Only http and https are accepted.
 *
 * A link is rendered as an anchor on a public page, and `javascript:` in an
 * href is a stored cross-site scripting hole. `new URL()` parses those
 * happily, so the protocol has to be checked separately rather than relying on
 * the parse succeeding.
 */
export function normaliseUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  /* Someone typing "docerity.com" means a website, not a relative path. */
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

export function validateReview(input: ReviewInput): ReviewFieldErrors {
  const errors: ReviewFieldErrors = {};

  const name = input.fullName.trim();
  if (name.length < REVIEW_LIMITS.nameMin) {
    errors.fullName = "Please tell me your name.";
  } else if (name.length > REVIEW_LIMITS.nameMax) {
    errors.fullName = "That name is too long.";
  }

  const title = input.title.trim();
  if (title.length < REVIEW_LIMITS.titleMin) {
    errors.title = "A role and company, or a short headline.";
  } else if (title.length > REVIEW_LIMITS.titleMax) {
    errors.title = "Keep this under 160 characters.";
  }

  const body = input.body.trim();
  if (body.length < REVIEW_LIMITS.bodyMin) {
    errors.body = `A couple of sentences, please. At least ${REVIEW_LIMITS.bodyMin} characters.`;
  } else if (body.length > REVIEW_LIMITS.bodyMax) {
    errors.body = "That is longer than 2000 characters.";
  }

  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    errors.rating = "Pick a rating from 1 to 5.";
  }

  /*
    Required, unlike on the public display. It is the only way to tell a real
    testimonial from something typed by a stranger, and it is never rendered:
    `listPublished` does not project it.
  */
  if (!EMAIL.test(input.contactEmail.trim())) {
    errors.contactEmail = "An email address, so I can verify this is really you.";
  }

  if (input.links.length > REVIEW_LIMITS.maxLinks) {
    errors.links = `Up to ${REVIEW_LIMITS.maxLinks} links.`;
  } else if (input.links.some((link) => link.title.trim() && !normaliseUrl(link.url))) {
    errors.links = "One of those links isn't a valid web address.";
  }

  return errors;
}

/** Drops blank rows and rewrites each URL through the protocol check. */
export function cleanLinks(links: ReviewLinkInput[]): ReviewLinkInput[] {
  return links
    .map((link) => ({ title: link.title.trim(), url: normaliseUrl(link.url) ?? "" }))
    .filter((link) => link.title && link.url)
    .slice(0, REVIEW_LIMITS.maxLinks);
}
