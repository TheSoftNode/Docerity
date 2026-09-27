import "server-only";

import { cache } from "react";

import { database } from "@/lib/config/env";
import { createLogger } from "@/lib/core/logger";
import { findBlock } from "@/lib/repositories/site-content.repository";
import { DEFAULTS } from "@/lib/content/blocks/defaults";
import { cleanBlock } from "@/lib/content/blocks/clean";
import { mergeBlock } from "@/lib/content/blocks/merge";
import type { BlockData, BlockKey, BlockRecord } from "@/lib/content/blocks/schema";

/**
 * Where an editable page section's content comes from.
 *
 * The database when there is one and it has something for this section, and the
 * built-in copy otherwise. The same arrangement `lib/content/posts.ts` and
 * `lib/content/work.ts` use, for the same three reasons: a fresh clone with no
 * MONGODB_URI renders the real site, the e2e suite runs without a database, and
 * an unreachable Atlas during a deploy shows the previous copy rather than an
 * empty page.
 *
 * Three things make that fallback trustworthy rather than nominal:
 *
 * It never throws. A section that cannot be read is logged and falls back, so a
 * connection timeout costs the site one section's freshness, not the page.
 *
 * It falls back per group, not per section. A stored document missing a group
 * entirely, which is what an older document looks like after a group is added
 * to the description, takes the built-in copy for that group and the stored
 * copy for the rest. Without this, adding a group to a section would blank it
 * on every site that had already saved one.
 *
 * It is cleaned on the way out as well as on the way in. A document written
 * before a field existed is reshaped to the current description, so a render
 * never reads a field that is not there.
 *
 * The merge itself lives in `./merge`, which is not `server-only`, so the part
 * that decides what the page sees can be tested directly. It was worth
 * separating: a bug there is silent, and was, until an integration test caught
 * every section heading being saved and then ignored.
 */

const logger = createLogger("content.blocks");

/**
 * One section's content.
 *
 * Wrapped in React's `cache`, so two components on the same page reading the
 * same section share one query rather than each making their own. The About
 * page reads four groups from four components.
 */
export const getBlock = cache(async (key: BlockKey): Promise<BlockData> => {
  if (!database.isConfigured) return DEFAULTS[key];

  try {
    const stored = await findBlock(key);
    if (!stored?.data) return DEFAULTS[key];

    return cleanBlock(key, mergeBlock(key, stored.data));
  } catch (error) {
    logger.error("could not load a content block, falling back", error, { key });
    return DEFAULTS[key];
  }
});

/**
 * Typed access to one group, which is what a section component actually wants.
 *
 * The cast is checked in practice rather than by the compiler: `cleanBlock` has
 * just rebuilt this value from the field description, so a group declared as a
 * list is an array of records with exactly those fields. Each caller states the
 * shape it renders, and a mismatch between that and the description is caught
 * by `e2e/content-blocks.spec.ts`, which walks every block and asserts the
 * defaults satisfy it.
 */
export async function getGroup<T>(key: BlockKey, group: string): Promise<T> {
  const data = await getBlock(key);
  return data[group] as T;
}

/**
 * One section's heading: the eyebrow, the title and the optional lede.
 *
 * Its own function rather than a `getGroup` call at each site, because the
 * lookup is by key inside a keyed group and getting that wrong is quiet: a
 * missing record renders three empty strings, which is a heading that
 * disappeared rather than an error anybody sees.
 *
 * `block` is the section the heading belongs to, and `key` the entry within
 * it. A key the block does not declare returns blanks, which `cleanBlock`
 * cannot produce, so it only happens if a caller and the schema disagree;
 * `e2e/content-blocks.spec.ts` walks every declared key to catch that.
 */
export type SectionHeading = { eyebrow: string; title: string; lede: string };

export async function getHeading(
  key: BlockKey,
  entry: string
): Promise<SectionHeading> {
  const data = await getBlock(key);
  const headings = (data.headings ?? {}) as Record<string, BlockRecord>;
  const heading = headings[entry] ?? {};

  return {
    eyebrow: (heading.eyebrow as string) ?? "",
    title: (heading.title as string) ?? "",
    lede: (heading.lede as string) ?? "",
  };
}
