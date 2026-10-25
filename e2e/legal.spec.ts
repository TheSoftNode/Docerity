import { test, expect } from "@playwright/test";

import { DEFAULTS } from "@/lib/content/blocks/defaults";

const privacy = DEFAULTS.legal.privacy as { title: string };
const terms = DEFAULTS.legal.terms as { title: string };

test.describe("Privacy and terms", () => {
  for (const [path, title] of [
    ["/privacy", privacy.title],
    ["/terms", terms.title],
  ] as const) {
    test(`${path} renders with its contents and no console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(error.message));

      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
      await expect(page.getByRole("heading", { name: "The short version" })).toBeVisible();
      await expect(page.locator("main")).not.toContainText("{email}");
      expect(errors).toEqual([]);
    });
  }

  test("the contents link to their sections", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/privacy");
    await page.getByRole("navigation", { name: "On this page" }).getByRole("link", { name: "Your rights" }).click();
    await expect(page).toHaveURL(/#your-rights$/);
    await expect(page.getByRole("heading", { level: 2, name: "Your rights" })).toBeInViewport();
  });

  test("the footer links to both", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: "Privacy", exact: true })).toHaveAttribute("href", "/privacy");
    await expect(footer.getByRole("link", { name: "Terms", exact: true })).toHaveAttribute("href", "/terms");
  });
});
