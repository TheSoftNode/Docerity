import { test, expect } from "@playwright/test";

test.describe("AI page", () => {
  test("renders all sections with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/ai");

    await expect(
      page.getByRole("heading", { name: "AI systems that run in production, not a demo." })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Built for real traffic, not a proof of concept." })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "The part after the demo works." })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Picked per task, not one model for everything." })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Got something worth building?" })
    ).toBeVisible();

    for (const name of [
      "SmartLLMRouter",
      "Production RAG system",
      "Multi-modal vision pipeline",
      "WhatsApp AI assistant",
    ]) {
      await expect(page.getByRole("heading", { name })).toBeVisible();
    }

    expect(errors).toEqual([]);
  });

  test("navbar 'AI' link navigates to the dedicated page", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.locator("header").getByRole("link", { name: "AI", exact: true }).click();
    await expect(page).toHaveURL("/ai");
  });

  test("hero CTAs work: see systems scrolls, start a project goes to contact", async ({
    page,
  }) => {
    await page.goto("/ai");

    await page.getByRole("button", { name: "See the systems" }).click();
    await expect(page.locator("#projects")).toBeInViewport();

    await page.goto("/ai");
    await page.locator("main").getByRole("button", { name: "Start a project" }).click();
    await expect(page).toHaveURL("/contact");
  });
});
