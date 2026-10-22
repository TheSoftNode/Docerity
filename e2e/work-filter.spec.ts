import { test, expect } from "@playwright/test";

import { projects } from "@/components/sections/work/work-data";
import { ALL_FILTER } from "@/components/sections/projects/projects-content";

test.describe("Work filtering", () => {
  test("filters narrow the grid and the counts are real", async ({ page }) => {
    await page.goto("/projects");
    await page.locator("#showcase").scrollIntoViewIfNeeded();

    const cards = page.locator("#showcase h3 a");
    /* Counted from the file rather than typed: this test is about the filter
       chips agreeing with the grid, not about how many projects there are. */
    const all = await cards.count();
    expect(all).toBe(projects.length);

    /* The count on each filter has to match what it actually shows, or the
       chips are decoration rather than information. */
    for (const label of ["Web3", "Backend / API", "Fintech"]) {
      const chip = page.getByRole("button", { name: new RegExp(`^${label.replace("/", "\\/")}`) });
      const claimed = Number((await chip.innerText()).match(/(\d+)\s*$/)?.[1]);
      await chip.click();
      await expect(cards).toHaveCount(claimed);
      expect(claimed).toBeLessThan(all);
    }

    await page.getByRole("button", { name: new RegExp(`^${ALL_FILTER}`) }).click();
    await expect(cards).toHaveCount(all);
  });

  test("the active filter is announced, not just coloured", async ({ page }) => {
    await page.goto("/projects");
    await page.locator("#showcase").scrollIntoViewIfNeeded();

    const web3 = page.getByRole("button", { name: /^Web3/ });
    await expect(web3).toHaveAttribute("aria-pressed", "false");
    await web3.click();
    await expect(web3).toHaveAttribute("aria-pressed", "true");
  });

  test("the filter survives a switch to the index view", async ({ page }) => {
    await page.goto("/projects");
    const showcase = page.locator("#showcase");
    await showcase.scrollIntoViewIfNeeded();

    const web3 = showcase.getByRole("button", { name: /^Web3/ });
    const claimed = Number((await web3.innerText()).match(/(\d+)\s*$/)?.[1]);
    await web3.click();

    const index = showcase.getByRole("button", { name: "index", exact: true });
    await index.click();
    await expect(index).toHaveAttribute("aria-pressed", "true");
    /* The index is rows of links rather than cards with headings. */
    await expect(showcase.locator("h3")).toHaveCount(0);
    await expect(showcase.locator('a[href^="/projects/"]')).toHaveCount(claimed);
  });
});

test.describe("Command bar", () => {
  test("a category in the hero filters the showcase and jumps to it", async ({ page }) => {
    await page.goto("/projects");
    const bar = page.getByRole("navigation", { name: "Jump to projects" });
    const link = bar.getByRole("link").nth(1);
    const label = (await link.innerText()).replace(/\s*\d+\s*$/, "").trim();

    await link.click();
    await expect(page.locator("#showcase")).toBeInViewport();
    await expect(
      page.locator("#showcase").getByRole("button", { name: new RegExp(`^${label.replace(/[/]/g, "\\/")}`) })
    ).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("Project media", () => {
  test("cards show real screenshots, not placeholders", async ({ page }) => {
    await page.goto("/projects");
    await page.locator("#showcase").scrollIntoViewIfNeeded();

    const images = page.locator("#showcase img");
    expect(await images.count()).toBeGreaterThanOrEqual(12);

    /* Check a sample actually decoded; Next serves these through the image
       optimiser, so a bad source path fails at request time, not build time.

       Scrolled to first, and waited for: these are lazy, and on a phone-width
       viewport the grid is one card wide, so the sixth is a long way down the
       page and has not started loading. Asserting on it there measures the
       viewport rather than the image. */
    for (let i = 0; i < 6; i++) {
      const image = images.nth(i);
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(
          () =>
            image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
          { message: `screenshot ${i} failed to load` }
        )
        .toBe(true);
    }
  });
});
