import { test, expect } from "@playwright/test";

/*
  The client portal, signed out: the suite runs without a database, so these
  check the doors rather than what is behind them, which is the part a
  regression would expose.
*/

test.describe("Client portal", () => {
  for (const path of ["/account", "/account/profile", "/account/projects/0123456789abcdef01234567", "/account/requests/new", "/account/requests/DOC-ABC-DEF"]) {
    test(`${path} sends a signed-out visitor to sign in`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/\/account\/login/);
      await expect(page.getByRole("heading", { level: 1, name: "Sign in" })).toBeVisible();
    });
  }

  test("sign in links to sign up and back, and neither is indexed", async ({ page }) => {
    await page.goto("/account/login");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await page.getByRole("link", { name: "Create an account" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Create an account" })).toBeVisible();
    await expect(page.getByLabel("Your name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/account\/login/);
  });

  test("forgot password is reachable from sign in", async ({ page }) => {
    await page.goto("/account/login");
    await page.getByRole("link", { name: "Forgot it?" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Forgot your password?" })).toBeVisible();
  });

  test("a made-up reset or confirmation link goes nowhere useful", async ({ page }) => {
    await page.goto("/account/reset/not-a-token");
    await expect(page.getByRole("heading", { name: "This link has expired" })).toBeVisible();
    await page.goto("/account/verify/not-a-token");
    await expect(page).toHaveURL(/\/account\/login\?expired=1/);
  });

  test("a return path off the site is ignored", async ({ page }) => {
    await page.goto("/account/login?next=https://evil.example");
    await expect(page.locator('input[name="next"]')).toHaveValue("/account");
  });

  test("the site header leads to the account", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Your account" }).first()).toHaveAttribute("href", "/account");
  });

  test("client projects in the admin need an admin sign-in", async ({ page }) => {
    await page.goto("/admin/client-projects");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
