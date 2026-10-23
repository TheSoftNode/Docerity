import { test, expect } from "@playwright/test";

import { heading } from "./copy";

test.describe("Write for us page", () => {
  test("renders every section with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/contribute");

    /* The heading is named by its final text: the tracked changes are decoration. */
    await expect(page.getByRole("heading", { level: 1, name: "Getting your name on an explainer." })).toBeVisible();
    for (const entry of ["contribute-route", "contribute-craft"]) {
      await expect(page.getByRole("heading", { level: 2, name: heading("contribute", entry), exact: true })).toBeVisible();
    }
    await expect(page.getByRole("heading", { name: heading("homepage", "home-cta").replace(/\*/g, "") })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("the draft is edited in front of the reader, and ends approved", async ({ page }) => {
    await page.goto("/contribute");
    const notes = page.getByRole("complementary", { name: "The editor's notes" });
    await expect(notes.getByText("The draft as it came in")).toBeVisible();
    await expect(notes.getByText("An explainer, not a post")).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText("Ready to publish")).toBeVisible({ timeout: 25_000 });
    await expect(notes.getByText("✓ Resolved").first()).toBeVisible();
  });

  test("under reduced motion it shows the finished page", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/contribute");
    await expect(page.getByText("Ready to publish")).toBeVisible();
    await expect(page.getByRole("button", { name: /Replay/ })).toHaveCount(0);
    await context.close();
  });

  test("there is no submission form, only the way in", async ({ page }) => {
    await page.goto("/contribute");
    await expect(page.locator("main textarea")).toHaveCount(0);
    const way = page.getByRole("link", { name: /Talk about mentorship/ });
    await expect(way).toHaveAttribute("href", "/contact?type=mentorship");
  });

  test("a concept shows its pair, and the slider sizes the topic", async ({ page }) => {
    await page.goto("/contribute");
    await page.getByRole("group", { name: "Concepts" }).getByRole("button", { name: "Load Balancing" }).click();
    const pair = page.locator('[aria-live="polite"]').filter({ hasText: "Works like" });
    await expect(pair).toContainText("A host seating restaurant guests");

    const slider = page.getByLabel("How much are you covering?");
    await expect(page.getByText("✓ Right size")).toBeVisible();
    await slider.fill("12");
    await expect(page.getByText("✕ Too wide")).toBeVisible();
    await expect(page.getByText("Databases", { exact: true })).toBeVisible();
  });

  test("layout does not overflow horizontally at narrow widths", async ({ page }) => {
    for (const width of [320, 375, 768, 1024]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/contribute");
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(clientWidth + 1);
    }
  });
});
