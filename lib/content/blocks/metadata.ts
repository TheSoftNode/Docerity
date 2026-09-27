import "server-only";

import type { Metadata } from "next";

import { getBlock } from "@/lib/content/blocks/source";
import { getSiteSettings, type SiteSettings } from "@/lib/content/blocks/site";
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
export async function readPageMeta(
  entry: string
): Promise<{ title: string; description: string; site: SiteSettings }> {
  const [block, site] = await Promise.all([getBlock("seo"), getSiteSettings()]);
  const pages = (block.pages ?? {}) as Record<string, BlockRecord>;
  const page = pages[entry] ?? {};

  /* `||` rather than `??`, so a field edited down to nothing falls back to the
     site's own copy instead of publishing an empty title. */
  return {
    title: (page.title as string) || site.name,
    description: (page.description as string) || site.description,
    site,
  };
}

export function pageMetadata(
  entry: string,
  /** The canonical path, for the social card's `url`. Omitted where it adds
      nothing: Next resolves relative URLs against `metadataBase` anyway. */
  path?: string
): () => Promise<Metadata> {
  return async () => {
    const { title, description, site } = await readPageMeta(entry);

    return {
      title,
      description,
      openGraph: {
        type: "website",
        title: `${title} · ${site.name}`,
        description,
        ...(path ? { url: `${site.url}${path}` } : {}),
      },
      twitter: { title: `${title} · ${site.name}`, description },
    };
  };
}
