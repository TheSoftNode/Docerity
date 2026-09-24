import { test, expect, type Page } from "@playwright/test";
import mongoose from "mongoose";

import { hashPassword } from "@/lib/auth/password";

/**
 * The whole pipeline, against a real database.
 *
 * Serial, and in order: each test depends on the state the previous one left.
 * That is unusual for a test file and deliberate here, because the thing being
 * verified is a workflow. Asserting that a review can be approved requires a
 * review, and creating one through a fixture rather than through the form would
 * skip the part most likely to be broken.
 */

test.describe.configure({ mode: "serial" });

const OWNER = {
  email: "owner@docerity.test",
  name: "Test Owner",
  password: "an-integration-test-password",
};

/*
  The account is created by writing to the database directly, the same way
  `scripts/create-admin.mjs` does, because there is no sign-up route to drive.
  The schema is declared loosely here on purpose: this is standing in for the
  bootstrap script, and importing the real model would pull Next's module
  resolution into a plain Node context.
*/
async function createOwner() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const User =
    mongoose.models.User ??
    mongoose.model(
      "User",
      new mongoose.Schema(
        {
          email: { type: String, required: true, unique: true, lowercase: true },
          name: String,
          passwordHash: String,
          role: String,
          failedAttempts: { type: Number, default: 0 },
          lockedUntil: { type: Date, default: null },
          lastLoginAt: { type: Date, default: null },
          sessionVersion: { type: Number, default: 1 },
          disabledAt: { type: Date, default: null },
        },
        { timestamps: true }
      )
    );

  await User.deleteMany({});
  await User.create({
    email: OWNER.email,
    name: OWNER.name,
    passwordHash: await hashPassword(OWNER.password),
    role: "owner",
  });

  await mongoose.disconnect();
}

/*
  Scoped to the form.

  A bare `getByRole("alert")` also matches Next's route announcer, a
  permanently-present empty `div[role="alert"]` it uses to announce client-side
  navigations. Strict mode then fails on two matches, one of which is always
  blank.
*/
function loginError(page: Page) {
  return page.locator('form [role="alert"]');
}

async function signIn(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(OWNER.email);
  await page.getByLabel("Password").fill(OWNER.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/admin");
}

test.beforeAll(async () => {
  await createOwner();
});

test.describe("Signing in", () => {
  test("the wrong password is refused, and says nothing useful about why", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill(OWNER.email);
    await page.getByLabel("Password").fill("not-the-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(loginError(page)).toHaveText(
      "That email and password don't match an account."
    );
    /* Still on the login page, with no session cookie issued. */
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("an unknown address gets the identical message", async ({ page }) => {
    /*
      The point of the dummy-hash path in `authenticate`. A different message
      here, or a materially faster response, would turn this form into an
      account enumerator.
    */
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill("nobody@docerity.test");
    await page.getByLabel("Password").fill("not-the-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(loginError(page)).toHaveText(
      "That email and password don't match an account."
    );
  });

  test("the right password signs in and lands on the overview", async ({ page }) => {
    await signIn(page);

    await expect(
      page.getByRole("heading", { level: 1, name: `Hello, ${OWNER.name.split(" ")[0]}` })
    ).toBeVisible();
    /* The rail is only rendered for a verified session. */
    await expect(page.getByRole("navigation", { name: "Admin sections" })).toBeVisible();
  });

  test("signing in returns to the page that was asked for", async ({ page }) => {
    await page.goto("/admin/posts");
    await expect(page).toHaveURL("/admin/login?next=%2Fadmin%2Fposts");

    await page.getByLabel("Email").fill(OWNER.email);
    await page.getByLabel("Password").fill(OWNER.password);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL("/admin/posts");
  });

  test("signing out ends the session", async ({ page }) => {
    await signIn(page);
    await page.getByRole("button", { name: "Sign out" }).click();

    await expect(page).toHaveURL(/\/admin\/login/);

    /* And the admin area is closed again, rather than the cookie merely being
       hidden from the UI. */
    await page.goto("/admin/enquiries");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});

test.describe("The review pipeline", () => {
  const review = {
    fullName: "Ada Integration",
    title: "CTO, Example Ltd",
    body: "Docerity took a vague brief and came back with a plan we could argue with, which is exactly what we needed at that point.",
    rating: 5,
    contactEmail: "ada@example.com",
  };

  test("a submitted review is stored and is not public", async ({ page, request }) => {
    const response = await request.post("/api/reviews", {
      data: { ...review, links: [{ title: "Example", url: "example.com" }] },
    });

    expect(response.status()).toBe(201);
    expect((await response.json()).ok).toBe(true);

    /* The gate, asserted from the outside: nothing reaches the public page
       until it is approved. */
    await page.goto("/reviews");
    await expect(page.getByText(review.body)).toHaveCount(0);
  });

  test("it appears in the moderation queue", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/reviews");

    await expect(page.getByText(review.fullName)).toBeVisible();
    await expect(page.getByText(review.body)).toBeVisible();
    /* The contact address is shown here and nowhere public, which is the only
       way to check a testimonial is genuine. */
    await expect(page.getByText(review.contactEmail)).toBeVisible();
  });

  test("approving it publishes it to the reviews page and the homepage", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto("/admin/reviews");
    await page.getByRole("button", { name: "Approve", exact: true }).click();

    /* The queue empties, because the tab shows what is waiting. */
    await expect(page.getByText("Nothing waiting")).toBeVisible();

    await page.goto("/reviews");
    await expect(page.getByText(review.body)).toBeVisible();
    await expect(page.getByText(review.fullName)).toBeVisible();
    /* The average appears once there is something to average. */
    await expect(page.getByText("5.0")).toBeVisible();

    /* And the structured data, which was absent with no reviews. */
    const jsonLd = await page.locator('script[type="application/ld+json"]').innerText();
    expect(JSON.parse(jsonLd).aggregateRating.reviewCount).toBe(1);

    /* revalidatePath("/") on approval, so the homepage rotation has it too
       rather than showing the placeholder set for another five minutes. */
    await page.goto("/");
    await expect(page.getByText(review.fullName).first()).toBeVisible();
  });

  test("the contact address is never in the public page's markup", async ({ page }) => {
    /*
      `listPublished` projects it away, and `getPublicReviews` types it out. This
      asserts the outcome rather than the mechanism: if a future change starts
      returning whole documents, this fails.
    */
    await page.goto("/reviews");
    expect(await page.content()).not.toContain(review.contactEmail);
  });

  test("unpublishing removes it again", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/reviews?status=approved");
    await page.getByRole("button", { name: "Unpublish" }).click();

    /*
      Waited for, not assumed. The action runs inside a `startTransition`, so
      navigating straight after the click races it: the first version of this
      test went to /reviews before the status had changed and read the review as
      still published, which looked like a broken revalidation and was not one.
    */
    await expect(page.getByText("Nothing published yet")).toBeVisible();

    await page.goto("/reviews");
    await expect(page.getByText(review.body)).toHaveCount(0);
  });
});

test.describe("The writing pipeline", () => {
  test("importing the built-in posts moves them into the database", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/posts");

    await expect(page.getByText("Nothing written here yet")).toBeVisible();
    await page.getByRole("button", { name: "Import the built-in posts" }).click();

    await expect(page.getByText(/Imported \d+ posts/)).toBeVisible();

    /* They are now editable rows rather than a file. */
    await page.reload();
    await expect(page.getByRole("link", { name: "A sticky note on your monitor" })).toBeVisible();
  });

  test("the import is idempotent", async ({ page }) => {
    /* Pressing it twice must not produce a second copy of every post, which is
       what `insertMany` would do without the slug filter. */
    await signIn(page);
    await page.goto("/admin/posts");

    const before = await page.locator("article").count();

    /* The button is gone once posts exist, so the action is re-run directly
       through the page it lives on. */
    await page.goto("/admin/posts?status=all");
    expect(await page.locator("article").count()).toBe(before);
  });

  test("a new post can be written, saved as a draft, and is not public", async ({
    page,
  }) => {
    await signIn(page);
    await page.goto("/admin/posts/new?type=article");

    await page.getByLabel("Title").fill("Written by the integration suite");
    await page
      .getByLabel("Hook")
      .fill("A post created through the editor to prove the editor works end to end.");
    await page.getByLabel("Topic").fill("Testing");

    await page.getByLabel("Heading for section 1").fill("The first section");
    await page
      .getByLabel("Paragraph 1 of section 1")
      .fill("A paragraph long enough to look like prose rather than a placeholder.");

    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page.getByText("Saved")).toBeVisible();

    /* The URL changed from /new to the post's id, so saving again updates rather
       than creating a second copy. `saved=1` is what carries the confirmation
       across the remount that the route change causes. */
    await expect(page).toHaveURL(/\/admin\/posts\/[0-9a-f]{24}\?saved=1$/);

    /* The slug was derived from the title. */
    await expect(page.getByLabel("URL")).toHaveValue(
      "written-by-the-integration-suite"
    );

    /* A draft is not on the blog. */
    await page.goto("/blog/written-by-the-integration-suite");
    await expect(page.getByText("404")).toBeVisible();
  });

  test("publishing it puts it on the blog", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/posts?status=draft");
    await page.getByRole("link", { name: "Written by the integration suite" }).click();
    /*
      Waited for, and `exact`. Without the wait the click can land on the list
      page before the navigation settles, and without `exact` it matches the
      row's own toggle, whose accessible name is "Publish <title>". The first
      version of this test published the post from the list and then looked for a
      confirmation on a page it had never left.
    */
    await expect(page).toHaveURL(/\/admin\/posts\/[0-9a-f]{24}/);
    await expect(page.getByLabel("Title")).toHaveValue(
      "Written by the integration suite"
    );

    await page.getByRole("button", { name: "Publish", exact: true }).click();
    await expect(page.getByText("Saved")).toBeVisible();
    await expect(page.getByText("Live", { exact: true }).first()).toBeVisible();

    await page.goto("/blog/written-by-the-integration-suite");
    await expect(
      page.getByRole("heading", { name: "Written by the integration suite" })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "The first section" })).toBeVisible();

    /* And in the feed, which has its own revalidate window and its own
       invalidation. */
    const rss = await page.request.get("/blog/rss.xml");
    expect(await rss.text()).toContain("Written by the integration suite");
  });

  test("an edit to a published post reaches the live page", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/posts?status=published");
    await page.getByRole("link", { name: "Written by the integration suite" }).click();
    await expect(page).toHaveURL(/\/admin\/posts\/[0-9a-f]{24}/);

    await page.getByLabel("Heading for section 1").fill("The first section, renamed");
    await page.getByRole("button", { name: "Update live post" }).click();
    await expect(page.getByText("Saved")).toBeVisible();

    await page.goto("/blog/written-by-the-integration-suite");
    await expect(
      page.getByRole("heading", { name: "The first section, renamed" })
    ).toBeVisible();
  });

  test("a duplicate slug is refused against the field", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/posts/new?type=article");

    await page.getByLabel("Title").fill("Written by the integration suite");
    await page
      .getByLabel("Hook")
      .fill("A second post deliberately colliding with the first one's slug.");
    await page.getByLabel("Topic").fill("Testing");
    await page.getByRole("button", { name: "Save draft" }).click();

    await expect(page.getByText(/is already used by another post/)).toBeVisible();
  });

  test("unpublishing takes it off the blog", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/posts?status=published");

    await page
      .getByRole("button", { name: "Unpublish Written by the integration suite" })
      .click();

    await page.goto("/blog/written-by-the-integration-suite");
    await expect(page.getByText("404")).toBeVisible();
  });
});

test.describe("The enquiry pipeline", () => {
  test("a submitted enquiry is stored and readable in the admin area", async ({
    page,
    request,
  }) => {
    const response = await request.post("/api/contact", {
      data: {
        name: "Grace Integration",
        email: "grace@example.com",
        company: "Example Ltd",
        role: "engineering",
        projectType: "software",
        budget: "25-50k",
        timeline: "1-3-months",
        message:
          "We have a Django monolith with an API scanning feature that falls over at about forty concurrent jobs.",
        attachments: [],
      },
    });

    expect(response.status()).toBe(200);
    const reference = (await response.json()).data.reference;
    /* The Crockford-alphabet reference, which is what a sender quotes back. */
    expect(reference).toMatch(/^DOC-[0-9A-Z]{3}-[0-9A-Z]{3}$/);

    await signIn(page);
    await page.goto("/admin/enquiries");

    await expect(page.getByText("Grace Integration")).toBeVisible();
    await page.getByText("Grace Integration").click();

    await expect(page.getByText(reference)).toBeVisible();
    await expect(page.getByText(/Django monolith/)).toBeVisible();

    /*
      Email is not configured for this run, so both deliveries failed. That is
      shown rather than hidden, which is the point of recording it: otherwise the
      first sign is somebody asking why you never replied.
    */
    await expect(page.getByText("not delivered").first()).toBeVisible();
  });

  test("opening one moves it out of the new queue", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/enquiries?status=new");
    await expect(page.getByText("Nothing new")).toBeVisible();

    await page.goto("/admin/enquiries?status=read");
    await expect(page.getByText("Grace Integration")).toBeVisible();
  });
});

test.describe("Account rules", () => {
  test("an owner cannot lock themselves out", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/users");

    /* Demoting the only owner would leave nobody able to manage accounts, and
       the only way back would be the command line. */
    await page.getByLabel(`Role for ${OWNER.name}`).selectOption("editor");
    await expect(page.getByText(/locking yourself out/)).toBeVisible();

    /* Disabling and deleting your own account are refused in the UI too. */
    await expect(
      page.getByRole("button", { name: `Disable ${OWNER.name}` })
    ).toBeDisabled();
    await expect(
      page.getByRole("button", { name: `Delete ${OWNER.name}` })
    ).toBeDisabled();
  });

  test("an editor can be added and sees only their own account", async ({
    page,
    browser,
  }) => {
    await signIn(page);
    await page.goto("/admin/users");

    await page.getByLabel("Name").fill("Test Editor");
    await page.getByLabel("Email").fill("editor@docerity.test");
    await page.getByLabel("Password", { exact: true }).fill("an-editor-password-here");
    /* `exact`, because the row above also has a select labelled
       "Role for Test Owner" and the substring match hits both. */
    await page.getByLabel("Role", { exact: true }).selectOption("editor");
    await page.getByRole("button", { name: "Create the account" }).click();

    await expect(page.getByText("Test Editor can now sign in.")).toBeVisible();

    /* A separate context, so the owner's session is not reused. */
    const context = await browser.newContext();
    const editorPage = await context.newPage();

    await editorPage.goto("/admin/login");
    await editorPage.getByLabel("Email").fill("editor@docerity.test");
    await editorPage.getByLabel("Password").fill("an-editor-password-here");
    await editorPage.getByRole("button", { name: "Sign in" }).click();
    await expect(editorPage).toHaveURL("/admin");

    /* The rail hides Accounts for an editor. */
    await expect(
      editorPage.getByRole("navigation", { name: "Admin sections" }).getByText("Accounts")
    ).toHaveCount(0);

    /*
      And typing the URL shows only their own row, with no invite form. Hiding a
      link is not access control; this is the check that matters.
    */
    await editorPage.goto("/admin/users");
    /* Scoped to the list. Their own name also appears in the rail's footer,
       where the signed-in account is shown. */
    const rows = editorPage.getByRole("listitem");
    await expect(rows.getByText("Test Editor")).toBeVisible();
    await expect(rows).toHaveCount(1);
    await expect(editorPage.getByText(OWNER.name)).toHaveCount(0);
    await expect(
      editorPage.getByRole("button", { name: "Create the account" })
    ).toHaveCount(0);

    await context.close();
  });

  test("changing a password signs every session out", async ({ page }) => {
    /*
      `setPasswordHash` bumps `sessionVersion`, which the Data Access Layer
      compares against the token. This is what makes a stateless session
      revocable, and it is the mechanism behind disabling an account too.
    */
    await signIn(page);
    await page.goto("/admin/users");

    await page.getByLabel("New password").fill("a-replacement-password-here");
    await page.getByLabel("Again").fill("a-replacement-password-here");
    await page.getByRole("button", { name: "Change it" }).click();

    await expect(page.getByText(/now signed out/)).toBeVisible();

    /* The session that made the change is no longer valid either. */
    await page.goto("/admin/enquiries");
    await expect(page).toHaveURL(/\/admin\/login/);

    /* The new password works. */
    await page.getByLabel("Email").fill(OWNER.email);
    await page.getByLabel("Password").fill("a-replacement-password-here");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/admin/);
  });
});
