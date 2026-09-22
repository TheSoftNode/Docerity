import { test, expect } from "@playwright/test";

test.describe("Work case studies", () => {
  test("renders each case study with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    for (const slug of ["ledger", "northwind", "fieldnote"]) {
      await page.goto(`/work/${slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByText("Results", { exact: true })).toBeVisible();
    }

    expect(errors).toEqual([]);
  });

  test("homepage 'View case study' links navigate to the real page", async ({ page }) => {
    await page.goto("/");
    await page.locator("#work").scrollIntoViewIfNeeded();

    await page.getByRole("link", { name: /view case study/i }).first().click();
    await expect(page).toHaveURL("/work/ledger");
  });

  test("next/previous navigation links between case studies", async ({ page }) => {
    await page.goto("/work/ledger");

    await page.getByRole("link", { name: /Next/ }).click();
    await expect(page).toHaveURL("/work/northwind");

    await page.getByRole("link", { name: /Previous/ }).click();
    await expect(page).toHaveURL("/work/ledger");
  });

  test("returns 404 for an unknown project slug", async ({ page }) => {
    const response = await page.goto("/work/not-a-real-project");
    expect(response?.status()).toBe(404);
  });
});

test.describe("404 page", () => {
  test("renders a branded not-found page for unknown routes", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    const response = await page.goto("/this-route-does-not-exist");
    expect(response?.status()).toBe(404);

    await expect(
      page.getByRole("heading", { name: "This page doesn't exist." })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Back to home" })).toBeVisible();

    expect(errors.filter((e) => !e.includes("404"))).toEqual([]);
  });

  test("'Back to home' navigates to the homepage", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");
    await page.getByRole("button", { name: "Back to home" }).click();
    await expect(page).toHaveURL("/");
  });
});
