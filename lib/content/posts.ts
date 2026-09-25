import "server-only";

import { database } from "@/lib/config/env";
import { createLogger } from "@/lib/core/logger";
import { iconFor } from "@/lib/content/icons";
import {
  findPublishedBySlug,
  listPublishedPosts,
  type LeanPost,
} from "@/lib/repositories/post.repository";
import {
  entries as staticEntries,
  type ArticlePost,
  type BlogEntry,
  type ExplainerPost,
} from "@/components/sections/blog/blog-data";

/**
 * Where the blog's content comes from.
 *
 * The database when there is one, and `blog-data.ts` when there is not. That
 * fallback is not a placeholder: it is what keeps the blog rendering on a fresh
 * clone with no MONGODB_URI, keeps the e2e suite passing without a database, and
 * keeps eight published posts online if Atlas is unreachable during a deploy.
 *
 * Everything here returns the `BlogEntry` shape the existing components already
 * render, so nothing downstream had to change to become database-backed. The one
 * translation that matters is the icon: a document stores a name and this maps
 * it back to a component, because a React component cannot round-trip through
 * MongoDB.
 */

const logger = createLogger("content.posts");

function toEntry(post: LeanPost): BlogEntry {
  const base = {
    slug: post.slug,
    title: post.title,
    hook: post.hook,
    readTime: post.readTime || "",
    /* Date-only, matching the static entries, which the article template
       formats. `toISOString().slice(0, 10)` rather than `toLocaleDateString`:
       a locale-formatted string here would render differently on the server
       and in the browser and produce a hydration mismatch. */
    publishedAt: (post.publishedAt ?? post.createdAt).toISOString().slice(0, 10),
    tags: post.tags ?? [],
    /* Only when there is a name. Every post the owner wrote has none, because
       the site is already in his voice and signing each one would be odd. */
    ...(post.author?.name
      ? {
          author: {
            name: post.author.name,
            title: post.author.title ?? "",
            link: post.author.link ?? "",
            mentee: Boolean(post.author.mentee),
          },
        }
      : {}),
    body: (post.body ?? []).map((section) => ({
      heading: section.heading,
      paragraphs: section.paragraphs ?? [],
      /* Omitted rather than empty: the template checks for the property's
         presence, and an empty string would render an empty aside. */
      ...(section.sidenote ? { sidenote: section.sidenote } : {}),
      ...(section.media
        ? {
            media:
              section.media.type === "video"
                ? ({ type: "video", caption: section.media.caption || undefined } as const)
                : ({
                    type: "image",
                    alt: section.media.alt,
                    caption: section.media.caption || undefined,
                  } as const),
          }
        : {}),
    })),
  };

  if (post.type === "explainer") {
    return {
      ...base,
      type: "explainer",
      concept: {
        label: post.concept?.label ?? "",
        caption: post.concept?.caption ?? "",
        Icon: iconFor(post.concept?.iconName),
      },
      analogy: {
        label: post.analogy?.label ?? "",
        caption: post.analogy?.caption ?? "",
        Icon: iconFor(post.analogy?.iconName),
      },
    } satisfies ExplainerPost;
  }

  return {
    ...base,
    type: "article",
    topic: post.topic ?? "",
    Icon: iconFor(post.iconName),
  } satisfies ArticlePost;
}

/**
 * Every published post, newest first.
 *
 * An empty database falls back to the static set rather than returning nothing.
 * The alternative is that connecting Atlas for the first time silently empties
 * a blog that was working a minute earlier, which would look like data loss.
 * Once a post exists in the database, the database is the only source.
 */
export async function getPublishedEntries(): Promise<BlogEntry[]> {
  if (!database.isConfigured) return staticEntries;

  try {
    const posts = await listPublishedPosts();
    if (posts.length === 0) return staticEntries;
    return posts.map(toEntry);
  } catch (error) {
    logger.error("could not load posts, falling back to the built-in set", error);
    return staticEntries;
  }
}

/**
 * One post by slug.
 *
 * Queried directly rather than filtering `getPublishedEntries()`, so a post page
 * fetches one document instead of the whole collection. It falls back to the
 * static set on both a miss and a failure, which is what lets the eight original
 * URLs keep working before anything has been imported.
 */
export async function getEntry(slug: string): Promise<BlogEntry | undefined> {
  const fromStatic = () => staticEntries.find((entry) => entry.slug === slug);

  if (!database.isConfigured) return fromStatic();

  try {
    const post = await findPublishedBySlug(slug);
    return post ? toEntry(post) : fromStatic();
  } catch (error) {
    logger.error("could not load a post, falling back to the built-in set", error, { slug });
    return fromStatic();
  }
}

/**
 * Slugs for `generateStaticParams`.
 *
 * Both sets, deduplicated. A build with a database prerenders what is in it; the
 * static slugs are kept so an import that has not happened yet, or a build that
 * cannot reach Atlas, still produces the eight pages rather than 404s. Anything
 * published later is served on demand and cached by the route's revalidate.
 */
export async function getEntrySlugs(): Promise<string[]> {
  const slugs = new Set(staticEntries.map((entry) => entry.slug));

  if (database.isConfigured) {
    try {
      for (const post of await listPublishedPosts()) slugs.add(post.slug);
    } catch (error) {
      logger.error("could not list post slugs for prerendering", error);
    }
  }

  return [...slugs];
}
