import { test, expect } from "@playwright/test";

test.describe("Navbar", () => {
  test("is transparent at the top and gains a background once scrolled", async ({ page }) => {
    await page.goto("/");

    const header = page.locator("header");
    await expect(header).toHaveClass(/bg-transparent/);

    await page.evaluate(() => window.scrollTo(0, 400));
    await expect(header).toHaveClass(/backdrop-blur-md/);
  });

  test("mobile menu opens, lists all nav links, and closes", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.getByRole("button", { name: "Open menu" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    for (const label of ["Work", "Mentorship", "Blog"]) {
      await expect(dialog.getByRole("button", { name: label })).toBeVisible();
    }

    await dialog.getByRole("button", { name: "Work", exact: true }).click();
    await expect(dialog).toBeHidden();
  });
});
