import { test, expect } from "@playwright/test";

/**
 * The homepage's reviews section, with no database.
 *
 * This is the state the whole suite runs in, and for this section it is also
 * the state the live site is in until somebody leaves a review. There used to
 * be a fallback set of invented quotes here, so these tests assert the
 * opposite: that nobody is quoted, and that the section says something true
 * and useful instead.
 *
 * The populated state needs approved reviews, so it lives in the integration
 * suite: see "The review pipeline" in `integration/pipeline.spec.ts`.
 */
test.describe("Reviews", () => {
  test("shows the invitation, with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/");
    const section = page.locator("#reviews");
    await section.scrollIntoViewIfNeeded();

    await expect(section.getByText("Your review goes here")).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("invites a review", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#reviews");

    await expect(section.getByRole("link", { name: "Write the first one" })).toHaveAttribute(
      "href",
      "/reviews#leave-a-review"
    );
  });

  test("quotes nobody who has not left a review", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#reviews");

    await expect(section.locator("blockquote")).toHaveCount(0);
    await expect(section.locator("figcaption")).toHaveCount(0);
  });
});
