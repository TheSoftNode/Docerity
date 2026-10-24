import { test, expect, type Page } from "@playwright/test";

import { heading } from "./copy";
import { DEFAULTS } from "@/lib/content/blocks/defaults";
import type { AboutContent } from "@/lib/content/blocks/views";

const about = DEFAULTS.about as unknown as AboutContent;

/** A headline figure's value, found by its label in the hero's summary. */
function figure(page: Page, label: string) {
  return page.locator("dl div").filter({ has: page.locator("dt", { hasText: label }) }).locator("dd");
}
const shipped = (page: Page) => figure(page, "Shipped projects");

test.describe("About page", () => {
  test("renders every section with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/about");

    await expect(page.getByRole("heading", { level: 1, name: heading("about", "about-hero").replace(/\*/g, "") })).toBeVisible();
    for (const entry of ["about-story", "about-experience", "about-toolkit", "about-credentials"]) {
      await expect(page.getByRole("heading", { level: 2, name: heading("about", entry), exact: true })).toBeVisible();
    }
    await expect(page.getByRole("heading", { name: heading("homepage", "home-cta").replace(/\*/g, "") })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("the graph has a branch for every role, and picking one shows its commit", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about");

    const roles = page.getByRole("list", { name: "Roles, oldest first" }).getByRole("button");
    await expect(roles).toHaveCount(about.experience.length);

    const uri = roles.filter({ hasText: "URI Creative" });
    await uri.click();
    await expect(uri).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("commit dcr:uri-creative")).toBeVisible();
    await expect(page.getByText("ongoing → HEAD")).toBeVisible();

    const alx = roles.filter({ hasText: "ALX Africa" });
    await alx.click();
    await expect(page.getByText("commit dcr:alx-africa")).toBeVisible();
    await expect(page.getByText("merged into main")).toBeVisible();
  });

  test("every headline figure is on the page, the project count included", async ({ page }) => {
    await page.goto("/about");
    for (const fact of about.facts) await expect(figure(page, fact.label)).toHaveText(fact.value);
    await expect(shipped(page)).toHaveText(/^\d+$/);
  });

  test("the story is the founder's own paragraphs", async ({ page }) => {
    await page.goto("/about");
    const story = page.getByRole("article", { name: "The story, in the founder's words" });
    await expect(story.getByRole("listitem")).toHaveCount(about.story.length);
    await expect(page.getByText(`"${about.founder.based}"`)).toBeVisible();
  });

  test("the changelog filters, and each role opens to its notes", async ({ page }) => {
    await page.goto("/about");
    const changelog = page.locator("#changelog");
    const roles = changelog.getByRole("heading", { level: 3 });
    await expect(roles).toHaveCount(about.experience.length);

    const current = about.experience.filter((entry) => /present/i.test(entry.period)).length;
    await changelog.getByRole("button", { name: /^Current/ }).click();
    await expect(roles).toHaveCount(current);
    await changelog.getByRole("button", { name: /^Earlier/ }).click();
    await expect(roles).toHaveCount(about.experience.length - current);
    await changelog.getByRole("button", { name: /^All/ }).click();

    /* The newest is open from the start; the next opens on a click. */
    const first = changelog.getByRole("button", { name: new RegExp(about.experience[0].role) });
    await expect(first).toHaveAttribute("aria-expanded", "true");
    const second = changelog.getByRole("button", { name: new RegExp(`^${about.experience[1].role}`) });
    await second.click();
    await expect(second).toHaveAttribute("aria-expanded", "true");
    await expect(changelog.getByText(about.experience[1].points[0])).toBeVisible();
  });

  test("picking a part of the system prints its stack", async ({ page }) => {
    await page.goto("/about");
    const toolkit = page.locator("#toolkit");
    const backend = about.skillGroups.find((group) => group.title === "Backend")!;

    await toolkit.getByRole("button", { name: "Backend", exact: true }).click();
    await expect(toolkit.getByText("docerity stack --for backend")).toBeVisible();
    const stack = toolkit.getByRole("list", { name: "Backend stack" }).getByRole("listitem");
    await expect(stack).toHaveCount(backend.items.length);
    await expect(stack.first()).toContainText(backend.items[0]);
  });

  test("certificates show their real scans, and the viewer follows the pick", async ({ page, request }) => {
    await page.goto("/about");
    const credentials = page.locator("#credentials");
    const scanned = about.certifications.filter((cert) => cert.image);

    const wall = credentials.getByRole("list", { name: "Certifications" }).getByRole("button");
    await expect(wall).toHaveCount(about.certifications.length);

    const target = scanned[1];
    await wall.filter({ hasText: target.name }).click();
    const viewer = credentials.locator(`img[alt="${target.name} certificate"]`);
    await expect(viewer).toBeVisible();

    /*
      The source is fetched rather than waiting on the browser to decode it:
      the dev image optimiser stalls under several requests at once, which
      would fail this for a reason that has nothing to do with the page.
    */
    const source = await viewer.getAttribute("src");
    const url = new URL(source!, "http://localhost");
    const response = await request.get(url.searchParams.get("url") ?? url.pathname);
    expect(response.status()).toBe(200);

    await expect(credentials.getByText(about.education[3].qualification)).toBeVisible();
  });

  test("the hero has no background grid", async ({ page }) => {
    /*
      A 64px graph-paper tile was added to this band and removed again: it
      reads as scaffolding, and a headline on visible grid lines looks like a
      wireframe. This asserts it stays gone, since it is the kind of thing
      that gets reintroduced as "texture".
    */
    await page.goto("/about");

    const hasTiledGradient = await page
      .locator("section")
      .first()
      .evaluate((section) =>
        Array.from(section.querySelectorAll("*")).some((node) => {
          const style = getComputedStyle(node);
          return (
            style.backgroundImage.includes("linear-gradient") &&
            /^\d+px \d+px$/.test(style.backgroundSize)
          );
        })
      );

    expect(hasTiledGradient, "a tiled background grid is back in the hero").toBe(false);
  });

  test("navbar 'About' link navigates to the page", async ({ page }) => {
    /* Wide enough for the homepage header to show its links in the bar; below
       1280px they live in the menu, which site-header.spec.ts covers. */
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "About" }).click();
    await expect(page).toHaveURL("/about");
  });

  test("does not expose personal contact details or date of birth", async ({ page }) => {
    /*
      The portfolio's About panel carried a date of birth and two personal
      phone numbers. On a company site those invite spam and belong nowhere
      but the contact route, so their absence is asserted rather than assumed.
    */
    await page.goto("/about");
    const body = await page.locator("body").innerText();

    expect(body).not.toContain("9135");
    expect(body).not.toContain("9038");
    expect(body).not.toMatch(/born on/i);
    expect(body).not.toMatch(/whatsapp/i);
  });

  test("the project count matches the work page", async ({ page }) => {
    /*
      The hero claims a number of shipped projects, derived from the same
      array the work page renders. A headline figure nobody can reconcile with
      the work is worth less than no figure at all.
    */
    await page.goto("/projects");
    await page.locator("#showcase").scrollIntoViewIfNeeded();
    const actual = await page.locator("#showcase h3 a").count();

    await page.goto("/about");
    await expect(shipped(page)).toHaveText(String(actual));
  });

  test("layout does not overflow horizontally at narrow widths", async ({ page }) => {
    for (const width of [320, 375, 768, 1024]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/about");

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(scrollWidth, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(
        clientWidth + 1
      );
    }
  });
});
