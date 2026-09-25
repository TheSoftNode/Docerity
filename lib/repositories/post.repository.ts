import { connectDB } from "@/lib/db/connect";
import { PostModel, type PostDocument } from "@/lib/db/models/post.model";
import type { PostInput, PostStatus } from "@/lib/content/post-schema";

/**
 * Post persistence.
 *
 * `listPublished` is the only read path the public site uses, and it filters on
 * status. Same rule as reviews: the gate is here rather than in a caller, so a
 * new page cannot accidentally render drafts by forgetting a `where`.
 */

export type LeanPost = PostDocument & { _id: unknown; createdAt: Date; updatedAt: Date };

/** Published only, newest first, matching the partial index. */
export async function listPublishedPosts(): Promise<LeanPost[]> {
  await connectDB();
  return PostModel.find({ status: "published" })
    .sort({ publishedAt: -1 })
    .lean<LeanPost[]>();
}

export async function findPublishedBySlug(slug: string): Promise<LeanPost | null> {
  await connectDB();
  return PostModel.findOne({ slug: slug.toLowerCase(), status: "published" }).lean<LeanPost>();
}

/**
 * Everything, drafts included. Only ever called behind the session check.
 *
 * `authorId` scopes the list to one person's work. That parameter is the access
 * rule for contributors, not a convenience: a contributor's page passes their
 * own id, so another writer's draft is not merely hidden from the list, it is
 * never fetched.
 */
export async function listAllPosts(authorId?: string): Promise<LeanPost[]> {
  await connectDB();
  return PostModel.find(authorId ? { authorId } : {})
    .sort({ updatedAt: -1 })
    .lean<LeanPost[]>();
}

export async function findPostById(id: string): Promise<LeanPost | null> {
  await connectDB();
  return PostModel.findById(id).lean<LeanPost>();
}

/**
 * Posts waiting for a decision, oldest first.
 *
 * Oldest first on purpose: a submission queue ordered newest first buries the
 * thing that has been waiting longest, which is the one that needs answering.
 */
export async function listSubmittedPosts(): Promise<LeanPost[]> {
  await connectDB();
  return PostModel.find({ status: "submitted" })
    .sort({ submittedAt: 1 })
    .lean<LeanPost[]>();
}

export async function countPostsByStatus(authorId?: string) {
  await connectDB();
  const scope = authorId ? { authorId } : {};

  const [draft, submitted, published] = await Promise.all([
    PostModel.countDocuments({ ...scope, status: "draft" }),
    PostModel.countDocuments({ ...scope, status: "submitted" }),
    PostModel.countDocuments({ ...scope, status: "published" }),
  ]);

  return { draft, submitted, published, total: draft + submitted + published };
}

/**
 * Is this slug already taken by a different post?
 *
 * Checked before a save so the editor can report it against the field, rather
 * than letting the unique index reject the write and surfacing a Mongo
 * duplicate-key error. `excludeId` is what makes saving an existing post
 * without changing its slug work.
 */
export async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  await connectDB();
  const existing = await PostModel.findOne({ slug: slug.toLowerCase() })
    .select("_id")
    .lean();
  if (!existing) return false;
  return !excludeId || String(existing._id) !== excludeId;
}

export type PostAuthor = {
  name: string;
  title: string;
  link: string;
  mentee: boolean;
};

function toDocument(input: PostInput, updatedBy: string) {
  return {
    type: input.type,
    slug: input.slug.trim().toLowerCase(),
    title: input.title.trim(),
    hook: input.hook.trim(),
    readTime: input.readTime.trim(),
    tags: input.tags,
    status: input.status,
    body: input.body,
    /* Null rather than the empty objects an explainer-shaped form would send
       for an article, so the type discriminator stays meaningful. */
    concept: input.type === "explainer" ? input.concept : null,
    analogy: input.type === "explainer" ? input.analogy : null,
    topic: input.type === "article" ? input.topic.trim() : "",
    iconName: input.type === "article" ? input.iconName : "",
    updatedBy,
  };
}

/**
 * `publishedAt` is resolved here rather than taken from the form.
 *
 * The rule: an explicit date wins, otherwise publishing stamps now and keeps
 * whatever was there on a later save. Without the last part, editing a typo in
 * a two-year-old post would move it to the top of the index.
 */
function resolvePublishedAt(
  input: PostInput,
  existing: Date | null | undefined
): Date | null {
  if (input.publishedAt) return new Date(input.publishedAt);
  if (input.status !== "published") return existing ?? null;
  return existing ?? new Date();
}

export async function createPost(
  input: PostInput,
  updatedBy: string,
  /* Set once, at creation. A post does not change hands afterwards, and
     reassigning one would rewrite who it belongs to under somebody's feet. */
  author?: { id: string; byline: PostAuthor | null }
) {
  await connectDB();
  const created = await PostModel.create({
    ...toDocument(input, updatedBy),
    authorId: author?.id ?? "",
    author: author?.byline ?? null,
    publishedAt: resolvePublishedAt(input, null),
    submittedAt: input.status === "submitted" ? new Date() : null,
  });
  return { id: String(created._id), slug: created.slug };
}

export async function updatePost(id: string, input: PostInput, updatedBy: string) {
  await connectDB();

  /* `status` as well as `publishedAt`: the submitted stamp below compares
     against the status the post is moving *from*. */
  const existing = await PostModel.findById(id).select("publishedAt status").lean();
  if (!existing) return null;

  const updated = await PostModel.findByIdAndUpdate(
    id,
    {
      $set: {
        ...toDocument(input, updatedBy),
        publishedAt: resolvePublishedAt(input, existing.publishedAt),
        /* Stamped on the transition into `submitted` and left alone otherwise,
           so editing a submitted post does not move it to the back of the
           queue it is already waiting in. */
        ...(input.status === "submitted" && existing.status !== "submitted"
          ? { submittedAt: new Date() }
          : {}),
      },
    },
    { new: true, runValidators: true }
  )
    .select("slug")
    .lean();

  return updated ? { id, slug: updated.slug } : null;
}

/** Replaces the stored byline, for an editor correcting a contributor's. */
export async function setPostAuthor(id: string, byline: PostAuthor | null) {
  await connectDB();
  const result = await PostModel.updateOne({ _id: id }, { $set: { author: byline } });
  return result.matchedCount > 0;
}

/**
 * Publish and unpublish, without going through the whole form.
 *
 * A separate path because the list view offers it as one click, and running the
 * full document through validation to flip one field would reject any post whose
 * body is mid-edit.
 */
export async function setPostStatus(id: string, status: PostStatus, updatedBy: string) {
  await connectDB();

  const existing = await PostModel.findById(id).select("publishedAt status").lean();
  if (!existing) return null;

  const updated = await PostModel.findByIdAndUpdate(
    id,
    {
      $set: {
        status,
        updatedBy,
        ...(status === "submitted" && existing.status !== "submitted"
          ? { submittedAt: new Date() }
          : {}),
        /* First publish stamps the date; unpublishing leaves it, so
           republishing does not move the post to the top of the index. */
        publishedAt:
          status === "published" ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
      },
    },
    { new: true }
  )
    .select("slug status")
    .lean();

  return updated ? { slug: updated.slug, status: updated.status } : null;
}

export async function deletePost(id: string) {
  await connectDB();
  const deleted = await PostModel.findByIdAndDelete(id).select("slug").lean();
  return deleted ? { slug: deleted.slug } : null;
}

/**
 * Inserts posts that are not already present, and reports what it skipped.
 *
 * Used once, to move the eight posts that live in `blog-data.ts` into the
 * database. `insertMany` with `ordered: false` would half-apply on a duplicate,
 * so existing slugs are filtered out first and the whole thing is idempotent:
 * running it twice imports nothing the second time.
 */
export async function importPosts(
  posts: (PostInput & { publishedAt: string })[],
  updatedBy: string
): Promise<{ imported: string[]; skipped: string[] }> {
  await connectDB();

  const slugs = posts.map((post) => post.slug.toLowerCase());
  const existing = await PostModel.find({ slug: { $in: slugs } }).select("slug").lean();
  const taken = new Set(existing.map((row) => row.slug));

  const fresh = posts.filter((post) => !taken.has(post.slug.toLowerCase()));

  if (fresh.length > 0) {
    await PostModel.insertMany(
      fresh.map((post) => ({
        ...toDocument(post, updatedBy),
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : new Date(),
      }))
    );
  }

  return {
    imported: fresh.map((post) => post.slug),
    skipped: [...taken],
  };
}
