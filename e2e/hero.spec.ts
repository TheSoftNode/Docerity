import { test, expect } from "@playwright/test";

test.describe("Hero", () => {
  test("renders the headline and both CTAs with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Docerity builds software"
    );
    await expect(page.getByRole("button", { name: "Start a project" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "See the work" })).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("fits above the fold with no internal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 648 });
    await page.goto("/");

    const overflow = await page.evaluate(() => {
      const hero = document.querySelector("section");
      if (!hero) return null;
      return hero.scrollHeight - hero.clientHeight;
    });

    expect(overflow).not.toBeNull();
    expect(overflow as number).toBeLessThanOrEqual(1);
  });

  test("navbar sits directly above the hero with real breathing room", async ({ page }) => {
    await page.goto("/");

    const gap = await page.evaluate(() => {
      const header = document.querySelector("header");
      const h1 = document.querySelector("h1");
      if (!header || !h1) return null;
      return h1.getBoundingClientRect().top - header.getBoundingClientRect().bottom;
    });

    expect(gap).not.toBeNull();
    expect(gap as number).toBeGreaterThan(40);
  });

  test("illustration is hidden on mobile and visible on desktop", async ({ page }) => {
    await page.goto("/");

    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator("svg[viewBox='0 0 480 480']")).toBeHidden();

    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.locator("svg[viewBox='0 0 480 480']")).toBeVisible();
  });
});
