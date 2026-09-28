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
      page.getByRole("heading", { name: heading("homepage", "home-cta").replace(/\*/g, "") })
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

  test("the page is reachable from the services list and the footer", async ({ page }) => {
    /*
      Not from the header any more. It fits six items and Services made a
      seventh, so the specialisms moved under Services, which is where
      somebody looking for them would go. Both routes are asserted because
      they are the only two there now.
    */
    await page.setViewportSize({ width: 1440, height: 900 });

    await page.goto("/services");
    await page
      .locator("#services")
      .getByRole("heading", { name: /AI/i })
      .first()
      .scrollIntoViewIfNeeded();
    await page.locator(`#services a[href="/ai"]`).first().click();
    await expect(page).toHaveURL("/ai");

    await page.goto("/");
    await page.locator("footer").getByRole("link", { name: "AI", exact: true }).click();
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
