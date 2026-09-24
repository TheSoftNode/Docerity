import { test, expect } from "@playwright/test";

test.describe("Work filtering", () => {
  test("filters narrow the grid and the counts are real", async ({ page }) => {
    await page.goto("/work");
    await page.locator("#showcase").scrollIntoViewIfNeeded();

    const cards = page.locator("#showcase h3 a");
    const all = await cards.count();
    expect(all).toBe(25);

    /* The count on each filter has to match what it actually shows, or the
       chips are decoration rather than information. */
    for (const label of ["Web3", "Backend / API", "Fintech"]) {
      const chip = page.getByRole("button", { name: new RegExp(`^${label.replace("/", "\\/")}`) });
      const claimed = Number((await chip.innerText()).match(/(\d+)\s*$/)?.[1]);
      await chip.click();
      await expect(cards).toHaveCount(claimed);
      expect(claimed).toBeLessThan(all);
    }

    await page.getByRole("button", { name: /^All work/ }).click();
    await expect(cards).toHaveCount(all);
  });

  test("the active filter is announced, not just coloured", async ({ page }) => {
    await page.goto("/work");
    await page.locator("#showcase").scrollIntoViewIfNeeded();

    const web3 = page.getByRole("button", { name: /^Web3/ });
    await expect(web3).toHaveAttribute("aria-pressed", "false");
    await web3.click();
    await expect(web3).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("Project media", () => {
  test("cards show real screenshots, not placeholders", async ({ page }) => {
    await page.goto("/work");
    await page.locator("#showcase").scrollIntoViewIfNeeded();

    const images = page.locator("#showcase img");
    expect(await images.count()).toBeGreaterThanOrEqual(12);

    /* Check a sample actually decoded; Next serves these through the image
       optimiser, so a bad source path fails at request time, not build time. */
    for (let i = 0; i < 6; i++) {
      const ok = await images.nth(i).evaluate(
        (img: HTMLImageElement) => img.complete && img.naturalWidth > 0
      );
      expect(ok, `screenshot ${i} failed to load`).toBe(true);
    }
  });
});
