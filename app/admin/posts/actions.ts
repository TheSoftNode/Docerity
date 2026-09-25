"use server";

import { revalidatePath } from "next/cache";

import { requireStaffOrThrow, requireUserOrThrow, type AdminUser } from "@/lib/auth/dal";
import { can } from "@/lib/auth/permissions";
import { ForbiddenError, isAppError, NotFoundError, ValidationError } from "@/lib/core/errors";
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
  findPostById,
  importPosts,
  isSlugTaken,
  setPostStatus,
  updatePost,
  type LeanPost,
} from "@/lib/repositories/post.repository";
import { entries as staticEntries } from "@/components/sections/blog/blog-data";
import { CONTENT_ICONS, type ContentIconName } from "@/lib/content/icons";

/**
 * Writing, submitting, publishing and importing posts.
 *
 * Every action starts with a guard. Rendering the editor behind a session check
 * is not a boundary: these are POST endpoints against the page's URL, reachable
 * without the page ever being loaded. The contributor rules in particular have
 * to live here, because hiding a Publish button does not stop anybody from
 * invoking the action that button would have called.
 */

const logger = createLogger("admin.posts");

export type SaveResult =
  | { ok: true; id: string; slug: string; status: PostStatus }
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
 * Whether this person may touch this post at all.
 *
 * Staff may touch any. A contributor may touch only their own, and the check is
 * on the stored `authorId` rather than on anything the client sent, so knowing
 * another post's id gets you nothing.
 *
 * A `NotFoundError` rather than a `ForbiddenError` for somebody else's post: a
 * 403 confirms the id exists, which turns the editor into a way of probing for
 * valid ids.
 */
function assertMayEdit(post: LeanPost | null, user: AdminUser): LeanPost {
  if (!post) throw new NotFoundError("That post no longer exists.");

  if (!can.seeAllPosts(user.role) && String(post.authorId ?? "") !== user.id) {
    throw new NotFoundError("That post no longer exists.");
  }

  /*
    A contributor cannot edit their own post once it is live either. Otherwise
    "cannot publish" is decorative: submit something harmless, wait for it to be
    approved, then rewrite the body in place.
  */
  if (!can.publishPosts(user.role) && post.status === "published") {
    throw new ForbiddenError(
      "This one is live, so it can only be changed by an editor. Send me a note about what needs fixing."
    );
  }

  return post;
}

/**
 * Clamps a requested status to what this role is allowed to set.
 *
 * Returns the status rather than throwing for the ordinary case, because the UI
 * never offers a contributor the Publish button; reaching here with
 * `published` means the action was called directly, and that is worth refusing
 * loudly rather than silently downgrading.
 */
function assertMaySetStatus(status: PostStatus, user: AdminUser): PostStatus {
  if (status === "published" && !can.publishPosts(user.role)) {
    throw new ForbiddenError(
      "Contributors submit posts for review rather than publishing them."
    );
  }
  return status;
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

    assertMaySetStatus(post.status, user);

    /* Loaded before anything is written, so ownership is checked against the
       stored document rather than against the id the client chose to send. */
    const existing = existingId
      ? assertMayEdit(await findPostById(existingId), user)
      : null;

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

    const saved = existing
      ? await updatePost(existingId!, post, user.email)
      : await createPost(post, user.email, {
          id: user.id,
          /*
            A byline only for a contributor. The site is already in the owner's
            voice, so signing his own posts would be odd, and an editor is
            usually publishing on his behalf.
          */
          byline: can.publishPosts(user.role)
            ? null
            : { name: user.name, title: "", link: "", mentee: true },
        });

    if (!saved) {
      return { ok: false, errors: { form: "That post no longer exists." } };
    }

    revalidatePost(saved.slug);
    logger.info(existingId ? "post updated" : "post created", {
      id: saved.id,
      slug: saved.slug,
      status: post.status,
      by: user.email,
      role: user.role,
    });

    return { ok: true, id: saved.id, slug: saved.slug, status: post.status };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        ok: false,
        errors: (error.fields as PostFieldErrors) ?? { form: error.publicMessage },
      };
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
    assertMaySetStatus(status, user);

    const existing = assertMayEdit(await findPostById(id), user);

    /*
      A contributor may move their own post between draft and submitted, and
      nothing else. Withdrawing a submission is deliberately allowed: somebody
      who spots a mistake after sending should be able to pull it back rather
      than having to ask.
    */
    if (!can.publishPosts(user.role) && status !== "draft" && status !== "submitted") {
      throw new ForbiddenError("Contributors can only draft and submit.");
    }

    const updated = await setPostStatus(id, status, user.email);
    if (!updated) return { ok: false, message: "That post no longer exists." };

    revalidatePost(updated.slug);
    logger.info("post status changed", {
      id,
      from: existing.status,
      to: status,
      by: user.email,
    });
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
    const existing = assertMayEdit(await findPostById(id), user);

    /* `assertMayEdit` already refuses a contributor a published post, so this
       only catches the case of an editor deleting live content, which is
       theirs to do. Logged with the status so the record says what was lost. */
    const deleted = await deletePost(id);
    if (!deleted) return { ok: false, message: "That post no longer exists." };

    revalidatePost(deleted.slug);
    logger.info("post deleted", {
      id,
      slug: deleted.slug,
      status: existing.status,
      by: user.email,
    });
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
 * Staff only. It publishes eight posts in one press, which is precisely what a
 * contributor may not do.
 */
export async function importBuiltInPosts(): Promise<
  { ok: true; imported: number; skipped: number } | { ok: false; message: string }
> {
  try {
    const user = await requireStaffOrThrow();

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
