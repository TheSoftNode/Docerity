import { test, expect } from "@playwright/test";

import { safeLink } from "@/lib/content/blocks/links";

/*
  Unit tests for the site settings' small rules. Like the other unit specs
  this never opens a page; it is in the mobile project's testIgnore list.
*/

test.describe("safeLink", () => {
  test("keeps an https address as typed", () => {
    expect(safeLink("https://cal.com/theo/intro")).toBe("https://cal.com/theo/intro");
    expect(safeLink("  https://calendly.com/x  ")).toBe("https://calendly.com/x");
  });

  test("refuses anything else", () => {
    for (const value of ["", "   ", "cal.com/theo", "http://cal.com/theo", "javascript:alert(1)", undefined]) {
      expect(safeLink(value)).toBe("");
    }
  });
});
