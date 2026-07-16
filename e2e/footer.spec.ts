import { test, expect } from "@playwright/test";

test.describe("Footer", () => {
  test("renders nav links, socials, and copyright with no console errors", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/");
    const footer = page.locator("footer");
    await footer.scrollIntoViewIfNeeded();

    for (const label of ["Work", "Web3", "Mentorship", "Blog"]) {
      await expect(footer.getByRole("link", { name: label, exact: true })).toHaveCount(1);
    }
    await expect(footer.getByText("All rights reserved.")).toBeVisible();

    expect(errors).toEqual([]);
  });
});
