import { DEFAULTS } from "@/lib/content/blocks/defaults";
import {
  blockFor,
  type BlockData,
  type BlockKey,
  type BlockRecord,
} from "@/lib/content/blocks/schema";

/**
 * Merges a stored section over the built-in one, group by group.
 *
 * A group is taken from the database when it is present and non-empty, and from
 * the defaults otherwise. "Non-empty" matters: deleting every row of a group is
 * a legitimate thing to want (a client list with no ecosystems, say), but it is
 * indistinguishable from a group that was never saved, and showing nothing by
 * accident is worse than showing the original. Emptying a group for real is
 * done by resetting the section and is called out in the editor.
 */
export function mergeBlock(key: BlockKey, stored: BlockData): BlockData {
  const fallback = DEFAULTS[key];
  const merged: BlockData = { ...fallback };

  for (const group of blockFor(key).groups) {
    const value = stored[group.name];
    if (value === undefined || value === null) continue;

    if (group.kind === "object") {
      /* An object group merges field by field, so a document written before a
         field was added keeps the built-in value for it rather than an
         undefined that renders as nothing. */
      merged[group.name] = {
        ...(fallback[group.name] as BlockRecord),
        ...(value as BlockRecord),
      };
      continue;
    }

    if (group.kind === "keyed") {
      /*
        Entry by entry, and field by field within each.

        Both levels matter. A document written before an entry was declared has
        nothing for it, and taking the whole group from the database would make
        that heading vanish; a document written before a field was added to the
        entry would render that field as nothing.

        This branch is why the group kind is checked rather than the value's
        shape. A keyed group is a plain object, so the array test below is
        false for it, and without this the stored version was dropped on the
        floor: every heading and every page title could be edited, saved, and
        silently ignored.
      */
      const storedEntries = value as Record<string, BlockRecord>;
      const fallbackEntries = (fallback[group.name] ?? {}) as Record<string, BlockRecord>;
      const entries: Record<string, BlockRecord> = { ...fallbackEntries };

      for (const entry of group.entries) {
        if (!storedEntries[entry.key]) continue;
        entries[entry.key] = {
          ...(fallbackEntries[entry.key] ?? {}),
          ...storedEntries[entry.key],
        };
      }

      merged[group.name] = entries;
      continue;
    }

    if (Array.isArray(value) && value.length > 0) merged[group.name] = value;
  }

  return merged;
}
