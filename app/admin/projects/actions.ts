"use server";

import { revalidatePath } from "next/cache";

import { requireStaffOrThrow } from "@/lib/auth/dal";
import { isAppError } from "@/lib/core/errors";
import { createLogger } from "@/lib/core/logger";
import { storage } from "@/lib/config/env";
import { destroyAsset } from "@/lib/storage/cloudinary";
import {
  cleanGallery,
  cleanList,
  cleanSections,
  normaliseProjectUrl,
  slugifyProject,
  validateProject,
  PROJECT_LIMITS,
  type ProjectFieldErrors,
  type ProjectInput,
} from "@/lib/content/project-schema";
import {
  createProject,
  deleteProject,
  featureProject,
  findProjectById,
  importProjects,
  isProjectSlugTaken,
  moveFeaturedProject,
  moveProject,
  setProjectFlags,
  updateProject,
  MAX_FEATURED_PROJECTS,
} from "@/lib/repositories/project.repository";
import {
  projects as staticProjects,
  projectMedia as staticMedia,
} from "@/components/sections/work/work-data";

/**
 * The work section's mutations.
 *
 * Staff only, checked in every action rather than once at the page. These are
 * POST endpoints against the page's URL, reachable without the page ever being
 * rendered, so a guard on the render is not a boundary.
 */

const logger = createLogger("admin.work");

export type SaveResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; errors: ProjectFieldErrors };

export type SimpleResult = { ok: true; message?: string } | { ok: false; message: string };

/**
 * Every path a project appears on.
 *
 * The work page and the homepage both list projects, the detail page renders
 * one, and the sitemap enumerates them. Each has its own revalidate window, so
 * missing one leaves it stale for up to five minutes and reads as the save not
 * having worked.
 */
function revalidateWork(slug?: string) {
  revalidatePath("/");
  revalidatePath("/projects");
  if (slug) revalidatePath(`/projects/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/projects");
}

function normalise(input: ProjectInput): ProjectInput {
  return {
    ...input,
    slug: slugifyProject(input.slug || input.name),
    name: input.name.trim(),
    category: input.category.trim(),
    description: input.description.trim(),
    groups: cleanList(input.groups, PROJECT_LIMITS.maxGroups),
    tags: cleanList(input.tags, PROJECT_LIMITS.maxTags),
    results: cleanList(input.results, PROJECT_LIMITS.maxResults),
    body: cleanSections(input.body),
    gallery: cleanGallery(input.gallery),
    client: input.client.trim(),
    /* Run through the protocol check, so a bare "acme.com" becomes a usable
       href and `javascript:` never reaches an anchor. */
    liveUrl: normaliseProjectUrl(input.liveUrl) ?? "",
    repoUrl: normaliseProjectUrl(input.repoUrl) ?? "",
    media: input.media
      ? { ...input.media, alt: input.media.alt.trim(), src: input.media.src.trim() }
      : null,
  };
}

export async function saveProject(
  input: ProjectInput,
  existingId?: string
): Promise<SaveResult> {
  try {
    const user = await requireStaffOrThrow();
    const project = normalise(input);

    const errors = validateProject(project);

    if (!errors.slug && (await isProjectSlugTaken(project.slug, existingId))) {
      errors.slug = `"${project.slug}" is already used by another project.`;
    }

    if (Object.keys(errors).length > 0) return { ok: false, errors };

    const saved = existingId
      ? await updateProject(existingId, project, user.email)
      : await createProject(project, user.email);

    if (!saved) return { ok: false, errors: { form: "That project no longer exists." } };

    revalidateWork(saved.slug);
    logger.info(existingId ? "project updated" : "project created", {
      id: saved.id,
      slug: saved.slug,
      published: project.published,
      by: user.email,
    });

    return { ok: true, id: saved.id, slug: saved.slug };
  } catch (error) {
    if (isAppError(error)) return { ok: false, errors: { form: error.publicMessage } };

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return { ok: false, errors: { slug: "That slug was just taken. Try another." } };
    }

    logger.error("saving a project failed", error);
    return { ok: false, errors: { form: "That did not save. Please try again." } };
  }
}

export async function setProjectPublished(
  id: string,
  published: boolean
): Promise<SimpleResult> {
  try {
    const user = await requireStaffOrThrow();
    const updated = await setProjectFlags(id, { published }, user.email);
    if (!updated) return { ok: false, message: "That project no longer exists." };

    revalidateWork(updated.slug);
    logger.info(published ? "project published" : "project unpublished", {
      id,
      by: user.email,
    });
    return { ok: true };
  } catch (error) {
    if (isAppError(error)) return { ok: false, message: error.publicMessage };
    logger.error("changing project visibility failed", error);
    return { ok: false, message: "That did not work. Please try again." };
  }
}

export async function setProjectFeatured(
  id: string,
  featured: boolean
): Promise<SimpleResult> {
  try {
    const user = await requireStaffOrThrow();
    const updated = await featureProject(id, featured, user.email);

    if (updated === "full") {
      return {
        ok: false,
        message: `The homepage holds ${MAX_FEATURED_PROJECTS} projects. Take one off first.`,
      };
    }
    if (!updated) return { ok: false, message: "That project no longer exists." };

    revalidateWork(updated.slug);
    logger.info(featured ? "project featured" : "project unfeatured", { id, by: user.email });
    return { ok: true };
  } catch (error) {
    if (isAppError(error)) return { ok: false, message: error.publicMessage };
    logger.error("featuring a project failed", error);
    return { ok: false, message: "That did not work. Please try again." };
  }
}

/**
 * Moves a project within the homepage band.
 *
 * Separate from `reorderProject`, which moves it within the whole catalogue.
 * The two orders are independent on purpose: curating the six on the homepage
 * should not reshuffle the twenty-five on /projects.
 */
export async function reorderFeatured(
  id: string,
  direction: -1 | 1
): Promise<SimpleResult> {
  try {
    await requireStaffOrThrow();
    const moved = await moveFeaturedProject(id, direction);
    if (!moved) return { ok: false, message: "It is already at the end." };

    revalidateWork();
    return { ok: true };
  } catch (error) {
    if (isAppError(error)) return { ok: false, message: error.publicMessage };
    logger.error("reordering the homepage band failed", error);
    return { ok: false, message: "That did not work. Please try again." };
  }
}

export async function reorderProject(
  id: string,
  direction: -1 | 1
): Promise<SimpleResult> {
  try {
    await requireStaffOrThrow();
    const moved = await moveProject(id, direction);
    if (!moved) return { ok: false, message: "It is already at the end." };

    revalidateWork();
    return { ok: true };
  } catch (error) {
    if (isAppError(error)) return { ok: false, message: error.publicMessage };
    logger.error("reordering projects failed", error);
    return { ok: false, message: "That did not work. Please try again." };
  }
}

export async function removeProject(id: string): Promise<SimpleResult> {
  try {
    const user = await requireStaffOrThrow();

    /*
      The screenshot goes before the document, because the document is the only
      record of which Cloudinary asset belonged to this project. Deleting the
      row first orphans the file with nothing pointing at it, and it counts
      against the account's storage forever.
    */
    const existing = await findProjectById(id);

    if (existing?.media?.publicId && storage.isConfigured) {
      await destroyAsset({
        publicId: existing.media.publicId,
        resourceType: "image",
        deliveryType: "upload",
      });
    }

    const deleted = await deleteProject(id);
    if (!deleted) return { ok: false, message: "That project no longer exists." };

    revalidateWork(deleted.slug);
    logger.info("project deleted", { id, slug: deleted.slug, by: user.email });
    return { ok: true };
  } catch (error) {
    if (isAppError(error)) return { ok: false, message: error.publicMessage };
    logger.error("deleting a project failed", error);
    return { ok: false, message: "That did not work. Please try again." };
  }
}

/**
 * Moves the projects in `work-data.ts` into the database.
 *
 * A one-time action rather than a migration script, for the same reason the
 * blog's import is: it needs the TypeScript module, the path alias and the
 * model, none of which a bare `node` process resolves. Idempotent, so pressing
 * it twice imports nothing the second time.
 *
 * `work-data.ts` stays afterwards. It is the fallback when Atlas is
 * unreachable, not a fixture to be deleted once this has run.
 */
export async function importBuiltInProjects(): Promise<
  { ok: true; imported: number; skipped: number } | { ok: false; message: string }
> {
  try {
    const user = await requireStaffOrThrow();

    const payload: ProjectInput[] = staticProjects.map((project, index) => {
      const media = staticMedia[project.slug];

      return {
        slug: project.slug,
        name: project.name,
        category: project.category,
        groups: [...project.groups],
        description: project.description,
        tags: [...project.tags],
        status: project.status,
        preview: project.preview,
        liveUrl: project.liveUrl ?? "",
        repoUrl: project.repoUrl ?? "",
        /* The imported screenshots keep their `public/` paths. They are already
           optimised WebP in the repo, and re-uploading them to Cloudinary would
           be work for no gain; a later edit can replace one with an upload. */
        media: media
          ? {
              type: media.type,
              publicId: "",
              src: media.src,
              alt: media.alt,
              poster: media.type === "video" ? (media.poster ?? "") : "",
            }
          : null,
        /* Neither exists in the file, so imported projects start without
           them and gain them on a later edit. */
        gallery: [],
        client: "",
        featured: Boolean(project.featured),
        published: true,
        sortOrder: index + 1,
        role: project.role ?? "",
        timeline: project.timeline ?? "",
        results: project.results ? [...project.results] : [],
        body: project.body
          ? project.body.map((section) => ({
              heading: section.heading,
              paragraphs: [...section.paragraphs],
              image: null,
            }))
          : [],
      };
    });

    const result = await importProjects(payload, user.email);

    revalidateWork();
    logger.info("built-in projects imported", {
      imported: result.imported.length,
      skipped: result.skipped.length,
      by: user.email,
    });

    return { ok: true, imported: result.imported.length, skipped: result.skipped.length };
  } catch (error) {
    if (isAppError(error)) return { ok: false, message: error.publicMessage };
    logger.error("importing the built-in projects failed", error);
    return { ok: false, message: "The import did not finish. Please try again." };
  }
}
