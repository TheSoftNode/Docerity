import { test, expect, type Locator } from "@playwright/test";

import { featuredProjects } from "@/components/sections/work/work-data";
import { PROJECT_INTERVAL_MS } from "@/components/sections/home/home-data";

import { heading } from "./copy";

/*
  The homepage's selected work: an index of the featured projects beside one
  large preview.

  The projects are read from the file rather than named here. Which work leads
  the homepage is a curation decision that changes, and a test naming
  particular projects fails on the decision rather than on the section.
*/
const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The index row whose project name is exactly `name`, not merely containing it. */
const rowFor = (index: Locator, name: string) =>
  index.getByRole("button").filter({
    has: index.page().getByText(new RegExp(`^${escape(name)}$`)),
  });

test.describe("Work", () => {
  test("lists exactly the featured projects, with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/");
    const section = page.locator("#work");
    await section.scrollIntoViewIfNeeded();

    await expect(
      section.getByRole("heading", { name: heading("homepage", "home-work") })
    ).toBeVisible();

    const index = section.getByRole("list", { name: "Featured projects" });
    await expect(index.getByRole("button")).toHaveCount(featuredProjects.length);
    for (const project of featuredProjects) {
      await expect(rowFor(index, project.name)).toBeVisible();
    }

    expect(errors).toEqual([]);
  });

  test("choosing a project shows it, with its case study and its live site", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#work");
    await section.scrollIntoViewIfNeeded();

    /* A live project with a site, so all three of the preview's actions are
       exercised. */
    const project = featuredProjects.find((entry) => entry.liveUrl) ?? featuredProjects[0];
    const row = rowFor(section.getByRole("list", { name: "Featured projects" }), project.name);
    await row.click();
    await expect(row).toHaveAttribute("aria-pressed", "true");

    await expect(section.getByRole("heading", { level: 3 })).toContainText(project.name);
    await expect(section.getByRole("link", { name: "Case study" })).toHaveAttribute(
      "href",
      `/projects/${project.slug}`
    );

    if (project.liveUrl) {
      const live = section.getByRole("link", { name: /Visit live/ });
      await expect(live).toHaveAttribute("href", project.liveUrl);
      await expect(live).toHaveAttribute("target", "_blank");
      await expect(live).toHaveAttribute("rel", /noopener/);
    }
  });

  test("the arrows step through the projects and wrap around", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#work");
    await section.scrollIntoViewIfNeeded();
    const index = section.getByRole("list", { name: "Featured projects" });

    await section.getByRole("button", { name: "Previous project" }).click();
    await expect(rowFor(index, featuredProjects[featuredProjects.length - 1].name)).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    await section.getByRole("button", { name: "Next project" }).click();
    await expect(rowFor(index, featuredProjects[0].name)).toHaveAttribute("aria-pressed", "true");
  });

  test("plays through the projects by itself", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#work");
    await section.scrollIntoViewIfNeeded();
    /* Off the section, since hovering it is what pauses it. */
    await page.mouse.move(0, 0);

    const index = section.getByRole("list", { name: "Featured projects" });
    await expect(rowFor(index, featuredProjects[1].name)).toHaveAttribute("aria-pressed", "true", {
      timeout: PROJECT_INTERVAL_MS + 5_000,
    });
  });

  test("holds still while the pointer is over the picture", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#work");
    await section.scrollIntoViewIfNeeded();
    const index = section.getByRole("list", { name: "Featured projects" });

    await section.locator("[data-stage]").hover();
    await page.waitForTimeout(PROJECT_INTERVAL_MS + 1_500);
    await expect(rowFor(index, featuredProjects[0].name)).toHaveAttribute("aria-pressed", "true");
  });

  test("keeps playing after a project is picked with the mouse", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#work");
    await section.scrollIntoViewIfNeeded();
    const index = section.getByRole("list", { name: "Featured projects" });

    /* The click leaves focus on the row. That must not count as the pause,
       which is keyboard focus only. */
    await rowFor(index, featuredProjects[0].name).click();
    await page.mouse.move(0, 0);
    await expect(rowFor(index, featuredProjects[1].name)).toHaveAttribute("aria-pressed", "true", {
      timeout: PROJECT_INTERVAL_MS + 5_000,
    });
  });

  test("stays on the chosen project under reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.mouse.move(0, 0);
    const index = page.locator("#work").getByRole("list", { name: "Featured projects" });

    await page.waitForTimeout(PROJECT_INTERVAL_MS + 1_500);
    await expect(rowFor(index, featuredProjects[0].name)).toHaveAttribute("aria-pressed", "true");
  });
});
