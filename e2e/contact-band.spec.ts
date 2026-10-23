import { test, expect } from "@playwright/test";

import { heading } from "./copy";
import { DEFAULTS } from "@/lib/content/blocks/defaults";

/*
  The closing call to action every inner page ends on, just above the footer.
  Its heading and its three options are edited in the homepage block; where
  each option goes is fixed. Run against /about, one of the pages it closes.
*/
const options = DEFAULTS.homepage.contactOptions as Record<string, { title: string }>;

test.describe("Contact band", () => {
  test("renders its heading and the three ways in, with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));

    await page.goto("/about");
    const band = page.locator("#contact");
    await band.scrollIntoViewIfNeeded();

    await expect(band.getByRole("heading", { name: heading("homepage", "home-cta").replace(/\*/g, "") })).toBeVisible();
    await expect(band.getByRole("link", { name: new RegExp(options.project.title) })).toHaveAttribute("href", "/contact");
    await expect(band.getByRole("link", { name: new RegExp(options.mentorship.title) })).toHaveAttribute("href", "/contact?type=mentorship");
    await expect(band.getByRole("link", { name: new RegExp(options.question.title) })).toHaveAttribute("href", /^mailto:/);

    expect(errors).toEqual([]);
  });
});
