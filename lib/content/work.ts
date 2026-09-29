import "server-only";

import { database, storage } from "@/lib/config/env";
import { createLogger } from "@/lib/core/logger";
import {
  cloudinaryImageUrl,
  cloudinaryVideoPoster,
  cloudinaryVideoUrl,
} from "@/lib/storage/public-url";
import {
  findPublishedProjectBySlug,
  listFeaturedProjects,
  listPublishedProjects,
  MAX_FEATURED_PROJECTS,
  type LeanProject,
} from "@/lib/repositories/project.repository";
import {
  projects as staticProjects,
  projectMedia as staticMedia,
  type Project,
  type ProjectImage,
  type ProjectMedia,
  type ProjectStatus,
} from "@/components/sections/work/work-data";

/**
 * Where the work section's content comes from.
 *
 * The database when there is one, and `work-data.ts` when there is not. Exactly
 * the arrangement `lib/content/posts.ts` uses for the blog, and for the same
 * reasons: it keeps the projects page rendering on a fresh clone with no
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

/** A stored image, resolved to a URL. Cloudinary wins over a `public/` path. */
/**
 * Repoints a stored path at the folder the screenshots actually live in.
 *
 * The section was renamed from work to projects, which moved
 * `public/work/` to `public/projects/`. The files moved; the rows that point
 * at them did not, because they are in the database and `git mv` does not
 * reach there. The result was a 400 from the image optimiser for every project
 * imported before the rename — the page-level redirect rescues a browser
 * asking for `/work/eep.webp`, but the optimiser fetches the path it is given
 * and does not follow one.
 *
 * Fixed on read rather than by a migration, so it holds for any database this
 * code meets — production, a local copy, a colleague's — without anybody
 * remembering to run something. Anchored on the leading slash so it cannot
 * touch a Cloudinary URL or a path that merely contains the word.
 */
function repoint(src: string): string {
  return src.startsWith("/work/") ? `/projects/${src.slice("/work/".length)}` : src;
}

function imageOf(
  item:
    | { publicId?: string; src?: string; alt?: string; caption?: string }
    | null
    | undefined
): ProjectImage | undefined {
  if (!item) return undefined;

  const src = item.publicId
    ? storage.isConfigured
      /* Width only. A height turns this into `c_fill,g_face`, which crops, and
         a gallery screenshot is rendered whole at the full width of the
         column: roughly 440 CSS pixels in the two-column grid. */
      ? cloudinaryImageUrl(item.publicId, { width: 700 })
      : ""
    : repoint(item.src ?? "");

  if (!src) return undefined;
  return { src, alt: item.alt ?? "", ...(item.caption ? { caption: item.caption } : {}) };
}

function mediaOf(project: LeanProject): ProjectMedia | undefined {
  const media = project.media;
  if (!media) return undefined;

  /*
    Video first, because it is delivered from a different Cloudinary namespace
    and its poster is generated from the clip rather than uploaded. Treating it
    as an image would produce a 404 for both.
  */
  if (media.type === "video" && media.publicId) {
    if (!storage.isConfigured) return undefined;
    return {
      type: "video",
      src: cloudinaryVideoUrl(media.publicId),
      poster: media.poster || cloudinaryVideoPoster(media.publicId),
      alt: media.alt ?? "",
    };
  }

  /*
    A Cloudinary asset wins over a path. Both can be set on a project that was
    imported from the file and later given a real upload, and the upload is the
    newer of the two.

    The width is generous because this is a card image on a wide grid, and
    `f_auto,q_auto` mean the bytes are decided by the format rather than by the
    dimensions.
  */
  /*
    Width only, no height.

    Passing a height asks for `c_fill,g_face`, which crops to exactly 16:10 and
    hunts for a face while doing it. `work-media.tsx` renders these with
    `object-contain` precisely because it must not crop: the screenshots range
    from 1.06 to 2.38 against that frame, and cropping the wide ones cut off the
    part worth reading. Cloudinary was undoing that decision before the renderer
    ever saw the image, so a pasted screenshot arrived already sliced and scaled
    down to fit a box it was then letterboxed inside again.

    Only uploads went through this path, which is why it went unnoticed: the
    twenty-five built-in projects are files under /public.
  */
  const src = media.publicId
    ? storage.isConfigured
      ? cloudinaryImageUrl(media.publicId, { width: 900 })
      : ""
    : repoint(media.src ?? "");

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
    ...(project.client ? { client: project.client } : {}),
    ...(project.gallery?.length
      ? {
          gallery: project.gallery
            .map((item) => imageOf(item))
            .filter((item): item is ProjectImage => Boolean(item)),
        }
      : {}),
    ...(project.body?.length
      ? {
          body: project.body.map((section) => {
            const image = imageOf(section.image);
            return {
              heading: section.heading,
              paragraphs: section.paragraphs ?? [],
              ...(image ? { image } : {}),
            };
          }),
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

/**
 * The homepage's band.
 *
 * Its own query rather than a filter over `getWork()`, because the band has
 * its own order. `featuredOrder` is what the admin's homepage panel arranges,
 * and it is deliberately independent of the catalogue's `sortOrder`: curating
 * the six shown to somebody four seconds into the site should not reshuffle
 * the twenty-five on /projects.
 */
export async function getFeaturedWork(): Promise<WorkContent> {
  if (database.isConfigured) {
    try {
      const rows = await listFeaturedProjects();

      if (rows.length > 0) {
        const projects = rows.map(toProject);
        const media: Partial<Record<string, ProjectMedia>> = {};
        for (const [position, row] of rows.entries()) {
          const item = mediaOf(row);
          if (item) media[projects[position].slug] = item;
        }
        return { projects, media };
      }
    } catch (error) {
      logger.error("could not load the featured projects", error);
    }
  }

  /*
    Nothing featured, no database, or the query failed: fall back to the front
    of the catalogue rather than rendering an empty band. A set imported
    without featured flags would otherwise blank the homepage, which reads as
    a broken site rather than as an empty decision.
  */
  const { projects, media } = await getWork();
  const featured = projects.filter((project) => project.featured);
  const band = featured.length > 0 ? featured : projects;

  return { projects: band.slice(0, MAX_FEATURED_PROJECTS), media };
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
