import { test, expect } from "@playwright/test";

/*
  Sections animate in with `whileInView`, and Playwright counts an element at
  `opacity: 0` as visible — it has a box. So waiting for a heading proves
  nothing about whether the section has actually appeared, and a screenshot
  taken at that moment captures an empty band. One baseline was recorded that
  way: a blank page that would have matched any blank render.

  Waiting on the computed opacity is deterministic, and under emulated
  reduced motion the transition is instant, so it costs a frame rather than a
  fixed sleep.
*/
async function waitForReveal(locator: import("@playwright/test").Locator) {
  await expect(locator).toHaveCSS("opacity", "1");
}

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
    await waitForReveal(page.locator("#work h3").first());

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
    await waitForReveal(
      page.getByRole("heading", { name: "A clear path to your next level." })
    );

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
    await waitForReveal(
      page.getByRole("heading", {
        name: "Complex ideas, explained through things you already know.",
      })
    );

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
    await waitForReveal(
      page.getByRole("heading", { name: "Got something worth building?" })
    );

    await expect(page).toHaveScreenshot("cta-desktop.png", {
      maxDiffPixelRatio: 0.02,
    });
  });
});
