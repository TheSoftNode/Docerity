import { test, expect } from "@playwright/test";

test.describe("Testimonials", () => {
  test("renders the first testimonial with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/");
    await page.getByText("What people say").scrollIntoViewIfNeeded();

    await expect(page.getByText("Client Name", { exact: true }).first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Show testimonial from Client Name" }).first()
    ).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("cycles to the next testimonial over time", async ({ page }) => {
    await page.goto("/");
    await page.getByText("What people say").scrollIntoViewIfNeeded();
    await expect(page.getByText("Client Name", { exact: true }).first()).toBeVisible();

    await page.waitForTimeout(5500);

    await expect(page.getByText("Mentee Name", { exact: true }).first()).toBeVisible();
  });

  test("clicking an avatar jumps directly to that testimonial", async ({ page }) => {
    await page.goto("/");
    await page.getByText("What people say").scrollIntoViewIfNeeded();

    await page
      .getByRole("button", { name: "Show testimonial from Reader Name" })
      .first()
      .click();

    await expect(page.getByText("Reader Name", { exact: true }).first()).toBeVisible();
  });
});
