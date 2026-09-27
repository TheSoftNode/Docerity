import { test, expect, type Page } from "@playwright/test";
import mongoose from "mongoose";

import { hashPassword } from "@/lib/auth/password";
import { BLOCK_KEYS } from "@/lib/content/blocks/schema";

/**
 * The editable page sections, against a real database.
 *
 * These are the sections that used to be TypeScript files: the client logos,
 * the About page, the mentorship programme, the service and capability grids,
 * the explainer pairs, the contact steps. What matters about them is the
 * fallback, and a fallback is exactly the thing unit tests assert about and
 * integration tests find out about: with a database present and no saved
 * version, the built-in copy has to render.
 */

test.describe.configure({ mode: "serial" });

const OWNER = {
  email: "owner@c.test",
  name: "Test Owner",
  password: "an-owner-password-here",
};

const MENTEE = {
  email: "mentee@c.test",
  name: "Ada Mentee",
  password: "a-mentee-password-here",
};

test.beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
  for (const name of ["users", "sitecontents", "projects", "posts", "reviews"]) {
    await mongoose.connection.collection(name).deleteMany({});
  }
  for (const [who, role] of [
    [OWNER, "owner"],
    [MENTEE, "contributor"],
  ] as const) {
    await mongoose.connection.collection("users").insertOne({
      email: who.email,
      name: who.name,
      passwordHash: await hashPassword(who.password),
      role,
      failedAttempts: 0,
      lockedUntil: null,
      lastLoginAt: null,
      sessionVersion: 1,
      disabledAt: null,
      inviteTokenHash: "",
      inviteExpiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  await mongoose.disconnect();
});

async function signIn(page: Page, who: { email: string; password: string }) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(who.email);
  await page.getByLabel("Password").fill(who.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).not.toHaveURL(/\/admin\/login/);
}

test.describe("Before anything is edited", () => {
  test("the pages show the copy built into the site", async ({ page }) => {
    /* A database is connected and has nothing to say about these sections, so
       this is the fallback doing its job rather than the absence of one. */
    await page.goto("/");
    /* Scoped to the logo wall. "HitoAI" is also a project on the homepage, so
       an unscoped match finds two elements and fails on strict mode. */
    await expect(
      page.locator("#clients").getByText("HitoAI", { exact: true })
    ).toBeVisible();
    await expect(page.locator("#clients").getByText("Stacks", { exact: true })).toBeVisible();

    await page.goto("/contact");
    await expect(page.getByText("You send the details")).toBeVisible();
  });

  test("the admin lists every section as unedited", async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto("/admin/content");

    await expect(page.getByRole("heading", { name: "Client logos" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "About page" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Contact steps" })).toBeVisible();

    /* Every card, because none has been saved. Counted from the schema rather
       than typed: adding a section should not fail this test. */
    await expect(page.getByText("As it shipped")).toHaveCount(BLOCK_KEYS.length);
    await expect(page.getByText("Your version")).toHaveCount(0);
  });

  test("the editor opens on the live copy, not a blank form", async ({ page }) => {
    /*
      The difference between a first edit being a small change and being a
      retype. It was the reason for seeding the defaults rather than starting
      empty.
    */
    await signIn(page, OWNER);
    await page.goto("/admin/content/contact");

    await expect(page.getByLabel("Title for step 1")).toHaveValue("You send the details");
    await expect(page.getByLabel("Title for step 2")).toHaveValue("I read it myself");
  });
});

test.describe("Editing a section", () => {
  test("a change reaches the live page", async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto("/admin/content/contact");

    await page.getByLabel("Title for step 1").fill("You send me the details");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Saved")).toBeVisible();

    /* `revalidatePath` on save, so the page has it rather than showing the old
       copy for another five minutes. */
    await page.goto("/contact");
    await expect(page.getByText("You send me the details")).toBeVisible();
    await expect(page.getByText("You send the details", { exact: true })).toHaveCount(0);
  });

  test("the section is now marked as edited", async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto("/admin/content");
    await expect(page.getByText("Your version")).toHaveCount(1);
  });

  test("adding a row puts it on the page, in order", async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto("/admin/content/contact");

    await page.getByRole("button", { name: "Add step" }).click();
    await page.getByLabel("Title for step 4").fill("A fourth thing happens");
    await page
      .getByLabel("Description for step 4")
      .fill("Which is enough of a sentence to count as one.");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Saved")).toBeVisible();

    await page.goto("/contact");
    await expect(page.getByText("A fourth thing happens")).toBeVisible();
  });

  test("a missing required field is refused, against the row", async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto("/admin/content/contact");

    await page.getByLabel("Title for step 2").fill("");
    await page.getByRole("button", { name: "Save" }).click();

    /* Named by row, so a form of twelve rows says which one. */
    await expect(page.getByText(/Step 2 needs title/)).toBeVisible();

    /* And nothing was written: the live page still has the old second step. */
    await page.goto("/contact");
    await expect(page.getByText("I read it myself")).toBeVisible();
  });

  test("resetting puts the built-in copy back", async ({ page }) => {
    /* The undo. Retyping the original from memory is not one, and without this
       the only way back would be a deploy. */
    await signIn(page, OWNER);
    await page.goto("/admin/content/contact");

    await page.getByRole("button", { name: "Reset to the original" }).click();
    await page.getByRole("button", { name: "Yes, reset it" }).click();
    await expect(page.getByText("Saved")).toBeVisible();

    await page.goto("/contact");
    await expect(page.getByText("You send the details")).toBeVisible();
    await expect(page.getByText("A fourth thing happens")).toHaveCount(0);

    await page.goto("/admin/content");
    await expect(page.getByText("Your version")).toHaveCount(0);
  });
});

test.describe("Sections that are on every page", () => {
  /*
    The site settings are the header, the footer and the address, and the
    titles are per page by definition. Saving one used to revalidate a single
    path, so a new footer link appeared on the homepage and nowhere else until
    each other page's own five-minute window expired, which read as the save
    having failed.

    Asserted on a page that is not the homepage, because the homepage passed
    the whole time the bug existed.
  */
  test("a new footer link shows up across the site, not just on the homepage", async ({
    page,
  }) => {
    await signIn(page, OWNER);
    await page.goto("/admin/content/site");

    /* Somewhere other than the homepage, visited first so it is cached with
       the old footer and the assertion afterwards means something. */
    const link = page.getByRole("link", { name: "Press kit" });

    await page.getByRole("button", { name: "Add footer link" }).click();

    /* The new row is the last one. Each list names its rows after itself, so
       "footer link" cannot match the header list or the socials. */
    const labels = page.getByRole("textbox", { name: /^Label for footer link/ });
    const last = (await labels.count()) - 1;
    await labels.nth(last).fill("Press kit");
    await page
      .getByRole("textbox", { name: `Path for footer link ${last + 1}` })
      .fill("/press");

    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText("Saved")).toBeVisible();

    for (const path of ["/", "/about", "/work"]) {
      await page.goto(path);
      await expect(link, `the footer on ${path}`).toBeVisible();
    }
  });

  test("and the site name reaches every header", async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto("/admin/content/site");

    await page.getByRole("textbox", { name: "Site name" }).fill("Docerity Labs");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText("Saved")).toBeVisible();

    await page.goto("/contact");
    await expect(page.getByRole("banner").getByText("Docerity Labs")).toBeVisible();

    /* Put back, so the tests after this one see the name they expect. */
    await page.goto("/admin/content/site");
    await page.getByRole("textbox", { name: "Site name" }).fill("Docerity");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText("Saved")).toBeVisible();
  });

  /*
    One case per entry the editor offers.

    Three of them were boxes that did nothing. The homepage has no metadata of
    its own and takes `title.default` from the root layout, and /reviews and
    /contribute still exported a static object, so editing any of those three
    saved happily and changed nothing. Walking the list is the only way that
    stays caught: adding an entry and forgetting to wire it looks exactly like
    the working ones from inside the editor.
  */
  const titled = [
    { entry: "Homepage", path: "/", title: "The front door" },
    { entry: "Work", path: "/work", title: "Things I built" },
    { entry: "AI", path: "/ai", title: "Models in production" },
    { entry: "Web3", path: "/web3", title: "On-chain work" },
    { entry: "Mentorship", path: "/mentorship", title: "Growing engineers" },
    { entry: "Blog", path: "/blog", title: "Written down" },
    { entry: "About", path: "/about", title: "Who is behind this" },
    { entry: "Contact", path: "/contact", title: "Get in touch" },
    { entry: "Reviews", path: "/reviews", title: "In their words" },
    { entry: "Write for us", path: "/contribute", title: "Write something" },
  ];

  test("every page title in the editor reaches its page", async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto("/admin/content/seo");

    for (const { entry, title } of titled) {
      await page.getByRole("textbox", { name: `Title for ${entry}` }).fill(title);
    }

    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText("Saved")).toBeVisible();

    for (const { path, title } of titled) {
      await page.goto(path);
      /*
        The homepage is `title.default` and gets no template; every other page
        is threaded through `%s · <site name>`. Both start with the title, so
        one assertion covers the pair.
      */
      await expect(page, `the title on ${path}`).toHaveTitle(new RegExp(`^${title}`));
    }
  });
});

test.describe("Section headings", () => {
  /*
    Headings are stored as a fixed set of named records rather than a list,
    because a component looks one up by name. That shape took its own branch
    through the merge in `lib/content/blocks/source.ts`, and without it the
    stored version was dropped: a heading could be edited, saved, reported as
    saved, and silently ignored on the page. Nothing else would have noticed.
  */
  test("an edited heading reaches the page", async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto("/admin/content/web3");

    await page
      .getByRole("textbox", { name: "Heading for Capabilities" })
      .fill("Contracts that hold up.");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText("Saved")).toBeVisible();

    await page.goto("/web3");
    await expect(
      page.getByRole("heading", { name: "Contracts that hold up." })
    ).toBeVisible();
  });

  test("and the rest of the page is untouched", async ({ page }) => {
    /* One entry changed, the others still on the copy built into the site.
       A merge that took the whole group from the database would blank them. */
    await page.goto("/web3");
    await expect(
      page.getByRole("heading", { name: "Cross-chain, not locked to one network." })
    ).toBeVisible();
  });
});

test.describe("A section with an icon", () => {
  test("the icon a section stores is the icon the page draws", async ({ page }) => {
    /*
      Icons cannot round-trip through MongoDB as components, so they are stored
      as registry names and resolved at render. This is the end-to-end proof of
      that: pick one in the admin, find it in the markup of the public page.
    */
    await signIn(page, OWNER);
    await page.goto("/admin/content/services");

    /* The picker is collapsed until asked for, and its grid labels each icon
       without the "Icon" suffix, because that is what somebody reads. */
    await page.getByRole("button", { name: /^Change icon for capability 1/i }).click();
    await page.getByRole("button", { name: "Database", exact: true }).click();
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText("Saved")).toBeVisible();

    await page.goto("/work");
    /* Lucide renders its name into the class list, which is the one part of an
       SVG icon that is addressable from a test. */
    await expect(page.locator("svg.lucide-database").first()).toBeVisible();
  });
});

test.describe("Who may edit", () => {
  test("a contributor cannot see the section in the rail", async ({ page }) => {
    await signIn(page, MENTEE);
    await page.goto("/admin/posts");
    await expect(page.getByRole("link", { name: "Page content" })).toHaveCount(0);
  });

  test("and typing the URL redirects rather than showing it", async ({ page }) => {
    /* A hidden nav item and a refused page look identical from the outside
       until somebody types the URL. */
    await signIn(page, MENTEE);
    await page.goto("/admin/content");
    await expect(page).not.toHaveURL(/\/admin\/content$/);

    await page.goto("/admin/content/about");
    await expect(page).not.toHaveURL(/\/admin\/content\/about$/);
  });

  test("an unknown section is a 404, not an empty editor", async ({ page }) => {
    await signIn(page, OWNER);
    await page.goto("/admin/content/not-a-section");
    await expect(page.getByText("404")).toBeVisible();
  });
});
