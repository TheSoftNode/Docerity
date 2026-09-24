import { test, expect } from "@playwright/test";

test.describe("Work page", () => {
  test("renders all sections with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/work");

    await expect(
      page.getByRole("heading", { name: "Software built for what happens after launch." })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Four kinds of problems, one way of working." })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "From first call to shipped software." })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Boring where it counts, sharp where it matters." })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "What it's like to work together." })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Got something worth building?" })
    ).toBeVisible();

    for (const name of ["MetaPilot", "TalentChainPro", "SoftInven"]) {
      await expect(
        page.getByRole("heading", { name: `${name} — view project`, exact: true })
      ).toBeVisible();
    }

    expect(errors).toEqual([]);
  });

  test("navbar 'Work' link navigates to the dedicated page", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.locator("header").getByRole("link", { name: "Work", exact: true }).click();
    await expect(page).toHaveURL("/work");
  });

  test("'See the work' scrolls to the showcase, 'Start a project' goes to contact", async ({
    page,
  }) => {
    await page.goto("/work");

    await page.locator("main").getByRole("button", { name: "Start a project" }).click();
    await expect(page).toHaveURL("/contact");

    await page.goto("/work");
    await page.getByRole("button", { name: "See the work" }).click();
    await expect(page.locator("#showcase")).toBeInViewport();
  });

  test("homepage 'See all work' button links here", async ({ page }) => {
    await page.goto("/");
    await page.locator("#work").scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "See all work" }).click();
    await expect(page).toHaveURL("/work");
  });

  test("project page 'All work' back link points to the dedicated page", async ({ page }) => {
    await page.goto("/work/eep");
    await page.getByRole("link", { name: "All work" }).click();
    await expect(page).toHaveURL("/work");
  });
});
