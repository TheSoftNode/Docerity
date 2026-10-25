import { test, expect } from "@playwright/test";

import { fillEmail, headingId, legalBlocks, summaryPoints } from "@/components/sections/legal-page/legal-content";
import { DEFAULTS } from "@/lib/content/blocks/defaults";

/*
  Unit tests for reading the privacy policy and terms. Like the other
  *-content specs these never open a page.
*/

const privacy = DEFAULTS.legal.privacy as { summary: string; body: string };
const terms = DEFAULTS.legal.terms as { summary: string; body: string };

test.describe("legalBlocks", () => {
  test("reads headings, paragraphs and lists", () => {
    expect(legalBlocks("## Who we are\n\nWe build.\nStill this paragraph.\n\nWe collect:\n- your name\n- your email")).toEqual([
      { kind: "heading", text: "Who we are", id: "who-we-are" },
      { kind: "paragraph", text: "We build. Still this paragraph." },
      { kind: "paragraph", text: "We collect:" },
      { kind: "list", items: ["your name", "your email"] },
    ]);
  });

  test("a paragraph after a list in the same block is its own", () => {
    expect(legalBlocks("- one\n- two\nAfter.").map((block) => block.kind)).toEqual(["list", "paragraph"]);
  });

  test("two headings with the same text get their own ids", () => {
    const ids = legalBlocks("## Changes\n\n## Changes").flatMap((block) => (block.kind === "heading" ? [block.id] : []));
    expect(ids).toEqual(["changes", "changes-2"]);
  });

  test("windows line endings and stray blank lines change nothing", () => {
    expect(legalBlocks("\r\n## A\r\n\r\n\r\nText.\r\n")).toEqual(legalBlocks("## A\n\nText."));
  });
});

test.describe("small rules", () => {
  test("a heading's id is link-safe", () => {
    expect(headingId("Data stored outside Nigeria")).toBe("data-stored-outside-nigeria");
    expect(headingId("???")).toBe("section");
  });

  test("{email} becomes the address, every time", () => {
    expect(fillEmail("Email {email} or {email}.", "a@b.co")).toBe("Email a@b.co or a@b.co.");
  });

  test("the short version is one point per line", () => {
    expect(summaryPoints("One.\n\n- Two.\n  ")).toEqual(["One.", "Two."]);
  });
});

test.describe("the shipped text", () => {
  test("both pages have a summary, sections and the contact address", () => {
    for (const text of [privacy, terms]) {
      expect(summaryPoints(text.summary).length).toBeGreaterThan(2);
      expect(legalBlocks(text.body).filter((block) => block.kind === "heading").length).toBeGreaterThan(4);
      expect(text.body).toContain("{email}");
    }
  });

  test("the privacy policy names every service that holds data", () => {
    for (const service of ["Vercel", "MongoDB Atlas", "Cloudinary", "Gmail"]) expect(privacy.body).toContain(service);
  });
});
