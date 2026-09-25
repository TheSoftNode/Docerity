import { test, expect, type Page } from "@playwright/test";
import mongoose from "mongoose";

import { hashPassword } from "@/lib/auth/password";

/**
 * The contributor rules, against a real database.
 *
 * These exist because every one of them is a rule that is invisible in the UI
 * once it works: a hidden nav item and a refused action look identical from the
 * outside until somebody types a URL.
 */

test.describe.configure({ mode: "serial" });

const OWNER = { email: "owner@d.test", name: "Test Owner", password: "an-owner-password-here" };
const MENTEE = { email: "mentee@d.test", name: "Ada Mentee", password: "a-mentee-password-here" };

async function reset() {
  await mongoose.connect(process.env.MONGODB_URI!);
  /* Every collection this file touches, so it does not inherit whatever
     `pipeline.spec.ts` left behind, in whichever order the two run. */
  for (const name of ["users", "posts", "reviews", "enquiries", "subscribers"]) {
    await mongoose.connection.collection(name).deleteMany({});
  }
  await mongoose.connection.collection("users").insertOne({
    email: OWNER.email, name: OWNER.name, passwordHash: await hashPassword(OWNER.password),
    role: "owner", failedAttempts: 0, lockedUntil: null, lastLoginAt: null,
    sessionVersion: 1, disabledAt: null, inviteTokenHash: "", inviteExpiresAt: null,
    createdAt: new Date(), updatedAt: new Date(),
  });
  await mongoose.disconnect();
}

async function signIn(page: Page, who: { email: string; password: string }) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(who.email);
  await page.getByLabel("Password").fill(who.password);
  await page.getByRole("button", { name: "Sign in" }).click();

  /*
    Waited for, and not by asserting a specific URL: an owner lands on /admin
    and a contributor on /admin/posts. Without the wait, the next `goto` races
    the redirect, arrives before the session cookie is set, and gets bounced
    back to the login page, which fails with a confusing "field not found".
  */
  await expect(page).not.toHaveURL(/\/admin\/login/);
}

test.beforeAll(reset);

let inviteLink = "";

test.describe("Inviting a contributor", () => {
  test("the owner gets a one-time link rather than inventing a password", async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto("/admin/users");

    await page.getByLabel("Name").fill(MENTEE.name);
    await page.getByLabel("Email").fill(MENTEE.email);
    await page.getByLabel("Role", { exact: true }).selectOption("contributor");

    /* No password field at all: the point of the change. */
    await expect(page.getByLabel("Password", { exact: true })).toHaveCount(0);

    await page.getByRole("button", { name: "Create the invitation" }).click();
    await expect(page.getByText("One-time link")).toBeVisible();

    inviteLink = (await page.getByText(/\/admin\/invite\//).first().innerText()).trim();
    expect(inviteLink).toContain("/admin/invite/");

    /* The account exists but cannot be signed in to yet. */
    await expect(page.getByText("Invited")).toBeVisible();
  });

  test("the invited account cannot sign in before claiming it", async ({ page }) => {
    /* Not through `signIn`, which waits for a successful sign-in: this attempt
       is meant to fail, and the account has no password yet to succeed with. */
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(MENTEE.email);
    await page.getByLabel("Password").fill(MENTEE.password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.locator('form [role="alert"]')).toHaveText(
      "That email and password don't match an account."
    );
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("the invite link is reachable while signed out", async ({ page }) => {
    /* The proxy redirects everything under /admin to login. Somebody claiming
       an account has no session by definition, so this exclusion is the whole
       flow working or not. */
    const path = new URL(inviteLink).pathname;
    await page.goto(path);
    await expect(page).toHaveURL(path);
    await expect(page.getByRole("heading", { name: /Welcome, Ada/ })).toBeVisible();
    /* The role is stated, so they know what they are joining as. */
    await expect(page.getByText(/contributor/i)).toBeVisible();
  });

  test("claiming it sets their password and signs them in", async ({ page }) => {
    await page.goto(new URL(inviteLink).pathname);
    await page.getByLabel("Choose a password").fill(MENTEE.password);
    await page.getByLabel("Again").fill(MENTEE.password);
    await page.getByRole("button", { name: /Set my password/ }).click();

    /* Straight to Writing, not the overview: a contributor cannot open any of
       the things the overview counts. */
    await expect(page).toHaveURL("/admin/posts");
  });

  test("the link works once", async ({ page }) => {
    await page.goto(new URL(inviteLink).pathname);
    await expect(page.getByRole("heading", { name: "This link has expired" })).toBeVisible();
  });
});

test.describe("What a contributor can reach", () => {
  test("the rail shows Writing and nothing else", async ({ page }) => {
    await signIn(page, MENTEE);
    const rail = page.getByRole("navigation", { name: "Admin sections" });

    await expect(rail.getByText("Writing")).toBeVisible();
    for (const hidden of ["Overview", "Enquiries", "Reviews", "Subscribers", "Accounts"]) {
      await expect(rail.getByText(hidden)).toHaveCount(0);
    }
  });

  test("typing a staff URL redirects rather than showing it", async ({ page }) => {
    await signIn(page, MENTEE);

    /* Hiding a nav item is not access control. This is the check that matters. */
    for (const path of ["/admin", "/admin/enquiries", "/admin/reviews", "/admin/subscribers"]) {
      await page.goto(path);
      await expect(page).toHaveURL("/admin/posts");
    }
  });

  test("the subscriber export refuses them with 403", async ({ page }) => {
    await signIn(page, MENTEE);

    /*
      `page.request`, not the `request` fixture. The fixture has its own cookie
      jar, so it would arrive with no session and answer 401, which would pass a
      weaker version of this test for the wrong reason. This one shares the
      browser context's cookies and is genuinely signed in as the contributor.
    */
    const response = await page.request.get("/api/admin/subscribers/export");

    /* 403, not 401: they are signed in, just not allowed. */
    expect(response.status()).toBe(403);
    expect((await response.json()).error.code).toBe("forbidden");
  });

  test("Accounts shows only their own row and no invite form", async ({ page }) => {
    await signIn(page, MENTEE);
    await page.goto("/admin/users");

    const rows = page.getByRole("listitem");
    await expect(rows).toHaveCount(1);
    await expect(rows.getByText(MENTEE.name)).toBeVisible();
    await expect(page.getByRole("button", { name: "Create the invitation" })).toHaveCount(0);
  });
});

test.describe("Writing as a contributor", () => {
  test("they can draft, and the editor offers Submit rather than Publish", async ({ page }) => {
    await signIn(page, MENTEE);
    await page.goto("/admin/posts/new?type=article");

    await expect(page.getByRole("button", { name: "Publish" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Submit for review" })).toBeVisible();

    await page.getByLabel("Title").fill("What a database index actually does");
    await page.getByLabel("Hook").fill("Why adding one line made a slow query instant, explained properly.");
    await page.getByLabel("Topic").fill("Databases");
    await page.getByLabel("Heading for section 1").fill("The problem");
    await page.getByLabel("Paragraph 1 of section 1").fill("A query that scans every row gets slower as the table grows, which is the whole story.");

    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page).toHaveURL(/\/admin\/posts\/[0-9a-f]{24}\?saved=1$/);

    /* A draft is not on the blog. */
    await page.goto("/blog/what-a-database-index-actually-does");
    await expect(page.getByText("404")).toBeVisible();
  });

  test("submitting puts it in the queue and still does not publish it", async ({ page }) => {
    await signIn(page, MENTEE);
    await page.goto("/admin/posts?status=draft");
    await page.getByRole("link", { name: "What a database index actually does" }).click();
    await expect(page).toHaveURL(/\/admin\/posts\/[0-9a-f]{24}/);

    await page.getByRole("button", { name: "Submit for review" }).click();
    await expect(page.getByText("Waiting to be read")).toBeVisible();

    await page.goto("/blog/what-a-database-index-actually-does");
    await expect(page.getByText("404")).toBeVisible();
  });

  test("the owner sees it in the submitted queue, with the byline", async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto("/admin/posts?status=submitted");

    await expect(page.getByText("What a database index actually does")).toBeVisible();
    await expect(page.getByText(`by ${MENTEE.name}`)).toBeVisible();
  });

  test("the owner publishes it and the byline is on the live post", async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto("/admin/posts?status=submitted");
    await page.getByRole("link", { name: "What a database index actually does" }).click();
    await expect(page).toHaveURL(/\/admin\/posts\/[0-9a-f]{24}/);

    await page.getByRole("button", { name: "Publish", exact: true }).click();
    await expect(page.getByText("Saved")).toBeVisible();

    await page.goto("/blog/what-a-database-index-actually-does");
    await expect(page.getByText("Written by")).toBeVisible();
    await expect(page.getByText(MENTEE.name)).toBeVisible();
    /* `exact`, because the author is called "Ada Mentee" and the loose match
       hits the name as well as the marker. */
    await expect(page.getByText("Mentee", { exact: true })).toBeVisible();
  });

  test("once live, the contributor can no longer edit it", async ({ page }) => {
    /*
      Without this, "cannot publish" would be decorative: submit something
      harmless, wait for approval, then rewrite the body in place.
    */
    await signIn(page, MENTEE);
    await page.goto("/admin/posts");

    await expect(page.getByText("What a database index actually does")).toBeVisible();
    await expect(page.getByRole("link", { name: /^Edit / })).toHaveCount(0);
  });
});
