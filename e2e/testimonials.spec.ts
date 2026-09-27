import { test, expect } from "@playwright/test";

/**
 * The homepage testimonial band, with no database.
 *
 * This is the state the whole suite runs in, and for this section it is also
 * the state the live site is in until somebody leaves a review. There used to
 * be a fallback set of six invented quotes here ("Client Name, Title,
 * Company"), so these tests asserted fictional people were visible. They now
 * assert the opposite: that no such person appears, and that the band says
 * something true and useful instead.
 *
 * The populated state needs approved reviews, so it lives in the integration
 * suite: see "The review pipeline" in `integration/pipeline.spec.ts`.
 */
test.describe("Testimonials", () => {
  test("shows the invitation, with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/");
    await page.getByText("What people say").scrollIntoViewIfNeeded();

    await expect(
      page.getByRole("heading", { name: /other people.s words go/ })
    ).toBeVisible();
    await expect(
      page.getByText("there is nothing here until someone does")
    ).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("invites a review and links to the full set", async ({ page }) => {
    await page.goto("/");
    await page.getByText("What people say").scrollIntoViewIfNeeded();

    /*
      Role button, not link. These are `Button` with `render={<Link />}`, and
      Base UI puts `role="button"` on the anchor it renders, so a link locator
      finds nothing. Same as every other CTA in this suite.
    */
    await expect(page.getByRole("button", { name: "Read all of them" })).toBeVisible();

    await page.getByRole("button", { name: "Write a review" }).click();
    await expect(page).toHaveURL(/\/reviews#leave-a-review$/);
    /* The form's own heading, not the scrambling eyebrow above it: that one
       animates its characters and is not reliably readable. */
    await expect(
      page.getByRole("heading", { name: "Worked together? Be the first." })
    ).toBeVisible();
  });

  test("names nobody who has not left a review", async ({ page }) => {
    await page.goto("/");

    /* The placeholder set is deleted, so this is a regression guard rather
       than a check on current behaviour: reintroducing it anywhere on the
       homepage fails here. */
    const markup = await page.content();
    for (const placeholder of ["Client Name", "Mentee Name", "Reader Name"]) {
      expect(markup).not.toContain(placeholder);
    }

    /* And the rotator itself, which only exists when there are quotes. */
    await expect(page.getByRole("button", { name: /^Show testimonial from/ })).toHaveCount(0);
  });
});
