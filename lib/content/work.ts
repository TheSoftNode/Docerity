import "server-only";

import { database, storage } from "@/lib/config/env";
import { createLogger } from "@/lib/core/logger";
import { cloudinaryImageUrl } from "@/lib/storage/public-url";
import {
  findPublishedProjectBySlug,
  listPublishedProjects,
  type LeanProject,
} from "@/lib/repositories/project.repository";
import {
  projects as staticProjects,
  projectMedia as staticMedia,
  type Project,
  type ProjectMedia,
  type ProjectStatus,
} from "@/components/sections/work/work-data";

/**
 * Where the work section's content comes from.
 *
 * The database when there is one, and `work-data.ts` when there is not. Exactly
 * the arrangement `lib/content/posts.ts` uses for the blog, and for the same
 * reasons: it keeps the work page rendering on a fresh clone with no
 * MONGODB_URI, keeps the e2e suite passing without a database, and keeps
 * twenty-five real projects online if Atlas is unreachable during a deploy.
 *
 * Everything here returns the `Project` shape the existing components already
 * render, so nothing downstream had to change to become database-backed.
 */

const logger = createLogger("content.work");

/**
 * The display index, derived rather than stored.
 *
 * It is a position, and storing it would mean renumbering every row by hand to
 * move one. The static file does store it, which is why its entries have to be
 * kept in order; a database row does not.
 */
function indexOf(position: number): string {
  return String(position + 1).padStart(2, "0");
}

function mediaOf(project: LeanProject): ProjectMedia | undefined {
  const media = project.media;
  if (!media) return undefined;

  /*
    A Cloudinary asset wins over a path. Both can be set on a project that was
    imported from the file and later given a real upload, and the upload is the
    newer of the two.

    The width is generous because this is a card image on a wide grid, and
    `f_auto,q_auto` mean the bytes are decided by the format rather than by the
    dimensions.
  */
  const src = media.publicId
    ? storage.isConfigured
      ? cloudinaryImageUrl(media.publicId, { width: 1200, height: 750 })
      : ""
    : media.src;

  if (!src) return undefined;

  if (media.type === "video") {
    return { type: "video", src, poster: media.poster || undefined, alt: media.alt };
  }
  return { type: "image", src, alt: media.alt };
}

function toProject(project: LeanProject, position: number): Project {
  return {
    index: indexOf(position),
    slug: project.slug,
    name: project.name,
    category: project.category ?? "",
    groups: project.groups ?? [],
    description: project.description,
    tags: project.tags ?? [],
    status: project.status as ProjectStatus,
    preview: (project.preview ?? "dashboard") as Project["preview"],
    ...(project.featured ? { featured: true } : {}),
    ...(project.liveUrl ? { liveUrl: project.liveUrl } : {}),
    ...(project.repoUrl ? { repoUrl: project.repoUrl } : {}),
    ...(project.role ? { role: project.role } : {}),
    ...(project.timeline ? { timeline: project.timeline } : {}),
    ...(project.results?.length ? { results: project.results } : {}),
    ...(project.body?.length
      ? {
          body: project.body.map((section) => ({
            heading: section.heading,
            paragraphs: section.paragraphs ?? [],
          })),
        }
      : {}),
  };
}

export type WorkContent = {
  projects: Project[];
  /** Keyed by slug, matching `projectMedia` in the static file. */
  media: Partial<Record<string, ProjectMedia>>;
};

/**
 * Every published project, in display order, with its media.
 *
 * An empty database falls back to the static set rather than returning nothing.
 * Connecting Atlas for the first time must not silently empty a work page that
 * was fine a minute earlier; that reads as data loss. Once a project exists in
 * the database, the database is the only source.
 */
export async function getWork(): Promise<WorkContent> {
  const fallback: WorkContent = { projects: [...staticProjects], media: staticMedia };

  if (!database.isConfigured) return fallback;

  try {
    const rows = await listPublishedProjects();
    if (rows.length === 0) return fallback;

    const projects = rows.map(toProject);
    const media: Partial<Record<string, ProjectMedia>> = {};
    for (const [position, row] of rows.entries()) {
      const item = mediaOf(row);
      if (item) media[projects[position].slug] = item;
    }

    return { projects, media };
  } catch (error) {
    logger.error("could not load projects, falling back to the built-in set", error);
    return fallback;
  }
}

/** The homepage's subset. */
export async function getFeaturedWork(): Promise<WorkContent> {
  const { projects, media } = await getWork();
  const featured = projects.filter((project) => project.featured);

  /* Every project when none is flagged, rather than an empty homepage section.
     A set imported without featured flags would otherwise blank the band. */
  return { projects: featured.length > 0 ? featured : projects.slice(0, 6), media };
}

/**
 * One project by slug, with its media.
 *
 * Queried directly rather than filtering the whole list, so a detail page
 * fetches one document. Falls back to the static set on a miss and on failure,
 * which is what lets the twenty-five original URLs keep working before anything
 * has been imported.
 */
export async function getProject(
  slug: string
): Promise<{ project: Project; media?: ProjectMedia } | undefined> {
  const fromStatic = () => {
    const position = staticProjects.findIndex((p) => p.slug === slug);
    if (position === -1) return undefined;
    return { project: staticProjects[position], media: staticMedia[slug] };
  };

  if (!database.isConfigured) return fromStatic();

  try {
    const row = await findPublishedProjectBySlug(slug);
    if (!row) return fromStatic();

    /*
      The position comes from the full published list, because `index` is a
      position on the grid and a document does not know its own. One extra
      query on a page that is cached for five minutes.
    */
    const all = await listPublishedProjects();
    const position = all.findIndex((p) => String(p._id) === String(row._id));

    return {
      project: toProject(row, position === -1 ? 0 : position),
      media: mediaOf(row),
    };
  } catch (error) {
    logger.error("could not load a project, falling back to the built-in set", error, {
      slug,
    });
    return fromStatic();
  }
}

/**
 * Slugs for `generateStaticParams`.
 *
 * Both sets, deduplicated, for the same reason as the blog: a build that cannot
 * reach Atlas, or one before anything has been imported, still produces the
 * twenty-five pages rather than 404s.
 */
export async function getProjectSlugs(): Promise<string[]> {
  const slugs = new Set(staticProjects.map((project) => project.slug));

  if (database.isConfigured) {
    try {
      for (const row of await listPublishedProjects()) slugs.add(row.slug);
    } catch (error) {
      logger.error("could not list project slugs for prerendering", error);
    }
  }

  return [...slugs];
}
