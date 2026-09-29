import { connectDB } from "@/lib/db/connect";
import { ProjectModel } from "@/lib/db/models/project.model";
import { PostModel } from "@/lib/db/models/post.model";
import { SiteContentModel } from "@/lib/db/models/site-content.model";
import { BLOCKS } from "@/lib/content/blocks/schema";

/**
 * Where an uploaded file is actually used.
 *
 * The media page was read-only because deleting a file some page still points
 * at fails silently: a broken image on a public page, days later, with nothing
 * connecting it to the click that caused it. This is the answer to that rather
 * than a reason to refuse. Every place an upload can be referenced is checked,
 * and the delete is only unguarded when nothing comes back.
 *
 * Three shapes have to be searched, because uploads are stored three ways:
 *
 *   projects   `media.publicId`, and `gallery[].publicId`, and per-section
 *              `body[].image.publicId`
 *   posts      `body[].media.publicId`
 *   sections    the editable page content, which stores a whole delivery URL
 *              rather than an id, because the sections that render it know
 *              nothing about Cloudinary
 */

export type MediaUse = {
  /** What it is used by, for the sentence shown before a delete. */
  kind: "project" | "post" | "section";
  label: string;
  /** Where to go and change it. */
  href: string;
};

export async function findMediaUsage(publicId: string): Promise<MediaUse[]> {
  if (!publicId) return [];

  await connectDB();

  const uses: MediaUse[] = [];

  const projects = await ProjectModel.find({
    $or: [
      { "media.publicId": publicId },
      { "gallery.publicId": publicId },
      { "body.image.publicId": publicId },
    ],
  })
    .select("name slug")
    .lean();

  for (const project of projects) {
    uses.push({
      kind: "project",
      label: project.name,
      href: `/admin/projects/${String(project._id)}`,
    });
  }

  const posts = await PostModel.find({ "body.media.publicId": publicId })
    .select("title")
    .lean();

  for (const post of posts) {
    uses.push({ kind: "post", label: post.title, href: `/admin/posts/${String(post._id)}` });
  }

  /*
    Page sections store the delivery URL, so the id has to be matched as a
    substring of it — and matched on both ends, which a plain `includes` does
    not do. `.../content/log` is a substring of `.../content/logo.png`, so the
    leading slash alone reports `log` as permanently in use and makes it
    undeletable, while `hero` catches `hero-shot` the same way.

    So: a slash in front, and nothing that could continue an id behind. What
    legitimately follows one in a delivery URL is the extension's dot, a query
    string, or the end of the string.
  */
  const boundary = new RegExp(
    `/${publicId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z0-9_/-])`
  );
  const sections = await SiteContentModel.find({}).lean();

  for (const section of sections) {
    const serialised = JSON.stringify(section.data ?? {});
    if (boundary.test(serialised)) {
      /* The editor's own name for the block, so the warning says "Homepage"
         rather than a storage key. Unknown keys fall back to the key itself
         rather than being dropped: a use nobody can name is still a use. */
      const block = BLOCKS.find((candidate) => candidate.key === section.key);
      uses.push({
        kind: "section",
        label: block?.title ?? section.key,
        href: `/admin/content/${section.key}`,
      });
    }
  }

  return uses;
}
