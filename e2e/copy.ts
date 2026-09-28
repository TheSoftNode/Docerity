import { DEFAULTS } from "@/lib/content/blocks/defaults";
import type { BlockRecord } from "@/lib/content/blocks/schema";

/*
  Headings read from the copy rather than typed here.

  Every one of these is editable now, and a test that names the words fails
  when somebody rewrites them, which is a decision rather than a defect. What
  is worth asserting is that the section rendered the heading it was given.
*/
export function heading(block: keyof typeof DEFAULTS, entry: string) {
  const headings = DEFAULTS[block].headings as Record<string, BlockRecord>;
  return headings[entry].title as string;
}

/** The homepage hero, which is an object group rather than a heading. */
export function hero() {
  return DEFAULTS.homepage.hero as BlockRecord;
}

/** The header links, in order. Editable, so a test must not name them. */
export function navLabels(): string[] {
  return (DEFAULTS.site.navLinks as BlockRecord[]).map((link) => link.label as string);
}
