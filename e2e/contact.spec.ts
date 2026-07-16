import { test, expect } from "@playwright/test";

test.describe("Contact page", () => {
  test("renders with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/contact");

    await expect(
      page.getByRole("heading", { name: "Tell me what you're building." })
    ).toBeVisible();
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Message")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Send message" })
    ).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("navbar, hero, mentorship, and CTA buttons all navigate here", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Start a project" }).first().click();
    await expect(page).toHaveURL("/contact");

    await page.goto("/");
    await page.getByRole("button", { name: "Apply for mentorship" }).click();
    await expect(page).toHaveURL("/contact?type=mentorship");

    await page.goto("/");
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: "Start the conversation" }).click();
    await expect(page).toHaveURL("/contact");
  });

  test("submitting the form shows a success state", async ({ page }) => {
    await page.goto("/contact");

    await page.getByLabel("Name").fill("Ada Lovelace");
    await page.getByLabel("Email").fill("ada@example.com");
    await page.getByRole("button", { name: "Mentorship" }).click();
    await page.getByLabel("Message").fill("I'd love to learn backend engineering.");
    await page.getByRole("button", { name: "Send message" }).click();

    await expect(page.getByText("Message sent.")).toBeVisible();
  });
});
