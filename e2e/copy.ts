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

/**
 * What the header calls the page at `href`.
 *
 * For the tests that click a nav link to check where it goes: what matters is
 * the destination, and naming the label instead is what broke those tests when
 * Work became Projects. Throws rather than returning nothing, because a
 * missing link is a real failure and an empty selector reads as a flaky one.
 */
export function navLabelFor(href: string): string {
  const link = (DEFAULTS.site.navLinks as BlockRecord[]).find((item) => item.href === href);
  if (!link) throw new Error(`No header link points at ${href}.`);
  return link.label as string;
}

/**
 * The footer links, in order. Same reasoning as the header's, and the same
 * lesson: these were typed out in the footer test, so renaming Work to
 * Projects broke a test that had nothing to do with the rename.
 */
export function footerLinks(): { label: string; href: string }[] {
  return (DEFAULTS.site.footerLinks as BlockRecord[]).map((link) => ({
    label: link.label as string,
    href: link.href as string,
  }));
}

/**
 * Every partner name the homepage's bands should carry: the organisations
 * first, then the ecosystems, as the clients block lists them.
 */
export function clientNames(): string[] {
  const block = DEFAULTS.clients as Record<string, BlockRecord[]>;
  return [...block.organisations, ...block.ecosystems].map((logo) => logo.name as string);
}

/** The mentorship stages, which the homepage draws as a staircase. */
export function checkpoints(): { label: string; detail: string }[] {
  return (DEFAULTS.mentorship.checkpoints as BlockRecord[]).map((entry) => ({
    label: entry.label as string,
    detail: entry.detail as string,
  }));
}

/** The explainer pairs, in the order the homepage's card walks through them. */
export function explainerPairs(): { concept: string; analogy: string }[] {
  return (DEFAULTS.explainers.pairs as BlockRecord[]).map((pair) => ({
    concept: pair.conceptLabel as string,
    analogy: pair.analogyLabel as string,
  }));
}
