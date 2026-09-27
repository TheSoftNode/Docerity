import { connectDB } from "@/lib/db/connect";
import { SiteContentModel } from "@/lib/db/models/site-content.model";
import type { BlockData, BlockKey } from "@/lib/content/blocks/schema";

/**
 * Page-section persistence.
 *
 * Two operations, because a section is never partly saved: the editor holds the
 * whole thing and writes the whole thing back. There is no "add one row"
 * endpoint, so there is no way for two saves to interleave into a half-state.
 */

export type LeanSiteContent = {
  key: string;
  data: BlockData;
  updatedBy: string;
  updatedAt: Date;
};

export async function findBlock(key: BlockKey): Promise<LeanSiteContent | null> {
  await connectDB();
  const doc = await SiteContentModel.findOne({ key }).lean<LeanSiteContent>().exec();
  return doc ?? null;
}

export async function listBlocks(): Promise<LeanSiteContent[]> {
  await connectDB();
  return SiteContentModel.find({}).lean<LeanSiteContent[]>().exec();
}

/**
 * Writes a whole section, creating the document the first time.
 *
 * An upsert rather than a find-then-create: the unique index on `key` makes it
 * one atomic operation, so two editors pressing Save at the same moment cannot
 * produce two documents for one section.
 */
export async function saveBlock(
  key: BlockKey,
  data: BlockData,
  updatedBy: string
): Promise<void> {
  await connectDB();
  await SiteContentModel.updateOne(
    { key },
    { $set: { data, updatedBy } },
    { upsert: true }
  ).exec();
}

/**
 * Removes a section's document, which puts the page back on the built-in copy.
 *
 * The undo for an edit somebody regrets: rather than retyping the original from
 * memory, delete the override and the static fallback renders again.
 */
export async function resetBlock(key: BlockKey): Promise<void> {
  await connectDB();
  await SiteContentModel.deleteOne({ key }).exec();
}
