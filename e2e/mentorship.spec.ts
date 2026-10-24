import { test, expect } from "@playwright/test";

import { checkpoints, heading } from "./copy";

/*
  The homepage's mentorship staircase. One step per editable checkpoint, so
  the stages are read from the defaults rather than named here.
*/
test.describe("Mentorship", () => {
  test("draws a step for every stage, with no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(String(err)));

    await page.goto("/");
    const section = page.locator("#mentorship");
    await section.scrollIntoViewIfNeeded();

    await expect(
      section.getByRole("heading", { name: heading("homepage", "home-mentorship") })
    ).toBeVisible();

    const stages = section.getByRole("list", { name: "Mentorship stages" });
    for (const stage of checkpoints()) {
      await expect(stages.getByRole("button", { name: new RegExp(stage.label) })).toBeVisible();
    }

    expect(errors).toEqual([]);
  });

  test("choosing a step describes it and marks it as the current one", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#mentorship");
    await section.scrollIntoViewIfNeeded();

    const [first, second] = checkpoints();
    const stages = section.getByRole("list", { name: "Mentorship stages" });

    await expect(stages.getByRole("button", { name: new RegExp(first.label) })).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    const next = stages.getByRole("button", { name: new RegExp(second.label) });
    await next.click();
    await expect(next).toHaveAttribute("aria-pressed", "true");
    await expect(section.getByText(second.detail)).toBeVisible();
  });
});
