/*
  The reviews page's caption reel and record, as pure functions.

  The hero plays each approved review as a caption over a waveform. Each
  review is a clip of thin bars, one per word sampled, a bar's height from
  its word's length, so a long review is a long recording and a one-liner a
  short one. Nothing here is invented: the clips are drawn from the review
  text itself. Pure, so it is tested without a browser (see
  e2e/reviews-content.spec.ts).
*/

import { REVIEW_KINDS, type ReviewKind } from "@/lib/reviews/schema";

/** A review as the page needs it: the public fields, nothing else. */
export type ShownReview = {
  id: string;
  fullName: string;
  title: string;
  body: string;
  rating: number;
  kind: ReviewKind;
  photoUrl: string;
  links: { title: string; url: string }[];
  publishedAt: string;
};

/** How long each caption plays, in milliseconds. */
export const CAPTION_MS = 5600;

/** The most bars the whole strip draws, however many reviews there are. */
export const BAR_BUDGET = 200;

/** The fewest bars a clip has, so a one-liner is still something to click. */
export const MIN_BARS = 6;

/** "Ada Lovelace" → "AL". Shared with the admin's review list. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export type Clip = { id: string; kind: ReviewKind; heights: number[] };

/**
 * Each review as a clip of bar heights, in pixels. Bars are sampled from the
 * review's words, scaled down together so the strip stays within the budget,
 * and a bar's height follows its word's length, with a little texture so a
 * run of short words does not draw a flat line.
 */
export function clipsFor(reviews: readonly ShownReview[], budget = BAR_BUDGET): Clip[] {
  const wordsOf = (body: string) => body.trim().split(/\s+/).filter(Boolean);
  const total = reviews.reduce((sum, review) => sum + wordsOf(review.body).length, 0);
  const scale = total > 0 ? Math.min(1, budget / total) : 1;

  return reviews.map((review) => {
    const words = wordsOf(review.body);
    const count = Math.max(MIN_BARS, Math.round(words.length * scale));
    const heights = Array.from({ length: count }, (_, index) => {
      const word = words[Math.floor((index / count) * words.length)] ?? "";
      const letters = Math.min(word.replace(/[^\p{L}\p{N}]/gu, "").length, 11);
      return 14 + letters * 5 + ((index * 7) % 5) * 3;
    });
    return { id: review.id, kind: review.kind, heights };
  });
}

/** The caption, a word at a time, each with its delay in seconds. */
export function captionWords(body: string): { word: string; delay: number }[] {
  return body
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => ({ word, delay: Math.round(index * 45) / 1000 }));
}

export type KindFilter = "all" | ReviewKind;

/** The filters over the record, each with its label. */
export const KIND_FILTERS: readonly { value: KindFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "client", label: "Clients" },
  { value: "mentee", label: "Mentees" },
  { value: "reader", label: "Readers" },
];

/** A kind as a short tag: "Client", "Mentee", "Reader". */
export function kindTag(kind: ReviewKind): string {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

/** The answer on the form, and where that kind of review is shown. */
export function kindOption(kind: ReviewKind): { label: string; where: string } {
  const option = REVIEW_KINDS.find((entry) => entry.value === kind);
  return { label: option?.label ?? kindTag(kind), where: option?.section ?? "" };
}

export function filterByKind<T extends { kind: ReviewKind }>(reviews: readonly T[], filter: KindFilter): T[] {
  return filter === "all" ? [...reviews] : reviews.filter((review) => review.kind === filter);
}

export function kindCounts(reviews: readonly { kind: ReviewKind }[]): Record<KindFilter, number> {
  const counts: Record<KindFilter, number> = { all: reviews.length, client: 0, mentee: 0, reader: 0 };
  for (const review of reviews) counts[review.kind] += 1;
  return counts;
}

/** The mean rating to one decimal, or null with nothing to average. */
export function averageRating(reviews: readonly { rating: number }[]): string | null {
  if (reviews.length === 0) return null;
  return (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1);
}

/** How many reviews gave each rating, five first, with each one's share. */
export function distribution(reviews: readonly { rating: number }[]): { stars: number; count: number; share: number }[] {
  return [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((review) => review.rating === stars).length;
    return { stars, count, share: reviews.length ? count / reviews.length : 0 };
  });
}

/** The word under the rating picker. */
export const RATING_WORDS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"] as const;

/** "Oct 2026". */
export function monthOf(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}
