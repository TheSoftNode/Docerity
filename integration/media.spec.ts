import { test, expect, type Page } from "@playwright/test";
import mongoose from "mongoose";

import { hashPassword } from "@/lib/auth/password";
import { findMediaUsage } from "@/lib/repositories/media-usage.repository";

/**
 * Managing what has been uploaded, and the mailing list, against a real
 * database.
 *
 * The media page was read-only until now for a good reason: deleting a file a
 * published page still points at is a broken image discovered days later with
 * nothing connecting it to the click. So the interesting thing to test is not
 * the delete — it is the lookup that decides whether to warn, and it can only
 * be tested against real documents, because what it searches is three
 * different storage shapes across three collections.
 */

test.describe.configure({ mode: "serial" });

const OWNER = {
  email: "media-owner@c.test",
  name: "Media Owner",
  password: "an-owner-password-here",
};

const IN_HERO = "docerity/projects/hero-shot";
const IN_GALLERY = "docerity/projects/gallery-shot";
const IN_SECTION_BODY = "docerity/projects/body-shot";
const IN_POST = "docerity/posts/diagram";
const IN_BLOCK = "docerity/content/logo";
const UNUSED = "docerity/projects/nothing-points-here";

test.beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);

  for (const name of ["users", "projects", "posts", "sitecontents", "subscribers"]) {
    await mongoose.connection.collection(name).deleteMany({});
  }

  await mongoose.connection.collection("users").insertOne({
    email: OWNER.email,
    name: OWNER.name,
    passwordHash: await hashPassword(OWNER.password),
    role: "owner",
    failedAttempts: 0,
    lockedUntil: null,
    lastLoginAt: null,
    sessionVersion: 1,
    disabledAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await mongoose.connection.collection("projects").insertOne({
    name: "A project with pictures",
    slug: "a-project-with-pictures",
    description: "Something that uses three uploads.",
    media: { type: "image", publicId: IN_HERO, src: "", alt: "" },
    gallery: [{ publicId: IN_GALLERY, src: "", alt: "" }],
    body: [{ heading: "A section", paragraphs: [], image: { publicId: IN_SECTION_BODY } }],
    published: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await mongoose.connection.collection("posts").insertOne({
    title: "A post with a diagram",
    slug: "a-post-with-a-diagram",
    hook: "It has a picture in it.",
    type: "article",
    body: [
      { heading: "With the picture", paragraphs: [], media: { type: "image", publicId: IN_POST } },
    ],
    status: "published",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  /* A content block stores the whole delivery URL rather than an id, because
     the sections that render it know nothing about Cloudinary. The lookup has
     to find it inside that string. */
  await mongoose.connection.collection("sitecontents").insertOne({
    key: "clients",
    data: {
      logos: [
        {
          name: "A client",
          image: `https://res.cloudinary.com/docmeet-web-app/image/upload/v1/${IN_BLOCK}.png`,
        },
      ],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  });
});

test.afterAll(async () => {
  await mongoose.disconnect();
});

async function signIn(page: Page, who: { email: string; password: string }) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(who.email);
  await page.getByLabel("Password").fill(who.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).not.toHaveURL(/\/admin\/login/);
}

test.describe("Finding where an upload is used", () => {
  test("finds a project hero, a gallery shot and a section image", async () => {
    for (const publicId of [IN_HERO, IN_GALLERY, IN_SECTION_BODY]) {
      const uses = await findMediaUsage(publicId);
      expect(uses, publicId).toHaveLength(1);
      expect(uses[0].kind).toBe("project");
      expect(uses[0].label).toBe("A project with pictures");
      expect(uses[0].href).toMatch(/^\/admin\/projects\/[a-f0-9]{24}$/);
    }
  });

  test("finds a picture inside a post", async () => {
    const uses = await findMediaUsage(IN_POST);
    expect(uses).toHaveLength(1);
    expect(uses[0].kind).toBe("post");
    expect(uses[0].label).toBe("A post with a diagram");
  });

  test("finds one stored as a delivery URL in a page section", async () => {
    const uses = await findMediaUsage(IN_BLOCK);
    expect(uses).toHaveLength(1);
    expect(uses[0].kind).toBe("section");
    /* The editor's own name for the block, not the storage key. */
    expect(uses[0].label).not.toBe("clients");
    expect(uses[0].href).toBe("/admin/content/clients");
  });

  test("says nothing for a file nothing points at", async () => {
    expect(await findMediaUsage(UNUSED)).toEqual([]);
  });

  test("does not mistake a longer id for the one it was asked about", async () => {
    /* The section search matches a substring of a URL, so an id that is the
       prefix of another would otherwise report a file as permanently in use
       and make it undeletable. */
    expect(await findMediaUsage("docerity/content/log")).toEqual([]);
    expect(await findMediaUsage("docerity/projects/hero")).toEqual([]);
  });

  test("says nothing at all for an empty id", async () => {
    /* Not a theoretical input: it is what a malformed call sends, and an empty
       string matched as a substring would report every section as a use. */
    expect(await findMediaUsage("")).toEqual([]);
  });
});

test.describe("The media page", () => {
  test("offers a delete on every file it lists", async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto("/admin/media");

    await expect(page.getByRole("heading", { name: "Media", exact: true })).toBeVisible();

    /*
      This run has no Cloudinary credentials — `scripts/integration.mjs` blanks
      them so nothing reaches the real account — so the page explains that
      instead of rendering a grid, and that is what is asserted here. The two
      branches below are for a run that does have them.

      The list is addressed by name rather than by position, because the page
      has another list in it: the admin nav. With no grid at all,
      `getByRole("list").last()` finds the nav and then hunts for a delete
      button inside it, which is how this test failed the first time.
    */
    if (await page.getByText(/Storage is not configured/).isVisible()) {
      await expect(page.getByRole("list", { name: /^Uploaded / })).toHaveCount(0);
      return;
    }

    const cards = page
      .getByRole("list", { name: "Uploaded images" })
      .getByRole("listitem");
    const count = await cards.count();

    if (count === 0) {
      await expect(page.getByText(/Nothing here yet/)).toBeVisible();
      return;
    }

    const first = cards.first();
    await expect(first.getByRole("button", { name: /^Delete / })).toBeVisible();

    /* Pressing it asks rather than deletes, and the question is answerable
       either way. Nothing is removed here: the file belongs to a real account. */
    await first.getByRole("button", { name: /^Delete / }).click();
    await expect(first.getByRole("button", { name: "Keep" })).toBeVisible();
    await first.getByRole("button", { name: "Keep" }).click();
    await expect(first.getByRole("button", { name: "Copy address" })).toBeVisible();
  });
});

test.describe("The mailing list", () => {
  test.beforeAll(async () => {
    await mongoose.connection.collection("subscribers").insertOne({
      email: "reader@c.test",
      status: "subscribed",
      unsubscribeToken: "a-token-for-the-test",
      source: "site",
      unsubscribedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  test("takes somebody off the list and puts them back", async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto("/admin/subscribers");

    const row = page.getByRole("row", { name: /reader@c\.test/ });
    await expect(row).toBeVisible();

    await row.getByRole("button", { name: "Unsubscribe" }).click();

    /*
      The status badge, not the button. The button flips the moment it is
      pressed — the row answers the press and is put back if the server
      disagrees — so waiting on it and then reading the database is a race the
      test loses about half the time. The badge is server-rendered from the
      stored document, so it changing means the write landed.
    */
    await expect(row.getByText("unsubscribed", { exact: true })).toBeVisible();
    await expect(row.getByRole("button", { name: "Resubscribe" })).toBeVisible();

    const stored = await mongoose.connection
      .collection("subscribers")
      .findOne({ email: "reader@c.test" });
    expect(stored?.status).toBe("unsubscribed");
    /* Unsubscribing records when, because "did they ask, or did we drop
       them?" is the question this answers months later. */
    expect(stored?.unsubscribedAt).toBeInstanceOf(Date);

    await row.getByRole("button", { name: "Resubscribe" }).click();
    await expect(row.getByText("subscribed", { exact: true })).toBeVisible();
    await expect(row.getByRole("button", { name: "Unsubscribe" })).toBeVisible();
  });

  test("erases an address only after a second press", async ({ page }) => {
    await mongoose.connection.collection("subscribers").insertOne({
      email: "typo@c.test",
      status: "subscribed",
      unsubscribeToken: "another-token-for-the-test",
      source: "site",
      unsubscribedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await signIn(page, OWNER);
    await page.goto("/admin/subscribers");

    const row = page.getByRole("row", { name: /typo@c\.test/ });
    await row.getByRole("button", { name: "Erase typo@c.test" }).click();

    /* Still there: the first press only asks. */
    expect(
      await mongoose.connection.collection("subscribers").countDocuments({ email: "typo@c.test" })
    ).toBe(1);

    await row.getByRole("button", { name: "Erase for good" }).click();

    /* The row goes, rather than being dimmed: the action revalidates the page,
       so the table and the counts above it re-render without it. */
    await expect(row).toHaveCount(0);

    expect(
      await mongoose.connection.collection("subscribers").countDocuments({ email: "typo@c.test" })
    ).toBe(0);
  });
});
