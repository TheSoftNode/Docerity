/*
  The not-found page's bookshelf, as pure functions.

  The shelf is every page in the site's menus, each a spine and a link. The
  address that was asked for is a gap, set beside the page it is closest to
  when one is close enough to be what somebody meant ("/projets" beside
  Projects). Pure, so it is tested without a browser (see
  e2e/shelf-content.spec.ts).
*/

export type Page = { label: string; href: string };

/** How many edits away an address can be and still count as a likely typo. */
export const NEAR = 3;

/** Levenshtein distance between two strings. */
export function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    previous = current;
  }
  return previous[b.length];
}

/** The site's own pages from its menus, in order, once each, home left out. */
export function shelfFrom(...menus: readonly (readonly Page[])[]): Page[] {
  const seen = new Set<string>();
  const pages: Page[] = [];
  for (const menu of menus) {
    for (const page of menu) {
      const href = page.href.split("#")[0].replace(/\/+$/, "");
      if (!href.startsWith("/") || href === "" || seen.has(href)) continue;
      seen.add(href);
      pages.push({ label: page.label, href });
    }
  }
  return pages;
}

/** Lower-cased, without a trailing slash, query or hash: the part a person typed. */
export function normalisePath(path: string): string {
  const bare = path.split(/[?#]/)[0].toLowerCase().replace(/\/+$/, "");
  return bare === "" ? "/" : bare;
}

/**
 * The page somebody probably meant: the closest one, if it is within a few
 * edits, or a page the address sits under ("/blog/old-slug" → Blog).
 */
export function nearestPage(path: string, pages: readonly Page[]): Page | null {
  const asked = normalisePath(path);
  if (pages.length === 0 || asked === "/") return null;

  const parent = pages.find((page) => asked.startsWith(`${page.href.toLowerCase()}/`));
  if (parent) return parent;

  let best: { page: Page; distance: number } | null = null;
  for (const page of pages) {
    const distance = editDistance(asked, page.href.toLowerCase());
    if (!best || distance < best.distance) best = { page, distance };
  }
  return best && best.distance <= NEAR ? best.page : null;
}

export type Spot = { kind: "book"; page: Page; leaning: boolean } | { kind: "gap" };

/** The shelf as it stands: every book, and the gap beside the likely page or at the end. */
export function shelfWithGap(pages: readonly Page[], near: Page | null): Spot[] {
  const spots: Spot[] = [];
  for (const page of pages) {
    const leaning = near?.href === page.href;
    spots.push({ kind: "book", page, leaning });
    if (leaning) spots.push({ kind: "gap" });
  }
  if (!near) spots.push({ kind: "gap" });
  return spots;
}
