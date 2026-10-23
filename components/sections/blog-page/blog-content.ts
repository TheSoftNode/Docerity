/*
  The blog's pure helpers: the periodic-table framing and the reading order.

  Every piece is set as an element: numbered in the order it was published,
  with a two-letter symbol taken from its concept (an explainer) or its title
  (an article). The table those elements sit in has a fixed shape, with the
  gaps a periodic table has; pieces fill it in order and the slots not yet
  filled are drawn as "being written". Pure, so it is tested without a browser
  (see e2e/blog-content.spec.ts).
*/

/** Words skipped when a symbol is taken from a title. */
const STOP_WORDS = new Set(["a", "an", "and", "the", "of", "on", "to", "for", "in", "how", "why", "what", "i", "notes", "case", "study"]);

/**
 * A two-letter symbol for a name: the first letters of its first two words
 * that carry meaning, "Load Balancing" → "Lb", or the first two letters of a
 * single word, "Caching" → "Ca".
 */
export function symbolFor(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/[\s-]+/)
    .filter((word) => word && !STOP_WORDS.has(word.toLowerCase()));
  if (words.length === 0) return name.slice(0, 2) || "?";
  if (words.length === 1) {
    const word = words[0];
    return word.charAt(0).toUpperCase() + word.slice(1, 2).toLowerCase();
  }
  return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toLowerCase();
}

type Dated = { slug: string; publishedAt: string };

/**
 * Pieces oldest first, which is their element order. Ties keep the order
 * they arrived in, so two posts published on one day do not swap numbers
 * between renders.
 */
export function inElementOrder<T extends Dated>(entries: readonly T[]): T[] {
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => a.entry.publishedAt.localeCompare(b.entry.publishedAt) || a.index - b.index)
    .map(({ entry }) => entry);
}

/** Columns in the table. */
export const TABLE_COLUMNS = 10;

/*
  The first three rows' slots, as [column, row], in periodic order: the outer
  columns of rows one and two (around the gaps the heading and the reading
  panel sit in), then the full third row. Pieces past these fill further full
  rows.
*/
const SHAPED_SLOTS: readonly (readonly [number, number])[] = [
  [1, 1],
  [10, 1],
  [1, 2],
  [2, 2],
  [9, 2],
  [10, 2],
  ...Array.from({ length: TABLE_COLUMNS }, (_, column) => [column + 1, 3] as const),
];

export type Slot = { column: number; row: number };

/**
 * Where each of `count` pieces sits, plus the empty slots that complete the
 * table, so it always reads as a whole shape: the first three rows are always
 * drawn, and a piece past them starts a further row of ten.
 */
export function tableSlots(count: number): { filled: Slot[]; empty: Slot[] } {
  const extraRows = Math.max(0, Math.ceil((count - SHAPED_SLOTS.length) / TABLE_COLUMNS));
  const slots: Slot[] = [
    ...SHAPED_SLOTS.map(([column, row]) => ({ column, row })),
    ...Array.from({ length: extraRows * TABLE_COLUMNS }, (_, index) => ({
      column: (index % TABLE_COLUMNS) + 1,
      row: 4 + Math.floor(index / TABLE_COLUMNS),
    })),
  ];
  return { filled: slots.slice(0, count), empty: slots.slice(count) };
}

/** "4 min read" → "4 min", for the tiles and the meta lines. */
export function shortReadTime(readTime: string): string {
  return readTime.replace(/\s*read\s*$/i, "").trim();
}

/** "2026-05-04" → "4 May 2026", in UTC so the server and the browser agree. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

type Tagged = Dated & { tags: readonly string[] };

/**
 * What to read after a piece: the next one of the same kind in element
 * order, wrapping round, and up to three related ones, those sharing a tag
 * first, then the rest of the same kind, then anything.
 */
export function readingOrder<T extends Tagged & { type: string }>(
  entries: readonly T[],
  slug: string
): { next: T | undefined; related: T[] } {
  const ordered = inElementOrder(entries);
  const current = ordered.find((entry) => entry.slug === slug);
  if (!current) return { next: undefined, related: [] };

  const sameKind = ordered.filter((entry) => entry.type === current.type);
  const position = sameKind.findIndex((entry) => entry.slug === slug);
  const next = sameKind.length > 1 ? sameKind[(position + 1) % sameKind.length] : ordered.find((entry) => entry.slug !== slug);

  const others = ordered.filter((entry) => entry.slug !== slug && entry.slug !== next?.slug);
  const sharesTag = (entry: T) => entry.tags.some((tag) => current.tags.includes(tag));
  const ranked = [
    ...others.filter((entry) => entry.type === current.type && sharesTag(entry)),
    ...others.filter((entry) => entry.type !== current.type && sharesTag(entry)),
    ...others.filter((entry) => entry.type === current.type && !sharesTag(entry)),
    ...others.filter((entry) => entry.type !== current.type && !sharesTag(entry)),
  ];
  return { next, related: ranked.slice(0, 3) };
}

/** Every tag in use, most used first, ties alphabetical. */
export function tagCounts(entries: readonly { tags: readonly string[] }[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const entry of entries) for (const tag of entry.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/**
 * A title as the page sets it: its text without a closing full stop, and the
 * stop to draw after it in the accent. Every heading on the site ends on one;
 * a title that ends on a question or an exclamation keeps its own mark and
 * gets no added stop.
 */
export function titleParts(title: string): { text: string; stop: string } {
  const text = title.trim();
  if (/[?!]$/.test(text)) return { text, stop: "" };
  return { text: text.replace(/\.$/, ""), stop: "." };
}

/** "02" style counters. */
export function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** A piece as the blog's index draws it: an element in the table. */
export type BlogElement = {
  slug: string;
  type: "explainer" | "article";
  /** Its element number: its place in publishing order, from 1. */
  number: number;
  symbol: string;
  /** What the tile names: the concept for an explainer, the title otherwise. */
  name: string;
  /** "Explainer" or the article's topic. */
  kind: string;
  /** The line beside the name: the everyday comparison, or the title. */
  line: string;
  /** The concept's own one-line meaning, for an explainer. */
  caption: string;
  hook: string;
  read: string;
  date: string;
  publishedAt: string;
  tags: string[];
};

type ElementSource =
  | { type: "explainer"; slug: string; title: string; hook: string; readTime: string; publishedAt: string; tags: readonly string[]; concept: { label: string; caption: string }; analogy: { label: string } }
  | { type: "article"; slug: string; title: string; hook: string; readTime: string; publishedAt: string; tags: readonly string[]; topic: string };

/** The pieces as elements, numbered in publishing order. */
export function toElements(entries: readonly ElementSource[]): BlogElement[] {
  return inElementOrder(entries).map((entry, index) => {
    const explainer = entry.type === "explainer";
    return {
      slug: entry.slug,
      type: entry.type,
      number: index + 1,
      symbol: symbolFor(explainer ? entry.concept.label : entry.title),
      name: explainer ? entry.concept.label : entry.title,
      kind: explainer ? "Explainer" : entry.topic,
      line: explainer ? entry.analogy.label : entry.title,
      caption: explainer ? entry.concept.caption : "",
      hook: entry.hook,
      read: shortReadTime(entry.readTime),
      date: formatDate(entry.publishedAt),
      publishedAt: entry.publishedAt,
      tags: [...entry.tags],
    };
  });
}
