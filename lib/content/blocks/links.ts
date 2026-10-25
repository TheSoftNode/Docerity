/*
  Checks for links typed into the admin. Kept apart from `site.ts`, which is
  server-only, so the rule can be used anywhere and tested on its own.
*/
/** An https address as typed, or "" for anything else, so a typo never becomes a broken or unsafe link. */
export function safeLink(value: string | undefined): string {
  const text = (value ?? "").trim();
  if (!text) return "";
  try {
    return new URL(text).protocol === "https:" ? text : "";
  } catch {
    return "";
  }
}
