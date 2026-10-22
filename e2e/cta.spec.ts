import { test, expect } from "@playwright/test";

import { heading } from "./copy";

/*
  The shared closing call to action, which the inner pages render. The
  homepage closes with its own contact section (see home.spec.ts), so this runs
  against /about.
*/
test.describe("Final CTA", () => {
  test("renders with no console errors and both contact actions", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/about");
    await page.locator("#contact").scrollIntoViewIfNeeded();

    await expect(
      page.getByRole("heading", { name: heading("homepage", "home-cta").replace(/\*/g, "") })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Start the conversation" })
    ).toBeVisible();
    await expect(
      page.locator("#contact").getByRole("link", { name: "thesoftnode@gmail.com" })
    ).toBeVisible();

    expect(errors).toEqual([]);
  });

});
