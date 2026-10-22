import { test, expect } from "@playwright/test";

import { navLabels } from "./copy";

/*
  The homepage's floating header.

  The inner pages keep the shared navbar, covered by navbar.spec.ts. This one
  shows every link in the bar from 1280px, where they all fit, and moves them
  into a menu below that rather than letting the bar overflow.
*/
test.describe("Homepage header", () => {
  test("shows every link in the bar on a wide screen", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const nav = page.getByRole("navigation", { name: "Main" });
    for (const label of navLabels()) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await expect(nav.getByRole("link", { name: "Start a project" })).toHaveAttribute("href", "/contact");
    await expect(page.getByRole("button", { name: "Open menu" })).toBeHidden();
  });

  test("on a phone, the menu opens, lists every link, and closes with Escape", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const toggle = page.getByRole("button", { name: "Open menu" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();

    const close = page.getByRole("button", { name: "Close menu" });
    await expect(close).toHaveAttribute("aria-expanded", "true");

    const menu = page.locator(`#${await close.getAttribute("aria-controls")}`);
    for (const label of navLabels()) {
      await expect(menu.getByRole("link", { name: label, exact: true })).toBeVisible();
    }

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  });

  test("the phone menu fits on a small screen without scrolling", async ({ page }) => {
    /* iPhone SE: the smallest phone still in common use. Every link, the
       colour theme and the call to action should be in view at once. */
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    await page.getByRole("button", { name: "Open menu" }).click();
    const close = page.getByRole("button", { name: "Close menu" });
    const menu = page.locator(`#${await close.getAttribute("aria-controls")}`);

    const box = await menu.evaluate((element) => ({
      bottom: element.getBoundingClientRect().bottom,
      overflow: element.scrollHeight - element.clientHeight,
    }));
    expect(box.bottom, "the menu runs below the screen").toBeLessThanOrEqual(667);
    expect(box.overflow, "the menu has to scroll").toBeLessThanOrEqual(1);
  });

  test("choosing a link in the phone menu closes it", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.getByRole("button", { name: "Open menu" }).click();
    const close = page.getByRole("button", { name: "Close menu" });
    const menu = page.locator(`#${await close.getAttribute("aria-controls")}`);

    await menu.getByRole("link", { name: navLabels()[0], exact: true }).click();
    await expect(menu).toBeHidden();
  });
});
