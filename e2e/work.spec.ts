import { test, expect } from "@playwright/test";

test.describe("Work", () => {
  test("renders the featured projects with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/");
    await page.locator("#work").scrollIntoViewIfNeeded();

    await expect(
      page.getByRole("heading", { name: "Recent work, real outcomes." })
    ).toBeVisible();

    for (const name of ["EEP", "HitoAI", "MetaPilot"]) {
      await expect(
        page.getByRole("heading", { name: `${name} — view project`, exact: true })
      ).toBeVisible();
    }

    expect(errors).toEqual([]);
  });
});
