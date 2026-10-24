import type { BoardRow } from "@/components/sections/home/now-board";
import { BOARD_WIDTH, boardRows } from "@/components/sections/home/home-data";

/*
  Pure helpers that turn editable content into what the hero draws.

  Kept apart from the components so they can be tested without a browser
  (see e2e/home-content.spec.ts), and so the rules for what fits on the board
  live in one place rather than inside a render.
*/

/**
 * A word as the split-flap board can show it: upper case, letters, digits and
 * single spaces only, and no longer than the row.
 *
 * Cut at the last whole word that fits where possible, so "System Design
 * Review" becomes "SYSTEM DESIGN" rather than "SYSTEM DESIGN R".
 */
export function fitToBoard(text: string, width = BOARD_WIDTH): string {
  const clean = text
    .toUpperCase()
    .replace(/[^A-Z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (clean.length <= width) return clean;

  const cut = clean.slice(0, width + 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : clean.slice(0, width)).trim();
}

export type HeadlinePhrase = { lead: string; accent: string };

/**
 * One line of the hero title, split so its last word can carry the accent.
 *
 * "Software, shipped." reads as "Software," and "shipped.", which is the
 * design's two-line rhythm, and it holds for whatever an editor types: a
 * single-word line is all accent, and nothing is ever dropped.
 */
export function splitPhrase(line: string): HeadlinePhrase {
  const text = line.trim();
  const at = text.lastIndexOf(" ");
  if (at < 0) return { lead: "", accent: text };
  return { lead: text.slice(0, at), accent: text.slice(at + 1) };
}

/** The editable title as the phrases the headline rotates through. */
export function headlinePhrases(title: string): HeadlinePhrase[] {
  return title
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map(splitPhrase);
}

export type EmphasisPiece = { text: string; emphasis: boolean };

/**
 * Splits an editable title on its `*emphasis*` markers.
 *
 * The same convention `AccentedTitle` reads elsewhere on the site, so an
 * editor marks emphasis the same way everywhere. An unclosed asterisk is left
 * as written rather than swallowing the rest of the title.
 */
export function splitEmphasis(text: string): EmphasisPiece[] {
  return text
    .split(/\*([^*]+)\*/g)
    .map((piece, index) => ({ text: piece, emphasis: index % 2 === 1 }))
    .filter((piece) => piece.text.length > 0);
}

type BoardSource = {
  /** Live projects, which open their own sites. */
  projects: { name: string; href: string }[];
  /** The mentorship path's stages. */
  checkpoints: string[];
  /** The explainer concepts. */
  concepts: string[];
};

/**
 * The three rows of the Now Board, built from the site's own content.
 *
 * A row with nothing to show falls back to its track's name rather than
 * disappearing, so a fresh install with no projects still draws a whole board.
 */
export function buildBoardRows({ projects, checkpoints, concepts }: BoardSource): BoardRow[] {
  const sources: Record<(typeof boardRows)[number]["track"], { words: string[]; hrefs: string[] }> = {
    build: {
      words: projects.map((project) => fitToBoard(project.name)),
      hrefs: projects.map((project) => project.href),
    },
    mentor: {
      words: checkpoints.map((label) => fitToBoard(label)),
      hrefs: checkpoints.map(() => "/mentorship"),
    },
    explain: {
      words: concepts.map((label) => fitToBoard(label)),
      hrefs: concepts.map(() => "/blog"),
    },
  };

  return boardRows.map((row) => {
    const source = sources[row.track];
    const usable = source.words
      .map((word, index) => ({ word, href: source.hrefs[index] }))
      .filter((entry) => entry.word.length > 0);
    const entries = usable.length > 0 ? usable : [{ word: fitToBoard(row.label), href: "/" }];

    return {
      number: row.number,
      label: row.label,
      status: row.status,
      lamp: row.lamp,
      words: entries.map((entry) => entry.word),
      hrefs: entries.map((entry) => entry.href),
    };
  });
}
