import { test, expect, type Page } from "@playwright/test";
import mongoose from "mongoose";

import { hashPassword } from "@/lib/auth/password";

/**
 * The work section, against a real database.
 *
 * The import is the load-bearing part: twenty-five real projects are already
 * on the site from a file, and moving them into the database must not lose or
 * reorder any of them.
 */

test.describe.configure({ mode: "serial" });

const OWNER = { email: "owner@d.test", name: "Test Owner", password: "an-owner-password-here" };

test.beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
  for (const name of ["users", "projects", "posts", "reviews"]) {
    await mongoose.connection.collection(name).deleteMany({});
  }
  await mongoose.connection.collection("users").insertOne({
    email: OWNER.email, name: OWNER.name, passwordHash: await hashPassword(OWNER.password),
    role: "owner", failedAttempts: 0, lockedUntil: null, lastLoginAt: null,
    sessionVersion: 1, disabledAt: null, inviteTokenHash: "", inviteExpiresAt: null,
    createdAt: new Date(), updatedAt: new Date(),
  });
  await mongoose.disconnect();
});

async function signIn(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(OWNER.email);
  await page.getByLabel("Password").fill(OWNER.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).not.toHaveURL(/\/admin\/login/);
}

test.describe("Before anything is imported", () => {
  test("the work page still serves the twenty-five built into the code", async ({ page }) => {
    /* The fallback is the whole point: an empty database must not empty the
       work page. */
    await page.goto("/work");
    await expect(page.getByRole("heading", { name: /EEP, view project/ })).toBeVisible();
  });
});

test.describe("Importing", () => {
  test("moves all twenty-five in, in order", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/work");

    await expect(page.getByText("Nothing here yet")).toBeVisible();
    await page.getByRole("button", { name: /Import the 25 existing/ }).click();
    await expect(page.getByText(/Imported 25 projects/)).toBeVisible();

    await page.reload();
    const rows = page.locator("article");
    await expect(rows).toHaveCount(25);
    /* Order preserved from the file: EEP is first on the site today. */
    await expect(rows.first()).toContainText("EEP");
  });

  test("is idempotent", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/work");
    await expect(page.locator("article")).toHaveCount(25);
    /* The button is gone once rows exist, which is the affordance; the action
       itself is guarded by the slug filter. */
    await expect(page.getByRole("button", { name: /Import the 25/ })).toHaveCount(0);
  });

  test("the public page now reads from the database", async ({ page }) => {
    await page.goto("/work");
    await expect(page.getByRole("heading", { name: /EEP, view project/ })).toBeVisible();
    /* The screenshots imported with their public/ paths rather than being lost. */
    await expect(page.locator('img[src*="eep"]').first()).toBeVisible();
  });
});

test.describe("Adding a project", () => {
  test("a draft is not on the site", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/work/new");

    await page.getByLabel("Name").fill("Harbour");
    await page.getByLabel("Caption").fill("Web3 · Settlement");
    await page
      .getByLabel("What it does")
      .fill("A settlement layer that nets cross-border payments before they touch a chain, so fees are paid once rather than per transfer.");
    await page.getByRole("button", { name: "Web3", exact: true }).click();
    await page.getByLabel("Tech").fill("Solidity, Next.js");
    await page.getByLabel("Live URL").fill("harbour.example");

    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page).toHaveURL(/\/admin\/work\/[0-9a-f]{24}\?saved=1$/);
    /* `exact`, because the sidebar also has a "Live URL" field and the loose
       match hits both. */
    await expect(page.getByLabel("URL", { exact: true })).toHaveValue("harbour");

    await page.goto("/work/harbour");
    await expect(page.getByText("404")).toBeVisible();
  });

  test("publishing puts it on the work page", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/work");
    await page.getByRole("link", { name: "Harbour" }).click();
    await expect(page).toHaveURL(/\/admin\/work\/[0-9a-f]{24}/);

    await page.getByRole("button", { name: "Publish", exact: true }).click();
    await expect(page.getByText("Saved")).toBeVisible();

    await page.goto("/work/harbour");
    await expect(page.getByRole("heading", { name: "Harbour" })).toBeVisible();
    /* The bare hostname was normalised into a usable href. */
    await expect(page.locator('a[href="https://harbour.example/"]').first()).toBeVisible();
  });

  test("featuring it puts it on the homepage", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/work");
    await page.getByRole("button", { name: "Show Harbour on the homepage" }).click();
    await expect(
      page.getByRole("button", { name: "Remove Harbour from the homepage" })
    ).toBeVisible();

    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Harbour, view project/ })).toBeVisible();
  });

  test("unpublishing takes it off again", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/work");
    await page.getByRole("button", { name: "Unpublish Harbour" }).click();
    await expect(page.getByRole("button", { name: "Publish Harbour" })).toBeVisible();

    await page.goto("/work/harbour");
    await expect(page.getByText("404")).toBeVisible();
  });
});

test.describe("Rules", () => {
  test("a duplicate slug is refused against the field", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/work/new");

    await page.getByLabel("Name").fill("EEP");
    await page
      .getByLabel("What it does")
      .fill("A second project deliberately colliding with an imported slug, to prove the check.");
    await page.getByRole("button", { name: "Save draft" }).click();

    await expect(page.getByText(/is already used by another project/)).toBeVisible();
  });

  test("publishing with no bucket is refused", async ({ page }) => {
    /* A published project with no group is invisible to every filter except
       All, which looks like the filters are broken. */
    await signIn(page);
    await page.goto("/admin/work/new");

    await page.getByLabel("Name").fill("Bucketless");
    await page
      .getByLabel("What it does")
      .fill("A project with no filter bucket at all, used to prove publishing refuses it.");
    await page.getByRole("button", { name: "Publish", exact: true }).click();

    await expect(page.getByText(/at least one bucket/)).toBeVisible();
  });

  test("a contributor cannot reach the work section", async ({ page, browser }) => {
    await signIn(page);
    await page.goto("/admin/users");
    await page.getByLabel("Name").fill("Ada Mentee");
    await page.getByLabel("Email").fill("mentee@d.test");
    await page.getByLabel("Role", { exact: true }).selectOption("contributor");
    await page.getByRole("button", { name: "Create the invitation" }).click();
    const link = (await page.getByText(/\/admin\/invite\//).first().innerText()).trim();

    const context = await browser.newContext();
    const menteePage = await context.newPage();
    await menteePage.goto(new URL(link).pathname);
    await menteePage.getByLabel("Choose a password").fill("a-mentee-password-here");
    await menteePage.getByLabel("Again").fill("a-mentee-password-here");
    await menteePage.getByRole("button", { name: /Set my password/ }).click();
    await expect(menteePage).toHaveURL("/admin/posts");

    /* Not in the rail, and not reachable by typing it. */
    await expect(
      menteePage.getByRole("navigation", { name: "Admin sections" }).getByText("Work")
    ).toHaveCount(0);
    await menteePage.goto("/admin/work");
    await expect(menteePage).toHaveURL("/admin/posts");

    /* And the upload endpoint refuses them rather than relying on the page. */
    const response = await menteePage.request.post("/api/admin/work/upload", {
      data: { contentType: "image/png", bytes: 1000 },
    });
    expect(response.status()).toBe(403);

    await context.close();
  });
});
