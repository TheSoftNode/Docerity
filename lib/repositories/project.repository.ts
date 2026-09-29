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

/**
 * How many projects the homepage band will show.
 *
 * Six, because the band is a three-wide grid and six fills two rows evenly at
 * every breakpoint it has. It is also about as many as somebody four seconds
 * into the site will look at, which is the actual reason: the band is a case,
 * not a catalogue, and /projects is one click away for the rest.
 *
 * Exported so the cap, the homepage slice and the message that explains the
 * refusal are all the same number.
 */
export const MAX_FEATURED_PROJECTS = 6;

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
    gallery: input.gallery,
    client: input.client.trim(),
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
 * The homepage band, in the order it will be shown.
 *
 * Published as well as featured, and the `published` gate lives here for the
 * same reason every other public read path's does: a featured draft is still a
 * draft, and leaving that condition to the caller is how one gets onto the
 * homepage. The admin's own list is built from `listAllProjects`, which is why
 * there is no unpublished variant of this.
 */
export async function listFeaturedProjects(): Promise<LeanProject[]> {
  await connectDB();
  return ProjectModel.find({ featured: true, published: true })
    .sort({ featuredOrder: 1, sortOrder: 1, createdAt: -1 })
    .limit(MAX_FEATURED_PROJECTS)
    .lean<LeanProject[]>();
}

export async function countFeaturedProjects(): Promise<number> {
  await connectDB();
  return ProjectModel.countDocuments({ featured: true });
}

/**
 * Puts a project on the homepage, or takes it off.
 *
 * Featuring appends: a newly featured project goes last in the band rather
 * than jumping to the front, because where it belongs is a decision to make
 * deliberately with the reorder controls, not a side effect of the order
 * things happened to be starred in.
 *
 * Unfeaturing clears the position as well as the flag, so a project featured
 * again months later appends like any other rather than reappearing wherever
 * it used to sit among projects that have since changed.
 *
 * Returns `null` when the project is gone and `"full"` when the band already
 * holds its limit, so the caller can say which happened. The count is taken
 * here rather than in the action because it has to be read in the same place
 * it is acted on; two staff featuring a seventh at the same moment is not a
 * scenario worth a transaction on a site with one editor, and the band is
 * sliced to the limit when it renders either way.
 */
export async function featureProject(
  id: string,
  featured: boolean,
  updatedBy: string
): Promise<{ slug: string } | null | "full"> {
  await connectDB();

  if (featured) {
    const already = await ProjectModel.findById(id).select("featured").lean();
    if (!already) return null;

    if (!already.featured && (await countFeaturedProjects()) >= MAX_FEATURED_PROJECTS) {
      return "full";
    }
  }

  const last = featured
    ? await ProjectModel.findOne({ featured: true })
        .sort({ featuredOrder: -1 })
        .select("featuredOrder")
        .lean()
    : null;

  const updated = await ProjectModel.findByIdAndUpdate(
    id,
    {
      $set: {
        featured,
        featuredOrder: featured ? (last?.featuredOrder ?? 0) + 1 : 0,
        updatedBy,
      },
    },
    { new: true }
  )
    .select("slug")
    .lean();

  return updated ? { slug: updated.slug } : null;
}

/**
 * Moves a project one place up or down within the homepage band.
 *
 * The same swap as `moveProject`, over `featuredOrder` and over the featured
 * projects only: moving the third of six must not depend on, or disturb, the
 * nineteen projects that are not on the homepage at all.
 */
export async function moveFeaturedProject(id: string, direction: -1 | 1) {
  await connectDB();

  const featured = await ProjectModel.find({ featured: true })
    .sort({ featuredOrder: 1, sortOrder: 1, createdAt: -1 })
    .select("_id")
    .lean();

  const index = featured.findIndex((project) => String(project._id) === id);
  if (index === -1) return false;

  const target = index + direction;
  if (target < 0 || target >= featured.length) return false;

  /* Positions rather than the stored values, for the same reason the catalogue
     swap uses them: a set featured before this field existed shares a
     `featuredOrder` of zero, and swapping two zeroes moves nothing. */
  await Promise.all([
    ProjectModel.updateOne({ _id: featured[index]._id }, { $set: { featuredOrder: target + 1 } }),
    ProjectModel.updateOne({ _id: featured[target]._id }, { $set: { featuredOrder: index + 1 } }),
  ]);

  return true;
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
 * Moves what is in `work-data.ts` into the database, skipping slugs already
 * stored, so it can be run again when the file gains projects.
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
    /* The featured ones get their homepage positions here rather than all
       landing on the default zero, so the band arrives in the file's order and
       is arrangeable from the first click instead of after one that appears to
       do nothing. Counted separately from `index`, which walks every project. */
    let bandPosition = 0;

    await ProjectModel.insertMany(
      fresh.map((project, index) => ({
        ...toDocument(project, updatedBy),
        /* Order preserved from the file, which is the order they appear on the
           site today. */
        sortOrder: project.sortOrder || index + 1,
        featuredOrder: project.featured ? (bandPosition += 1) : 0,
      }))
    );
  }

  return { imported: fresh.map((p) => p.slug), skipped: [...taken] };
}
