/**
 * Adds one project to the database from a JSON file.
 *
 *   node scripts/add-project.mjs scripts/projects/rivisk.json
 *
 * The admin editor is the normal way to add a project. This exists for the
 * case the editor is bad at: a long case study with several sections and a
 * list of results, where typing it into a form is twenty minutes of copying
 * and one mis-click away from losing the lot.
 *
 * It writes a draft. Screenshots still have to be uploaded through the editor
 * — they go to Cloudinary, not here — and publishing stays a deliberate press
 * in the admin, so nothing reaches the public site because a script ran.
 *
 * Re-running with the same slug updates that project rather than creating a
 * second one, and leaves its media alone: a second run after screenshots were
 * uploaded must not wipe them.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import mongoose from "mongoose";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/* Next loads .env.local itself; a bare `node` process does not. */
function loadEnvLocal() {
  for (const name of [".env.local", ".env"]) {
    try {
      const contents = readFileSync(resolve(root, name), "utf8");
      for (const line of contents.split("\n")) {
        const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
        if (!match) continue;
        const [, key, rawValue] = match;
        if (process.env[key]) continue;
        process.env[key] = rawValue.trim().replace(/^["']|["']$/g, "");
      }
    } catch {
      /* Absent is normal; MONGODB_URI may come from the shell instead. */
    }
  }
}

/*
  The limits restated from `lib/content/project-schema.ts`.

  Restated rather than imported for the same reason `create-admin.mjs` restates
  the password parameters: that file is TypeScript behind a `@/` alias. Checked
  here anyway, because a document written past a limit saves fine and then
  fails validation the first time somebody opens it in the editor — which is a
  confusing place to discover it.
*/
const LIMITS = {
  nameMax: 200,
  descriptionMin: 40,
  descriptionMax: 4000,
  maxTags: 12,
  maxGroups: 4,
  maxResults: 6,
  maxSections: 20,
  maxGallery: 8,
};

const STATUSES = ["Live", "In progress", "On hold"];

function check(project) {
  const problems = [];

  if (!project.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) {
    problems.push("slug must be lowercase words joined by single hyphens");
  }
  if (!project.name || project.name.length > LIMITS.nameMax) {
    problems.push(`name is required and at most ${LIMITS.nameMax} characters`);
  }
  const description = project.description ?? "";
  if (description.length < LIMITS.descriptionMin || description.length > LIMITS.descriptionMax) {
    problems.push(
      `description must be ${LIMITS.descriptionMin}–${LIMITS.descriptionMax} characters (it is ${description.length})`
    );
  }
  if (!STATUSES.includes(project.status)) {
    problems.push(`status must be one of ${STATUSES.join(", ")}`);
  }
  if ((project.tags ?? []).length > LIMITS.maxTags) {
    problems.push(`at most ${LIMITS.maxTags} tags`);
  }
  if ((project.groups ?? []).length > LIMITS.maxGroups) {
    problems.push(`at most ${LIMITS.maxGroups} buckets`);
  }
  if ((project.results ?? []).length > LIMITS.maxResults) {
    problems.push(`at most ${LIMITS.maxResults} results`);
  }
  if ((project.body ?? []).length > LIMITS.maxSections) {
    problems.push(`at most ${LIMITS.maxSections} case-study sections`);
  }
  if ((project.gallery ?? []).length > LIMITS.maxGallery) {
    problems.push(`at most ${LIMITS.maxGallery} gallery images`);
  }

  return problems;
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: node scripts/add-project.mjs <path-to-project.json>");
    process.exit(1);
  }

  loadEnvLocal();

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Put it in .env.local or the environment.");
    process.exit(1);
  }

  const project = JSON.parse(readFileSync(resolve(process.cwd(), file), "utf8"));

  const problems = check(project);
  if (problems.length > 0) {
    console.error(`${project.slug ?? file} cannot be saved:`);
    for (const problem of problems) console.error(`  · ${problem}`);
    process.exit(1);
  }

  await mongoose.connect(uri);
  const projects = mongoose.connection.collection("projects");

  const existing = await projects.findOne({ slug: project.slug });
  const now = new Date();

  const document = {
    slug: project.slug,
    name: project.name,
    category: project.category ?? "",
    groups: project.groups ?? [],
    description: project.description,
    tags: project.tags ?? [],
    status: project.status,
    preview: project.preview ?? "dashboard",
    liveUrl: project.liveUrl ?? "",
    repoUrl: project.repoUrl ?? "",
    client: project.client ?? "",
    role: project.role ?? "",
    timeline: project.timeline ?? "",
    results: project.results ?? [],
    body: (project.body ?? []).map((section) => ({
      heading: section.heading,
      paragraphs: section.paragraphs ?? [],
      image: section.image ?? null,
    })),
    published: Boolean(project.published),
    featured: Boolean(project.featured),
    featuredOrder: 0,
    updatedBy: "scripts/add-project.mjs",
    updatedAt: now,
  };

  if (existing) {
    /*
      Media and gallery are left out of the update on purpose. They are
      uploaded through the editor after this runs, and a second run to fix a
      typo in a paragraph must not throw the screenshots away.
    */
    await projects.updateOne({ _id: existing._id }, { $set: document });
    console.log(`Updated ${project.slug} (screenshots and ordering left as they were).`);
  } else {
    const count = await projects.countDocuments();
    await projects.insertOne({
      ...document,
      media: null,
      gallery: [],
      sortOrder: project.sortOrder || count + 1,
      createdAt: now,
    });
    console.log(`Added ${project.slug} as a draft.`);
  }

  console.log(`  Edit it:    /admin/projects`);
  console.log(`  Public URL: /projects/${project.slug} (once published)`);

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
