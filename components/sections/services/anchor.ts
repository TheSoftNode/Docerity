/**
 * The id a service line's card is given, and the target its index row links to.
 *
 * Its own module, with no `"use client"`, because both an interactive panel and
 * a server-rendered card need it: a plain function exported from a client
 * module and imported by a Server Component is a boundary crossing that
 * happens to work until it does not.
 *
 * Derived from the title rather than stored, because these are edited in the
 * admin and a stored id would drift from the text it points at the first time
 * one is reworded.
 */
export function anchorFor(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "line"
  );
}
