import { test, expect } from "@playwright/test";

test.describe("Mentorship", () => {
  test("renders the growth path with all milestones and no console errors", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/");
    await page.locator("#mentorship").scrollIntoViewIfNeeded();

    await expect(
      page.getByRole("heading", { name: "A clear path to your next level." })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Apply for mentorship" })).toBeVisible();

    // Below `sm`, the SVG growth path is swapped for a compact text list
    // (its labels are illegible at that scale), so both representations
    // exist in the DOM; `.and(locator(":visible"))` picks whichever one
    // is actually shown at the current viewport.
    for (const label of ["Foundations", "Code Reviews", "System Design", "Leadership"]) {
      await expect(
        page
          .locator("#mentorship")
          .getByText(label, { exact: true })
          .and(page.locator(":visible"))
      ).toBeVisible();
    }

    expect(errors).toEqual([]);
  });
});
