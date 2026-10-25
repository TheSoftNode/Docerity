/*
  The legal pages' small rules: reading the stored text into blocks, kept
  apart from the components so they can be tested without a page.
*/

export type LegalBlock =
  | { kind: "heading"; text: string; id: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] };

/** "Who we share it with" → "who-we-share-it-with": a heading's anchor. */
export function headingId(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

/** "{email}" replaced by the site's address, wherever it appears. */
export function fillEmail(text: string, email: string): string {
  return text.replace(/\{email\}/g, email);
}

/**
 * The body as blocks. A blank line starts a new block; a block starting
 * "## " is a heading; lines starting "- " are a list, and a paragraph and a
 * list may share a block without a blank line between them, since that is
 * how people type a lead-in and its list. Other lines inside a paragraph are
 * joined with a space. Two headings with the same text get distinct ids.
 */
export function legalBlocks(body: string): LegalBlock[] {
  const blocks: LegalBlock[] = [];
  const seen = new Map<string, number>();

  for (const chunk of body.replace(/\r\n?/g, "\n").split(/\n\s*\n/)) {
    const lines = chunk.split("\n").map((line) => line.trim()).filter(Boolean);
    let paragraph: string[] = [];
    let list: string[] = [];

    const flush = () => {
      if (paragraph.length) blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
      if (list.length) blocks.push({ kind: "list", items: list });
      paragraph = [];
      list = [];
    };

    for (const line of lines) {
      if (line.startsWith("## ")) {
        flush();
        const text = line.slice(3).trim();
        const base = headingId(text);
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        blocks.push({ kind: "heading", text, id: count === 0 ? base : `${base}-${count + 1}` });
      } else if (/^[-•]\s+/.test(line)) {
        if (paragraph.length) {
          blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
          paragraph = [];
        }
        list.push(line.replace(/^[-•]\s+/, ""));
      } else {
        if (list.length) {
          blocks.push({ kind: "list", items: list });
          list = [];
        }
        paragraph.push(line);
      }
    }
    flush();
  }

  return blocks;
}

/** The short version: one point per line, blank lines ignored. */
export function summaryPoints(summary: string): string[] {
  return summary
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-•]\s+/, "").trim())
    .filter(Boolean);
}
