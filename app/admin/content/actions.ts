"use server";

import { revalidatePath } from "next/cache";

import { requireStaffOrThrow } from "@/lib/auth/dal";
import { isAppError } from "@/lib/core/errors";
import { createLogger } from "@/lib/core/logger";
import { cleanBlock, validateBlock, type BlockErrors } from "@/lib/content/blocks/clean";
import { DEFAULTS } from "@/lib/content/blocks/defaults";
import { blockFor, isBlockKey, type BlockData, type BlockKey } from "@/lib/content/blocks/schema";
import { resetBlock, saveBlock } from "@/lib/repositories/site-content.repository";

/**
 * Saving and resetting an editable page section.
 *
 * Staff only, checked here rather than only in the page that renders the form.
 * These are POST endpoints against the page's URL and are reachable without the
 * page ever being loaded, so hiding the editor from a contributor's navigation
 * is presentation, not a boundary.
 */

const logger = createLogger("admin.content");

export type BlockResult =
  | { ok: true; data: BlockData }
  | { ok: false; message: string; errors?: BlockErrors };

/**
 * Invalidates every page a section appears on, so an edit is live rather than
 * live in five minutes.
 *
 * Two sections appear on all of them. The site settings are the header, the
 * footer and the address, and the titles and descriptions are per page by
 * definition; for those, `revalidatePath("/", "layout")` invalidates the root
 * layout and everything beneath it, which is the only way to reach pages the
 * editor does not enumerate.
 *
 * That was the bug this replaced: saving a new footer link revalidated `/` and
 * nothing else, so the link appeared on the homepage and nowhere else until
 * each other page's own five-minute window expired. It looked like the save
 * had not worked.
 *
 * Everything else is listed, because invalidating the whole site to change one
 * heading on /web3 would throw away every other page's cache for nothing.
 */
function revalidateFor(key: BlockKey): void {
  if (key === "site" || key === "seo") {
    revalidatePath("/", "layout");
    /* Not covered by the layout sweep: both are route handlers rather than
       pages, and both embed the site name and URL. */
    revalidatePath("/sitemap.xml");
    revalidatePath("/blog/rss.xml");
    return;
  }

  const paths = new Set<string>([blockFor(key).path]);

  /* The homepage carries the client logos, the explainer band and the
     mentorship teaser alongside their own pages. */
  if (key === "clients" || key === "explainers" || key === "mentorship") paths.add("/");

  for (const path of paths) revalidatePath(path);
}

export async function saveContentBlock(key: string, input: unknown): Promise<BlockResult> {
  try {
    const user = await requireStaffOrThrow();

    if (!isBlockKey(key)) {
      return { ok: false, message: "That section does not exist." };
    }

    /* Rebuilt from the field description rather than trusted: the argument is
       whatever was posted, and a field the description does not mention cannot
       survive this. */
    const data = cleanBlock(key, input);
    const errors = validateBlock(key, data);

    if (Object.keys(errors).length > 0) {
      return { ok: false, message: "Some details need correcting.", errors };
    }

    await saveBlock(key, data, user.email);

    revalidateFor(key);

    logger.info("content block saved", { key, by: user.email });

    return { ok: true, data };
  } catch (error) {
    if (isAppError(error)) return { ok: false, message: error.message };
    logger.error("could not save a content block", error, { key });
    return { ok: false, message: "That could not be saved. Please try again." };
  }
}

/**
 * Removes the stored version, so the copy built into the site renders again.
 *
 * The undo for an edit somebody regrets. Retyping the original from memory is
 * not an undo, and without this the only way back would be a deploy.
 */
export async function resetContentBlock(key: string): Promise<BlockResult> {
  try {
    const user = await requireStaffOrThrow();

    if (!isBlockKey(key)) {
      return { ok: false, message: "That section does not exist." };
    }

    await resetBlock(key);

    revalidateFor(key);

    logger.info("content block reset", { key, by: user.email });

    return { ok: true, data: DEFAULTS[key] };
  } catch (error) {
    if (isAppError(error)) return { ok: false, message: error.message };
    logger.error("could not reset a content block", error, { key });
    return { ok: false, message: "That could not be reset. Please try again." };
  }
}
