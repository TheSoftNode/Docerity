import { test, expect } from "@playwright/test";

test.describe("Web3 page", () => {
  test("renders all sections with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/web3");

    await expect(
      page.getByRole("heading", { name: "Hackathon-winning dApps, shipped on real chains." })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Built, shipped, and recognized." })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Cross-chain, not locked to one network." })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "On-chain systems that hold up under real use." })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Got something worth building?" })
    ).toBeVisible();

    for (const name of ["VeriAI", "MetaPilot", "RealPayTag Protocol"]) {
      await expect(page.getByRole("heading", { name })).toBeVisible();
    }

    expect(errors).toEqual([]);
  });

  test("navbar 'Web3' link navigates to the dedicated page", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.locator("header").getByRole("link", { name: "Web3", exact: true }).click();
    await expect(page).toHaveURL("/web3");
  });

  test("hero CTAs work: see projects scrolls, start a project goes to contact", async ({
    page,
  }) => {
    await page.goto("/web3");

    await page.getByRole("button", { name: "See the projects" }).click();
    await expect(page.locator("#projects")).toBeInViewport();

    await page.goto("/web3");
    await page.locator("main").getByRole("button", { name: "Start a project" }).click();
    await expect(page).toHaveURL("/contact");
  });
});
