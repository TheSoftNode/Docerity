import { test, expect } from "@playwright/test";

test.describe("Work project pages", () => {
  test("renders each project page with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    for (const slug of ["eep", "metapilot", "softinven"]) {
      await page.goto(`/work/${slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      /* Status is known for every project; "Results" is part of a written
         case study and most do not have one yet. */
      await expect(page.getByText("Status", { exact: true })).toBeVisible();
    }

    expect(errors).toEqual([]);
  });

  test("a project without a written study says so and links out", async ({ page }) => {
    /*
      The placeholder case studies were invented narrative. Where no real
      write-up exists the page has to say that plainly rather than fill the
      space, so the absence is asserted.
    */
    await page.goto("/work/metapilot");

    await expect(page.getByText(/hasn't been written up yet/i)).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Visit MetaPilot/i })
    ).toHaveAttribute("href", "https://metapilot-frontend.vercel.app/");
  });

  test("homepage 'View project' links navigate to the real page", async ({ page }) => {
    await page.goto("/");
    await page.locator("#work").scrollIntoViewIfNeeded();

    await page.getByRole("link", { name: /view project/i }).first().click();
    await expect(page).toHaveURL("/work/eep");
  });

  test("next/previous navigation links between projects", async ({ page }) => {
    await page.goto("/work/eep");

    await page.getByRole("link", { name: /Next/ }).click();
    await expect(page).toHaveURL("/work/hitoai");

    await page.getByRole("link", { name: /Previous/ }).click();
    await expect(page).toHaveURL("/work/eep");
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
