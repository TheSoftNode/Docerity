import { test, expect } from "@playwright/test";

import { engagementId, usableEngagements } from "@/components/sections/how-we-work-page/how-we-work-content";
import { DEFAULTS } from "@/lib/content/blocks/defaults";
import type { EngagementView } from "@/lib/content/blocks/views";

/*
  Unit tests for the How we work page's small rules. Like the other
  *-content specs these never open a page.
*/

test.describe("engagementId", () => {
  test("is the name as a link-safe slug", () => {
    expect(engagementId("Review & planning")).toBe("review-planning");
    expect(engagementId("  Engineers for your team ")).toBe("engineers-for-your-team");
    expect(engagementId("&&&")).toBe("option");
  });
});

test.describe("usableEngagements", () => {
  test("leaves out one with no name", () => {
    const shown = usableEngagements([{ title: "Monthly support" }, { title: "  ", forWho: "Someone." }]);
    expect(shown.map((option) => option.title)).toEqual(["Monthly support"]);
  });

  test("trims what it shows, and drops blank steps", () => {
    const [shown] = usableEngagements([{ title: " Support ", forWho: " Live products. ", steps: ["One", " ", ""] }]);
    expect(shown).toMatchObject({ title: "Support", forWho: "Live products.", goodFor: "", steps: ["One"] });
  });

  test("two with the same name still get their own ids", () => {
    const ids = usableEngagements([{ title: "Review" }, { title: "Review" }]).map((option) => option.id);
    expect(ids).toEqual(["review", "review-2"]);
  });

  test("every built-in option is shown, saying who it is for, with steps", () => {
    const raw = DEFAULTS["how-we-work"].engagements as unknown as EngagementView[];
    const shown = usableEngagements(raw);
    expect(shown).toHaveLength(raw.length);
    for (const option of shown) {
      expect(option.forWho).not.toBe("");
      expect(option.steps.length).toBeGreaterThan(0);
    }
  });
});
