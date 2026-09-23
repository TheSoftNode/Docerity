import { test, expect } from "@playwright/test";

test.describe("Final CTA", () => {
  test("renders with no console errors and both contact actions", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/");
    await page.locator("#contact").scrollIntoViewIfNeeded();

    await expect(
      page.getByRole("heading", { name: "Got something worth building?" })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Start the conversation" })
    ).toBeVisible();
    await expect(
      page.locator("#contact").getByRole("link", { name: "thesoftnode@gmail.com" })
    ).toBeVisible();

    expect(errors).toEqual([]);
  });

});
