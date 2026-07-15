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

  test("work section looks correct on desktop", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.locator("#work").scrollIntoViewIfNeeded();
    await page.getByRole("heading", { name: "Recent work, real outcomes." }).waitFor();

    await expect(page).toHaveScreenshot("work-desktop.png", {
      maxDiffPixelRatio: 0.02,
    });
  });

  test("mentorship section looks correct on desktop", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.locator("#mentorship").scrollIntoViewIfNeeded();
    await page.getByRole("heading", { name: "A clear path to your next level." }).waitFor();

    await expect(page).toHaveScreenshot("mentorship-desktop.png", {
      maxDiffPixelRatio: 0.02,
    });
  });

  test("explainers section looks correct on desktop", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.locator("#blog").scrollIntoViewIfNeeded();
    await page
      .getByRole("heading", { name: "Complex ideas, explained through things you already know." })
      .waitFor();

    await expect(page).toHaveScreenshot("explainers-desktop.png", {
      maxDiffPixelRatio: 0.02,
    });
  });

  test("testimonials section looks correct on desktop", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.getByText("What people say").scrollIntoViewIfNeeded();

    await expect(page).toHaveScreenshot("testimonials-desktop.png", {
      maxDiffPixelRatio: 0.02,
    });
  });

  test("final CTA section looks correct on desktop", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await page
      .getByRole("heading", { name: "Got something worth building?" })
      .waitFor();

    await expect(page).toHaveScreenshot("cta-desktop.png", {
      maxDiffPixelRatio: 0.02,
    });
  });
});
