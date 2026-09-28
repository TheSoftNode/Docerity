import { test, expect } from "@playwright/test";

import { navLabels } from "./copy";

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
    /* Read from the settings rather than named here: which pages are in the
       header is a decision that changes, and the menu's job is to list
       whatever it was given. */
    const labels = navLabels();
    for (const label of labels) {
      await expect(dialog.getByRole("button", { name: label })).toBeVisible();
    }

    await dialog.getByRole("button", { name: labels[0], exact: true }).click();
    await expect(dialog).toBeHidden();
  });
});
