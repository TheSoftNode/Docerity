"use server";

import { revalidatePath } from "next/cache";

import { requireUserOrThrow } from "@/lib/auth/dal";
import { isAppError, ValidationError } from "@/lib/core/errors";
import { createLogger } from "@/lib/core/logger";
import { estimateReadTime } from "@/lib/db/models/post.model";
import {
  cleanSections,
  cleanTags,
  slugify,
  validatePost,
  type PostFieldErrors,
  type PostInput,
  type PostStatus,
} from "@/lib/content/post-schema";
import {
  createPost,
  deletePost,
  importPosts,
  isSlugTaken,
  setPostStatus,
  updatePost,
} from "@/lib/repositories/post.repository";
import { entries as staticEntries } from "@/components/sections/blog/blog-data";
import { CONTENT_ICONS, type ContentIconName } from "@/lib/content/icons";

/**
 * Writing, publishing and importing posts.
 *
 * Every action starts with `requireUserOrThrow`. Rendering the editor behind a
 * session check is not a boundary: these are POST endpoints against the page's
 * URL, reachable without the page ever being loaded.
 */

const logger = createLogger("admin.posts");

export type SaveResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; errors: PostFieldErrors };

/**
 * Invalidates every path a post appears on.
 *
 * All four, because a post is on the index, its own page, the feed and the
 * sitemap, and each has its own `revalidate` window. Missing one leaves it
 * showing the previous version for up to five minutes, which reads as the save
 * not having worked.
 */
function revalidatePost(slug: string) {
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/blog/rss.xml");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/posts");
}

/** Narrows an icon name from the form against the registry. */
function iconName(value: string, fallback: ContentIconName): ContentIconName {
  return value in CONTENT_ICONS ? (value as ContentIconName) : fallback;
}

/**
 * Normalises what the editor submitted.
 *
 * The slug is derived from the title when it is left blank, which is the common
 * case: nobody wants to type a URL twice.
 */
function normalise(input: PostInput): PostInput {
  const body = cleanSections(input.body);

  return {
    ...input,
    slug: slugify(input.slug || input.title),
    title: input.title.trim(),
    hook: input.hook.trim(),
    tags: cleanTags(input.tags),
    body,
    /* Filled in when left blank so a published post always shows one, but never
       overwritten: an author who typed "12 min read" meant it. */
    readTime: input.readTime.trim() || estimateReadTime(body),
    concept: input.concept
      ? {
          ...input.concept,
          label: input.concept.label.trim(),
          caption: input.concept.caption.trim(),
          iconName: iconName(input.concept.iconName, "ZapIcon"),
        }
      : null,
    analogy: input.analogy
      ? {
          ...input.analogy,
          label: input.analogy.label.trim(),
          caption: input.analogy.caption.trim(),
          iconName: iconName(input.analogy.iconName, "StickyNoteIcon"),
        }
      : null,
    topic: input.topic.trim(),
    iconName: input.iconName ? iconName(input.iconName, "PenLineIcon") : "",
  };
}

export async function savePost(
  input: PostInput,
  existingId?: string
): Promise<SaveResult> {
  try {
    const user = await requireUserOrThrow();
    const post = normalise(input);

    const errors = validatePost(post);

    /*
      The uniqueness check runs only once the slug itself is valid, so a blank
      slug reports "a slug is required" rather than also querying for "" and
      reporting it as taken.
    */
    if (!errors.slug && (await isSlugTaken(post.slug, existingId))) {
      errors.slug = `"${post.slug}" is already used by another post.`;
    }

    if (Object.keys(errors).length > 0) return { ok: false, errors };

    const saved = existingId
      ? await updatePost(existingId, post, user.email)
      : await createPost(post, user.email);

    if (!saved) {
      return { ok: false, errors: { form: "That post no longer exists." } };
    }

    revalidatePost(saved.slug);
    logger.info(existingId ? "post updated" : "post created", {
      id: saved.id,
      slug: saved.slug,
      status: post.status,
      by: user.email,
    });

    return { ok: true, id: saved.id, slug: saved.slug };
  } catch (error) {
    if (error instanceof ValidationError) {
      return { ok: false, errors: (error.fields as PostFieldErrors) ?? { form: error.publicMessage } };
    }
    if (isAppError(error)) return { ok: false, errors: { form: error.publicMessage } };

    /*
      A duplicate key can still arrive despite the check above, when two saves
      race. Reported against the field rather than as an internal error, because
      it is the same problem with the same fix.
    */
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return { ok: false, errors: { slug: "That slug was just taken. Try another." } };
    }

    logger.error("saving a post failed", error);
    return { ok: false, errors: { form: "That did not save. Please try again." } };
  }
}

export type SimpleResult = { ok: true } | { ok: false; message: string };

export async function changePostStatus(
  id: string,
  status: PostStatus
): Promise<SimpleResult> {
  try {
    const user = await requireUserOrThrow();
    const updated = await setPostStatus(id, status, user.email);
    if (!updated) return { ok: false, message: "That post no longer exists." };

    revalidatePost(updated.slug);
    logger.info("post status changed", { id, status, by: user.email });
    return { ok: true };
  } catch (error) {
    if (isAppError(error)) return { ok: false, message: error.publicMessage };
    logger.error("changing post status failed", error);
    return { ok: false, message: "That did not work. Please try again." };
  }
}

export async function removePost(id: string): Promise<SimpleResult> {
  try {
    const user = await requireUserOrThrow();
    const deleted = await deletePost(id);
    if (!deleted) return { ok: false, message: "That post no longer exists." };

    revalidatePost(deleted.slug);
    logger.info("post deleted", { id, slug: deleted.slug, by: user.email });
    return { ok: true };
  } catch (error) {
    if (isAppError(error)) return { ok: false, message: error.publicMessage };
    logger.error("deleting a post failed", error);
    return { ok: false, message: "That did not work. Please try again." };
  }
}

/**
 * Moves the posts that ship in `blog-data.ts` into the database.
 *
 * A one-time action rather than a migration script, because it needs the
 * TypeScript module, the path alias and the model, all of which a bare `node`
 * process would have to be taught. Idempotent: existing slugs are skipped, so
 * pressing it twice imports nothing.
 *
 * `blog-data.ts` stays where it is afterwards. It is the fallback when the
 * database is unreachable, not a fixture to be deleted once this has run.
 */
export async function importBuiltInPosts(): Promise<
  { ok: true; imported: number; skipped: number } | { ok: false; message: string }
> {
  try {
    const user = await requireUserOrThrow();

    /*
      The static entries hold icon *components*; a document stores a name. The
      map is inverted by identity here, so an icon added to a post in
      `blog-data.ts` that is missing from the registry falls back rather than
      importing an unusable name.
    */
    const nameOf = (Icon: unknown): ContentIconName => {
      const match = Object.entries(CONTENT_ICONS).find(([, candidate]) => candidate === Icon);
      return (match?.[0] as ContentIconName) ?? "FileTextIcon";
    };

    const payload = staticEntries.map((entry) => ({
      type: entry.type,
      slug: entry.slug,
      title: entry.title,
      hook: entry.hook,
      readTime: entry.readTime,
      tags: [...entry.tags],
      status: "published" as const,
      publishedAt: entry.publishedAt,
      body: entry.body.map((section) => ({
        heading: section.heading,
        paragraphs: [...section.paragraphs],
        sidenote: section.sidenote ?? "",
        media: section.media
          ? {
              type: section.media.type,
              alt: section.media.type === "image" ? section.media.alt : "",
              caption: section.media.caption ?? "",
            }
          : null,
      })),
      concept:
        entry.type === "explainer"
          ? {
              label: entry.concept.label,
              caption: entry.concept.caption,
              iconName: nameOf(entry.concept.Icon),
            }
          : null,
      analogy:
        entry.type === "explainer"
          ? {
              label: entry.analogy.label,
              caption: entry.analogy.caption,
              iconName: nameOf(entry.analogy.Icon),
            }
          : null,
      topic: entry.type === "article" ? entry.topic : "",
      iconName: entry.type === "article" ? nameOf(entry.Icon) : "",
    }));

    const result = await importPosts(payload, user.email);

    revalidatePath("/blog");
    revalidatePath("/admin/posts");
    logger.info("built-in posts imported", {
      imported: result.imported.length,
      skipped: result.skipped.length,
      by: user.email,
    });

    return { ok: true, imported: result.imported.length, skipped: result.skipped.length };
  } catch (error) {
    if (isAppError(error)) return { ok: false, message: error.publicMessage };
    logger.error("importing the built-in posts failed", error);
    return { ok: false, message: "The import did not finish. Please try again." };
  }
}
