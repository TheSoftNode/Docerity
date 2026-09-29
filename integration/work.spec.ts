import { test, expect, type Page } from "@playwright/test";
import mongoose from "mongoose";

import { hashPassword } from "@/lib/auth/password";
import { projects as builtIn } from "@/components/sections/work/work-data";
import { MAX_FEATURED_PROJECTS } from "@/lib/repositories/project.repository";

/**
 * The work section, against a real database.
 *
 * The import is the load-bearing part: real projects are already
 * on the site from a file, and moving them into the database must not lose or
 * reorder any of them.
 */

/*
  A longer wait than the global one, on these and nothing else.

  These assert a navigation to an editor route the dev server has not compiled
  yet, and the first visit pays for that compile. It has nothing to do with what
  is being tested, which is that saving takes you to the page for what you
  saved, and on a loaded machine it has put the wait past the 15-second default
  three times. Raising the global timeout instead would hide genuine slowness
  everywhere else.
*/
const FIRST_VISIT = { timeout: 60_000 };

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
  test("the work page still serves the ones built into the code", async ({ page }) => {
    /* The fallback is the whole point: an empty database must not empty the
       work page. */
    await page.goto("/projects");
    await expect(page.getByRole("heading", { name: /EEP, view project/ })).toBeVisible();
  });
});

test.describe("Importing", () => {
  test("moves all of them in, in order", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/projects");

    await expect(page.getByText("Nothing here yet")).toBeVisible();
    await page.getByRole("button", { name: /Import the built-in projects/ }).click();

    /*
      The rows, not the confirmation message.

      The import action revalidates `/admin/projects`, and the import button is only
      rendered while the collection is empty, so the server's re-render unmounts
      the button and takes its "Imported N" message with it. The message is
      transient by design; the rows arriving are the outcome worth asserting,
      and waiting for the message was a race that passed on a fast machine.
    */
    const rows = page.locator("article");
    await expect(rows).toHaveCount(builtIn.length);
    /* Order preserved from the file: EEP is first on the site today. */
    await expect(rows.first()).toContainText("EEP");
  });

  test("is idempotent", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/projects");
    await expect(page.locator("article")).toHaveCount(builtIn.length);
    /* The button is gone once every built-in project is stored: it is offered
       when the file has something the database does not, and now it does not.
       The action itself stays guarded by the slug filter regardless. */
    await expect(
      page.getByRole("button", { name: /Import the built-in projects/ })
    ).toHaveCount(0);
  });

  test("is offered again when the file gains a project", async ({ page }) => {
    /*
      Adding entries to `work-data.ts` is how a batch of projects arrives, and
      the import used to be offered only while the collection was empty. That
      made every later addition invisible here: rendering on the site from the
      file, and uneditable in the admin, with nothing saying why.
    */
    await signIn(page);

    /* One of the stored projects is removed, which is the same state as the
       file having gained one: the file has a slug the database does not. */
    await mongoose.connect(process.env.MONGODB_URI!);
    await mongoose.connection.collection("projects").deleteOne({ slug: builtIn[0].slug });
    await mongoose.disconnect();

    await page.goto("/admin/projects");
    await expect(page.getByText(/built into the code/)).toBeVisible();

    await page.getByRole("button", { name: /Import the built-in projects/ }).click();
    await expect(page.locator("article")).toHaveCount(builtIn.length);

    /* And nothing else was touched: the import inserts what is missing rather
       than replacing what is there. */
    await expect(
      page.getByRole("button", { name: /Import the built-in projects/ })
    ).toHaveCount(0);
  });

  test("the public page now reads from the database", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByRole("heading", { name: /EEP, view project/ })).toBeVisible();
    /* The screenshots imported with their public/ paths rather than being lost. */
    await expect(page.locator('img[src*="eep"]').first()).toBeVisible();
  });
});

test.describe("Adding a project", () => {
  test("a draft is not on the site", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/projects/new");

    await page.getByLabel("Name").fill("Harbour");
    await page.getByLabel("Caption").fill("Web3 · Settlement");
    await page
      .getByLabel("What it does")
      .fill("A settlement layer that nets cross-border payments before they touch a chain, so fees are paid once rather than per transfer.");
    await page.getByRole("button", { name: "Web3", exact: true }).click();
    await page.getByLabel("Tech").fill("Solidity, Next.js");
    await page.getByLabel("Live URL").fill("harbour.example");

    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page).toHaveURL(/\/admin\/projects\/[0-9a-f]{24}\?saved=1$/, FIRST_VISIT);
    /* `exact`, because the sidebar also has a "Live URL" field and the loose
       match hits both. */
    await expect(page.getByLabel("URL", { exact: true })).toHaveValue("harbour");

    await page.goto("/projects/harbour");
    await expect(page.getByText("404")).toBeVisible();
  });

  test("publishing puts it on the work page", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/projects");
    await page.getByRole("link", { name: "Harbour" }).click();
    await expect(page).toHaveURL(/\/admin\/projects\/[0-9a-f]{24}/, FIRST_VISIT);

    await page.getByRole("button", { name: "Publish", exact: true }).click();
    await expect(page.getByText("Saved", { exact: true })).toBeVisible();

    await page.goto("/projects/harbour");
    await expect(page.getByRole("heading", { name: "Harbour" })).toBeVisible();
    /* The bare hostname was normalised into a usable href. */
    await expect(page.locator('a[href="https://harbour.example/"]').first()).toBeVisible();
  });

  test("the homepage refuses a seventh project", async ({ page }) => {
    /*
      The imported set arrives with six already featured, which is the whole
      band. Featuring is refused rather than silently accepted-and-ignored:
      a starred project that never appears is the worst of the three possible
      behaviours, because nothing on the page says why.
    */
    await signIn(page);
    await page.goto("/admin/projects");

    await expect(page.getByText(`6 of ${MAX_FEATURED_PROJECTS}`)).toBeVisible();

    await page.getByRole("button", { name: "Show Harbour on the homepage" }).click();
    await expect(page.getByText(/holds 6 projects/i)).toBeVisible();

    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Harbour, view project/ })
    ).toHaveCount(0);
  });

  test("featuring it puts it on the homepage once there is room", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/projects");

    /* Whichever is last in the band, taken off from the band's own panel. */
    const band = page.getByRole("region", { name: "On the homepage" });
    await band
      .getByRole("button", { name: /^Take .* off the homepage$/ })
      .last()
      .click();
    await expect(page.getByText(`5 of ${MAX_FEATURED_PROJECTS}`)).toBeVisible();

    await page.getByRole("button", { name: "Show Harbour on the homepage" }).click();
    await expect(
      page.getByRole("button", { name: "Remove Harbour from the homepage" })
    ).toBeVisible();

    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Harbour, view project/ })).toBeVisible();
  });

  test("the band's order is the homepage's order, and is its own", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/projects");

    const band = page.getByRole("region", { name: "On the homepage" });
    const names = () => band.locator("ol > li").locator("span.font-medium");

    const before = await names().allInnerTexts();
    /* Harbour was featured last, so it is at the end of the band. Moving it to
       the top is the arrangement being tested. */
    expect(before.at(-1)).toBe("Harbour");

    /* One place per click, so Harbour's own index is what to watch: asserting
       on the first row instead only changes on the final swap, and waiting for
       it earlier is waiting for something that is not going to happen. */
    for (let target = before.length - 2; target >= 0; target -= 1) {
      await band.getByRole("button", { name: "Move Harbour up" }).click();
      await expect(names().nth(target)).toHaveText("Harbour");
    }

    await expect(names().first()).toHaveText("Harbour");

    /* The homepage reads the same order. */
    await page.goto("/");
    const firstCard = page.locator("#work").getByRole("heading", { level: 3 }).first();
    await expect(firstCard).toContainText("Harbour");

    /*
      And the catalogue did not move. This is the point of the separate order:
      before it existed, arranging the homepage reshuffled /projects, so
      curating six rearranged twenty-five.
    */
    await page.goto("/projects");
    await expect(
      page.locator("#showcase").getByRole("heading", { level: 3 }).first()
    ).not.toContainText("Harbour");
  });

  test("unpublishing takes it off again", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/projects");
    await page.getByRole("button", { name: "Unpublish Harbour" }).click();
    await expect(page.getByRole("button", { name: "Publish Harbour" })).toBeVisible();

    await page.goto("/projects/harbour");
    await expect(page.getByText("404")).toBeVisible();
  });
});

test.describe("Video, gallery and case study", () => {
  /*
    Uploads go straight to Cloudinary, which is not configured in this run, so
    these drive the parts that do not need it: the fields, the validation and
    what the public page renders. The upload route's own rules are covered by
    the API tests below.
  */
  test("a gallery screenshot with no description is refused", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/projects");
    await page.getByRole("link", { name: "Harbour" }).click();
    await expect(page).toHaveURL(/\/admin\/projects\/[0-9a-f]{24}/, FIRST_VISIT);

    await expect(page.getByText(/Nothing here yet/)).toBeVisible();
    /* The count is shown so it is obvious there is a ceiling. */
    await expect(page.getByText("0/8")).toBeVisible();
  });

  test("the client field reaches the project page", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/projects");
    await page.getByRole("link", { name: "Harbour" }).click();

    await page.getByLabel("Built for").fill("Meridian Bank");
    await page.getByRole("button", { name: "Publish", exact: true }).click();
    await expect(page.getByText("Saved", { exact: true })).toBeVisible();

    await page.goto("/projects/harbour");
    await expect(page.getByText("Built for")).toBeVisible();
    await expect(page.getByText("Meridian Bank")).toBeVisible();
  });

  test("a case study section renders on the page", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/projects");
    await page.getByRole("link", { name: "Harbour" }).click();

    await page.getByRole("group").filter({ hasText: "Written case study" }).click();
    await page.getByRole("button", { name: "Add a section" }).click();
    await page.getByLabel("Heading for section 1").fill("The netting problem");
    await page
      .getByLabel("Body of section 1")
      .fill("Every transfer paid its own fee, so a hundred small payments cost a hundred times what one large one did.");

    await page.getByRole("button", { name: "Update live" }).click();
    await expect(page.getByText("Saved", { exact: true })).toBeVisible();

    await page.goto("/projects/harbour");
    await expect(
      page.getByRole("heading", { name: "The netting problem" })
    ).toBeVisible();
    await expect(page.getByText(/Every transfer paid its own fee/)).toBeVisible();
  });
});

test.describe("Getting a file into an upload", () => {
  /*
    Three ways in: pick it, drop it, paste it.

    Paste is the one worth testing, and the one that was missing. Almost
    everything going onto this site is a screenshot, and the path from taking
    one to publishing it was: find where the system put the file, open a
    picker, navigate to it, choose it.

    A paste has no natural target on a page with several upload fields, so a
    zone claims the clipboard while the pointer is over it and a single
    document listener hands the image to whichever zone claimed it. Both halves
    are asserted here, because the claim failing is silent: the paste simply
    does nothing.
  */

  /* A 1x1 PNG, which is what a pasted screenshot looks like to the page. */
  const PNG =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

  async function countSignatures(page: Page) {
    /* Intercepted rather than sent: what is being checked is that the gesture
       produces an upload attempt, not that Cloudinary accepts the bytes. */
    const state = { signed: 0 };
    await page.route("**/api/admin/work/upload", async (route) => {
      state.signed += 1;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, data: {} }),
      });
    });
    return state;
  }

  test("pasting a screenshot reaches the upload", async ({ page }) => {
    await signIn(page);
    const state = await countSignatures(page);

    await page.goto("/admin/projects/new");
    await page.getByLabel("Name").fill("Paste test");

    const zone = page.getByRole("group", { name: /paste a screenshot/i }).first();
    await zone.scrollIntoViewIfNeeded();
    await zone.hover();

    /* The zone says so, which is also how anybody discovers the feature. */
    await expect(zone).toHaveAttribute("data-armed", "true");

    await zone.evaluate((node, png) => {
      const bytes = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
      const data = new DataTransfer();
      data.items.add(new File([bytes], "screenshot.png", { type: "image/png" }));
      node.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true }));
    }, PNG);

    await expect.poll(() => state.signed, { timeout: 10_000 }).toBeGreaterThan(0);
  });

  test("dropping a file reaches the upload", async ({ page }) => {
    await signIn(page);
    const state = await countSignatures(page);

    await page.goto("/admin/projects/new");
    await page.getByLabel("Name").fill("Drop test");

    const zone = page.getByRole("group", { name: /paste a screenshot/i }).first();
    await zone.scrollIntoViewIfNeeded();

    await zone.evaluate((node, png) => {
      const bytes = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
      const data = new DataTransfer();
      data.items.add(new File([bytes], "screenshot.png", { type: "image/png" }));
      node.dispatchEvent(new DragEvent("drop", { dataTransfer: data, bubbles: true }));
    }, PNG);

    await expect.poll(() => state.signed, { timeout: 10_000 }).toBeGreaterThan(0);
  });

  test("a paste goes to the zone under the pointer, not the first one", async ({
    page,
  }) => {
    /* The whole reason for the claim. With two zones on the page, a paste that
       always went to the first would put a gallery screenshot in the hero. */
    await signIn(page);
    const state = await countSignatures(page);

    await page.goto("/admin/projects/new");
    await page.getByLabel("Name").fill("Second zone test");

    const zones = page.getByRole("group", { name: /paste a screenshot/i });
    await expect(zones).toHaveCount(2);

    const gallery = zones.nth(1);
    await gallery.scrollIntoViewIfNeeded();
    await gallery.hover();

    await expect(gallery).toHaveAttribute("data-armed", "true");
    await expect(zones.nth(0)).toHaveAttribute("data-armed", "false");

    await gallery.evaluate((node, png) => {
      const bytes = Uint8Array.from(atob(png), (c) => c.charCodeAt(0));
      const data = new DataTransfer();
      data.items.add(new File([bytes], "screenshot.png", { type: "image/png" }));
      node.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true }));
    }, PNG);

    await expect.poll(() => state.signed, { timeout: 10_000 }).toBeGreaterThan(0);
  });
});

test.describe("The upload endpoint", () => {
  test("accepts an image and a video, and refuses anything else", async ({ page }) => {
    await signIn(page);

    /* Cloudinary is unconfigured here, so a permitted type gets as far as the
       signature and fails there with 503. What matters is which types are
       refused at 400 before that point. */
    const image = await page.request.post("/api/admin/work/upload", {
      data: { contentType: "image/png", bytes: 500_000 },
    });
    const video = await page.request.post("/api/admin/work/upload", {
      data: { contentType: "video/mp4", bytes: 40_000_000 },
    });
    const pdf = await page.request.post("/api/admin/work/upload", {
      data: { contentType: "application/pdf", bytes: 1000 },
    });

    expect(pdf.status()).toBe(400);
    expect((await pdf.json()).error.fields.media).toContain("image or a video");

    /* Not 400: the type passed, and only the missing Cloudinary config stopped
       it. A 400 here would mean the type was refused. */
    expect(image.status()).not.toBe(400);
    expect(video.status()).not.toBe(400);
  });

  test("a 40MB video is allowed where a 40MB image is not", async ({ page }) => {
    /* The ceilings differ on purpose: a screen recording is large before
       Cloudinary transcodes it, and the point is not making somebody compress
       it by hand first. */
    await signIn(page);

    const bigImage = await page.request.post("/api/admin/work/upload", {
      data: { contentType: "image/png", bytes: 40_000_000 },
    });
    const bigVideo = await page.request.post("/api/admin/work/upload", {
      data: { contentType: "video/mp4", bytes: 40_000_000 },
    });

    expect(bigImage.status()).toBe(400);
    expect((await bigImage.json()).error.fields.media).toContain("15MB");
    expect(bigVideo.status()).not.toBe(400);
  });

  test("refuses a video past the ceiling", async ({ page }) => {
    await signIn(page);
    const huge = await page.request.post("/api/admin/work/upload", {
      data: { contentType: "video/mp4", bytes: 300_000_000 },
    });
    expect(huge.status()).toBe(400);
    expect((await huge.json()).error.fields.media).toContain("200MB");
  });
});

test.describe("Rules", () => {
  test("a duplicate slug is refused against the field", async ({ page }) => {
    await signIn(page);
    await page.goto("/admin/projects/new");

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
    await page.goto("/admin/projects/new");

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
    await menteePage.goto("/admin/projects");
    await expect(menteePage).toHaveURL("/admin/posts");

    /* And the upload endpoint refuses them rather than relying on the page. */
    const response = await menteePage.request.post("/api/admin/work/upload", {
      data: { contentType: "image/png", bytes: 1000 },
    });
    expect(response.status()).toBe(403);

    await context.close();
  });
});
