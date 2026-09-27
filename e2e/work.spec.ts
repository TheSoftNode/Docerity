import { test, expect } from "@playwright/test";

import { featuredProjects } from "@/components/sections/work/work-data";

test.describe("Work", () => {
  test("renders the featured projects with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/");
    await page.locator("#work").scrollIntoViewIfNeeded();

    await expect(
      page.getByRole("heading", { name: "Recent work, real outcomes." })
    ).toBeVisible();

    /*
      Every flagged project, read from the file rather than three names typed
      here. Which work leads the homepage is a curation decision that changes,
      and a test naming particular projects fails on the decision rather than
      on the band being broken.
    */
    for (const project of featuredProjects) {
      await expect(
        page.getByRole("heading", { name: `${project.name}, view project`, exact: true })
      ).toBeVisible();
    }

    /* And only those: the band is laid out for the flagged set, so an extra
       one is a layout change nobody asked for. */
    await expect(page.locator("#work h3 a")).toHaveCount(featuredProjects.length);

    expect(errors).toEqual([]);
  });
});
