import { test, expect } from "@playwright/test";

import { heading } from "./copy";

test.describe("Web3 page", () => {
  test("renders all sections with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/web3");

    for (const name of [
      "Hackathon-winning dApps, shipped on real chains.",
      "Built, shipped, and recognized.",
      "Cross-chain, not locked to one network.",
      "On-chain systems that hold up under real use.",
      heading("homepage", "home-cta").replace(/\*/g, ""),
    ]) {
      await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
    }

    const contracts = page.locator("#contracts");
    for (const name of ["VeriAI", "MetaPilot", "RealPayTag Protocol"]) {
      await expect(contracts.getByRole("button", { name: new RegExp(`^${name}`) })).toBeVisible();
    }

    expect(errors).toEqual([]);
  });

  test("searching filters the contracts", async ({ page }) => {
    await page.goto("/web3");
    await page.getByLabel("Search the contracts").fill("payroll");
    const contracts = page.locator("#contracts");
    await expect(contracts.getByRole("button", { name: /^RealPayTag Protocol/ })).toBeVisible();
    await expect(contracts.getByRole("button", { name: /^VeriAI/ })).toHaveCount(0);

    await page.getByLabel("Search the contracts").fill("nothing like this");
    await expect(contracts.getByText(/Nothing matches that/)).toBeVisible();
  });

  test("picking a contract opens its page, with its facts and events", async ({ page }) => {
    await page.goto("/web3");
    await page.locator("#contracts").getByRole("button", { name: /^MetaPilot/ }).click();

    await expect(page.getByRole("heading", { level: 3, name: "MetaPilot" })).toBeVisible();
    /* The size is read out of the project's own description. */
    await expect(page.getByText("2,000+ lines", { exact: true }).first()).toBeVisible();

    await page.getByRole("tab", { name: "Events" }).click();
    await expect(page.getByText("Live on Solana")).toBeVisible();
  });

  test("a network filters the contracts to that chain", async ({ page }) => {
    await page.goto("/web3");
    const network = page.getByRole("button", { name: /^Stacks/ });
    await network.click();
    await expect(network).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#contracts").getByText(/Nothing matches that/)).toBeVisible();

    await network.click();
    await expect(page.locator("#contracts").getByRole("button", { name: /^VeriAI/ })).toBeVisible();
  });

  test("what we build opens as contract methods", async ({ page }) => {
    await page.goto("/web3");
    const method = page.getByRole("button", { name: /defiAutomation/ });
    await method.click();
    await expect(method).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText(/Autonomous protocols for voting/)).toBeVisible();
  });

  test("navbar 'Web3' link navigates to the dedicated page", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.locator("header").getByRole("link", { name: "Web3", exact: true }).click();
    await expect(page).toHaveURL("/web3");
  });
});
