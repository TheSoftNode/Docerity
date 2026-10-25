import { test, expect } from "@playwright/test";

import { engagementId, usableEngagements, withArticle } from "@/components/sections/how-we-work-page/how-we-work-content";
import { DEFAULTS } from "@/lib/content/blocks/defaults";
import type { EngagementView } from "@/lib/content/blocks/views";

/*
  Unit tests for the How we work page's small rules. Like the other
  *-content specs these never open a page.
*/

test.describe("engagementId", () => {
  test("is the name as a link-safe slug", () => {
    expect(engagementId("Discovery & audit")).toBe("discovery-audit");
    expect(engagementId("  Fixed-scope project ")).toBe("fixed-scope-project");
    expect(engagementId("&&&")).toBe("engagement");
  });
});

test.describe("usableEngagements", () => {
  test("leaves out one that cannot finish the sentence", () => {
    const shown = usableEngagements([
      { title: "Retainer", need: "steady help." },
      { title: "", need: "something." },
      { title: "Audit", need: "  " },
    ]);
    expect(shown.map((engagement) => engagement.title)).toEqual(["Retainer"]);
  });

  test("fills a missing choice with the name, and drops blank steps", () => {
    const [shown] = usableEngagements([{ title: "Retainer", need: "help.", steps: ["One", " ", ""] }]);
    expect(shown.choice).toBe("Retainer");
    expect(shown.steps).toEqual(["One"]);
    expect(shown.summary).toBe("");
  });

  test("two with the same name still get their own ids", () => {
    const ids = usableEngagements([
      { title: "Audit", need: "a." },
      { title: "Audit", need: "b." },
    ]).map((engagement) => engagement.id);
    expect(ids).toEqual(["audit", "audit-2"]);
  });

  test("every built-in engagement is shown, with steps", () => {
    const raw = DEFAULTS["how-we-work"].engagements as unknown as EngagementView[];
    const shown = usableEngagements(raw);
    expect(shown).toHaveLength(raw.length);
    for (const engagement of shown) expect(engagement.steps.length).toBeGreaterThan(0);
  });
});

test.describe("withArticle", () => {
  test("agrees the article with the name", () => {
    expect(withArticle("That's a", "Monthly retainer")).toBe("That's a");
    expect(withArticle("That's a", "Audit")).toBe("That's an");
    expect(withArticle("That's an", "Retainer")).toBe("That's a");
    expect(withArticle("A", "Engagement")).toBe("An");
  });

  test("leaves other wording alone", () => {
    expect(withArticle("You want", "Audit")).toBe("You want");
  });
});
