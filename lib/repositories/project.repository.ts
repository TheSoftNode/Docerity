import { connectDB } from "@/lib/db/connect";
import { ProjectModel, type ProjectDocument } from "@/lib/db/models/project.model";
import type { ProjectInput } from "@/lib/content/project-schema";

/**
 * Project persistence.
 *
 * `listPublishedProjects` is the only read path the public site uses and it
 * filters on `published`. Same rule as posts and reviews: the gate lives here
 * rather than in a caller, so a new page cannot expose drafts by forgetting a
 * condition.
 */

export type LeanProject = ProjectDocument & {
  _id: unknown;
  createdAt: Date;
  updatedAt: Date;
};

/** Published only, in display order. */
export async function listPublishedProjects(): Promise<LeanProject[]> {
  await connectDB();
  return ProjectModel.find({ published: true })
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean<LeanProject[]>();
}

export async function findPublishedProjectBySlug(
  slug: string
): Promise<LeanProject | null> {
  await connectDB();
  return ProjectModel.findOne({
    slug: slug.toLowerCase(),
    published: true,
  }).lean<LeanProject>();
}

/** Everything, drafts included. Only ever called behind the session check. */
export async function listAllProjects(): Promise<LeanProject[]> {
  await connectDB();
  return ProjectModel.find()
    .sort({ sortOrder: 1, createdAt: -1 })
    .lean<LeanProject[]>();
}

export async function findProjectById(id: string): Promise<LeanProject | null> {
  await connectDB();
  return ProjectModel.findById(id).lean<LeanProject>();
}

export async function countProjectsByState() {
  await connectDB();
  const [draft, published, featured] = await Promise.all([
    ProjectModel.countDocuments({ published: false }),
    ProjectModel.countDocuments({ published: true }),
    ProjectModel.countDocuments({ published: true, featured: true }),
  ]);
  return { draft, published, featured, total: draft + published };
}

/**
 * Checked before a save so the editor can report a clash against the field,
 * rather than letting the unique index reject the write and surfacing a Mongo
 * duplicate-key error.
 */
export async function isProjectSlugTaken(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  await connectDB();
  const existing = await ProjectModel.findOne({ slug: slug.toLowerCase() })
    .select("_id")
    .lean();
  if (!existing) return false;
  return !excludeId || String(existing._id) !== excludeId;
}

function toDocument(input: ProjectInput, updatedBy: string) {
  return {
    slug: input.slug.trim().toLowerCase(),
    name: input.name.trim(),
    category: input.category.trim(),
    groups: input.groups,
    description: input.description.trim(),
    tags: input.tags,
    status: input.status,
    preview: input.preview,
    liveUrl: input.liveUrl.trim(),
    repoUrl: input.repoUrl.trim(),
    /* Null rather than an empty object, so "has a screenshot" is one check
       rather than three. */
    media:
      input.media && (input.media.publicId || input.media.src) ? input.media : null,
    featured: input.featured,
    published: input.published,
    sortOrder: input.sortOrder,
    role: input.role.trim(),
    timeline: input.timeline.trim(),
    results: input.results,
    body: input.body,
    updatedBy,
  };
}

export async function createProject(input: ProjectInput, updatedBy: string) {
  await connectDB();

  /*
    A new project goes to the end unless it was given a position. Without this
    every new row would land at sortOrder 0 and share first place with whatever
    is already there, and the grid's order would depend on creation time
    breaking the tie.
  */
  const sortOrder =
    input.sortOrder || (await ProjectModel.countDocuments()) + 1;

  const created = await ProjectModel.create({
    ...toDocument(input, updatedBy),
    sortOrder,
  });
  return { id: String(created._id), slug: created.slug };
}

export async function updateProject(
  id: string,
  input: ProjectInput,
  updatedBy: string
) {
  await connectDB();
  const updated = await ProjectModel.findByIdAndUpdate(
    id,
    { $set: toDocument(input, updatedBy) },
    { new: true, runValidators: true }
  )
    .select("slug")
    .lean();

  return updated ? { id, slug: updated.slug } : null;
}

/**
 * Publish, unpublish and feature, without going through the whole form.
 *
 * A separate path because the list offers these as one click, and running the
 * full document through validation to flip one flag would reject any project
 * whose description is mid-edit.
 */
export async function setProjectFlags(
  id: string,
  flags: { published?: boolean; featured?: boolean },
  updatedBy: string
) {
  await connectDB();
  const updated = await ProjectModel.findByIdAndUpdate(
    id,
    { $set: { ...flags, updatedBy } },
    { new: true }
  )
    .select("slug published featured")
    .lean();

  return updated ? { slug: updated.slug } : null;
}

/**
 * Moves a project one place up or down by swapping `sortOrder` with its
 * neighbour.
 *
 * A swap rather than rewriting every row: reordering is the common edit on this
 * list, and renumbering twenty-five documents to move one is a lot of writes
 * for a single drag.
 */
export async function moveProject(id: string, direction: -1 | 1) {
  await connectDB();

  const all = await ProjectModel.find()
    .sort({ sortOrder: 1, createdAt: -1 })
    .select("_id sortOrder")
    .lean();

  const index = all.findIndex((p) => String(p._id) === id);
  if (index === -1) return false;

  const target = index + direction;
  if (target < 0 || target >= all.length) return false;

  const a = all[index];
  const b = all[target];

  /* Positions rather than the stored values: imported rows can share a
     sortOrder, and swapping two equal numbers moves nothing. */
  await Promise.all([
    ProjectModel.updateOne({ _id: a._id }, { $set: { sortOrder: target + 1 } }),
    ProjectModel.updateOne({ _id: b._id }, { $set: { sortOrder: index + 1 } }),
  ]);

  return true;
}

export async function deleteProject(id: string) {
  await connectDB();
  const deleted = await ProjectModel.findByIdAndDelete(id)
    .select("slug media")
    .lean();
  return deleted ? { slug: deleted.slug, media: deleted.media } : null;
}

/**
 * Inserts projects that are not already present, and reports what it skipped.
 *
 * Used once, to move the twenty-five in `work-data.ts` into the database.
 * Idempotent: existing slugs are filtered out first, so running it twice
 * imports nothing the second time.
 */
export async function importProjects(
  projects: ProjectInput[],
  updatedBy: string
): Promise<{ imported: string[]; skipped: string[] }> {
  await connectDB();

  const slugs = projects.map((p) => p.slug.toLowerCase());
  const existing = await ProjectModel.find({ slug: { $in: slugs } })
    .select("slug")
    .lean();
  const taken = new Set(existing.map((row) => row.slug));

  const fresh = projects.filter((p) => !taken.has(p.slug.toLowerCase()));

  if (fresh.length > 0) {
    await ProjectModel.insertMany(
      fresh.map((project, index) => ({
        ...toDocument(project, updatedBy),
        /* Order preserved from the file, which is the order they appear on the
           site today. */
        sortOrder: project.sortOrder || index + 1,
      }))
    );
  }

  return { imported: fresh.map((p) => p.slug), skipped: [...taken] };
}
