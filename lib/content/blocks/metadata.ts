import "server-only";

import type { Metadata } from "next";

import { getBlock } from "@/lib/content/blocks/source";
import { getSiteSettings } from "@/lib/content/blocks/site";
import type { BlockRecord } from "@/lib/content/blocks/schema";

/**
 * A page's title and description, read from the editable content.
 *
 * Every page exported a static `metadata` object, which meant the one thing a
 * search result actually shows was the one thing that needed a deploy to
 * change. These become `generateMetadata` instead, which Next runs per request
 * and which can therefore read a database.
 *
 * Blog posts and project pages are deliberately not here: they already write
 * their own from the post's title and hook, and a stored override would be one
 * more thing to keep in step with the article.
 *
 * The site name is appended by the template in `app/layout.tsx`, so a title
 * here is the page's own part and not the whole string.
 */
export function pageMetadata(entry: string): () => Promise<Metadata> {
  return async () => {
    const [block, site] = await Promise.all([getBlock("seo"), getSiteSettings()]);
    const pages = (block.pages ?? {}) as Record<string, BlockRecord>;
    const page = pages[entry] ?? {};

    /* `||` rather than `??`, so a field edited down to nothing falls back to
       the site description instead of publishing an empty one. */
    const title = (page.title as string) || site.name;
    const description = (page.description as string) || site.description;

    return {
      title,
      description,
      openGraph: { title: `${title} · ${site.name}`, description },
      twitter: { title: `${title} · ${site.name}`, description },
    };
  };
}
