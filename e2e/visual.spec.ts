import { test, expect } from "@playwright/test";

test.describe("Visual regression", () => {
  test("hero looks correct on desktop", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.getByRole("heading", { level: 1 }).waitFor();

    await expect(page).toHaveScreenshot("hero-desktop.png", {
      maxDiffPixelRatio: 0.02,
    });
  });

  test("hero looks correct on mobile", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("heading", { level: 1 }).waitFor();

    await expect(page).toHaveScreenshot("hero-mobile.png", {
      maxDiffPixelRatio: 0.02,
    });
  });
});
