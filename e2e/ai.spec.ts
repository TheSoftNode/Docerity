import { test, expect } from "@playwright/test";

import { heading } from "./copy";

test.describe("AI page", () => {
  test("renders all sections with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/ai");

    for (const name of [
      "AI systems that run in production, not a demo.",
      "Built for real traffic, not a proof of concept.",
      "The part after the demo works.",
      "Picked per task, not one model for everything.",
      heading("homepage", "home-cta").replace(/\*/g, ""),
    ]) {
      await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
    }

    for (const name of ["SmartLLMRouter", "Production RAG system", "Multi-modal vision pipeline", "WhatsApp AI assistant"]) {
      await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
    }

    expect(errors).toEqual([]);
  });

  test("the router routes what a visitor types", async ({ page }) => {
    await page.goto("/ai");
    const request = page.getByLabel(/Your request/);

    await request.fill("Is this comment spam?");
    await expect(page.getByText("Has a short, known answer")).toBeVisible();
    await expect(page.getByText("Rule-based", { exact: true }).first()).toBeVisible();

    await request.fill("Describe this product photo for our launch");
    await expect(page.getByText("Needs to see an image")).toBeVisible();
    await expect(page.getByText("GPT-4o", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Full price")).toBeVisible();
  });

  test("the examples fill the request and are marked as chosen", async ({ page }) => {
    await page.goto("/ai");
    const example = page.getByRole("button", { name: "Summarise these 40 replies" });
    await example.click();
    await expect(example).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByLabel(/Your request/)).toHaveValue("Summarise these 40 replies");
    await expect(page.getByText("Transforms existing text")).toBeVisible();
  });

  test("navbar 'AI' link navigates to the dedicated page", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.locator("header").getByRole("link", { name: "AI", exact: true }).click();
    await expect(page).toHaveURL("/ai");
  });

  test("'see the systems' scrolls to them", async ({ page }) => {
    await page.goto("/ai");
    await page.getByRole("link", { name: "see the systems" }).click();
    await expect(page.locator("#systems")).toBeInViewport();
  });
});
