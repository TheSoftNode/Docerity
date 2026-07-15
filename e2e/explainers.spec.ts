import { test, expect } from "@playwright/test";

test.describe("Explainers", () => {
  test("renders the first concept/analogy pair with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/");
    await page.locator("#blog").scrollIntoViewIfNeeded();

    await expect(
      page.getByRole("heading", {
        name: "Complex ideas, explained through things you already know.",
      })
    ).toBeVisible();
    await expect(page.getByText("Caching", { exact: true })).toBeVisible();
    await expect(
      page.getByText("A sticky note on your monitor", { exact: true })
    ).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("cycles to the next concept/analogy pair over time", async ({ page }) => {
    await page.goto("/");
    await page.locator("#blog").scrollIntoViewIfNeeded();
    await expect(page.getByText("Caching", { exact: true })).toBeVisible();

    await page.waitForTimeout(4500);

    await expect(page.getByText("Load Balancing", { exact: true })).toBeVisible();
  });
});
