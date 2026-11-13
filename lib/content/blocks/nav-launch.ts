/**
 * Puts the Academy in a header or footer menu that was saved before the
 * Academy existed.
 *
 * The header links are editable, and a saved menu replaces the default one,
 * so a site whose menu was saved earlier never picked up the new link. This
 * adds it once, after Mentorship, to any menu last saved before the
 * Academy launched. A menu saved after that is left exactly as it was saved,
 * so taking the link out in the admin sticks.
 *
 * Applied where the site reads the menu and where the admin editor opens
 * it, so the editor shows the link and the next save stores it.
 */

export const ACADEMY_LAUNCH = Date.parse("2026-11-13T14:00:00+01:00");
const LINK = { label: "Academy", href: "/academy" };

export function withAcademyLink<T extends { label: string; href: string }>(links: T[], savedAt: Date | string | null | undefined): T[] {
  if (!savedAt || new Date(savedAt).getTime() >= ACADEMY_LAUNCH) return links;
  if (links.some((link) => link.href.replace(/\/+$/, "") === "/academy")) return links;
  const after = links.findIndex((link) => link.href === "/mentorship");
  const before = links.findIndex((link) => link.href === "/blog");
  const at = after >= 0 ? after + 1 : before >= 0 ? before : links.length;
  return [...links.slice(0, at), { ...LINK } as T, ...links.slice(at)];
}
