import { test, expect } from "@playwright/test";

import { EXAMPLES, TIERS, formatCost, formatWeight, route } from "@/components/sections/ai-page/ai-router";

/*
  Unit tests for the AI page's router illustration. Like home-content.spec.ts
  these never open a page.
*/
test.describe("route", () => {
  test("sends each kind of request to the tier that fits it", () => {
    expect(TIERS[route("Describe this product photo for Instagram").tier].model).toBe("GPT-4o");
    expect(TIERS[route("Summarise these 40 replies").tier].model).toBe("Gemini");
    expect(TIERS[route("Is this comment spam?").tier].model).toBe("Rule-based");
    expect(TIERS[route("What are your opening hours?").tier].model).toBe("Rule-based");
  });

  test("adds signals up: writing in a brand voice is complex", () => {
    const result = route("Draft a launch post in our brand voice");
    expect(result.signals.map((signal) => signal.label)).toEqual(["Writes something new", "Has to match a brand voice"]);
    expect(result.tier).toBe(0);
  });

  test("a long request carries context", () => {
    const result = route(`Summarise ${"these replies and ".repeat(8)}the thread`);
    expect(result.signals.map((signal) => signal.label)).toContain("Long request, lots of context");
  });

  test("an empty request costs almost nothing and notices nothing", () => {
    expect(route("   ")).toEqual({ signals: [], score: 0, tier: 2, saving: 1 - TIERS[2].cost });
  });

  test("every example lands on a tier", () => {
    for (const example of EXAMPLES) expect(TIERS[route(example).tier]).toBeTruthy();
  });

  test("the saving is against sending everything to the top model", () => {
    expect(route("Describe this photo").saving).toBe(0);
    expect(route("Summarise this").saving).toBeCloseTo(0.88);
  });
});

test.describe("formatting", () => {
  test("weights and costs", () => {
    expect(formatWeight(2)).toBe("+2");
    expect(formatWeight(-1)).toBe("−1");
    expect(formatWeight(0)).toBe("0");
    expect(formatCost(1)).toBe("1.00×");
    expect(formatCost(0.12)).toBe("0.12×");
    expect(formatCost(0.005)).toBe("0.005×");
  });
});
