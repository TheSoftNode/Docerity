import { test, expect } from "@playwright/test";

import { applyWriteUp } from "@/lib/content/project-writeup";
import type { ProjectInput } from "@/lib/content/project-schema";

/* Unit tests for pasting a write-up into the project editor. Never opens a page. */

const base: ProjectInput = {
  slug: "easmark", name: "Easmark", category: "AI · EdTech", groups: ["AI"], description: "Old", tags: [], status: "In progress",
  preview: "dashboard", liveUrl: "", repoUrl: "", media: { type: "image", publicId: "p1", src: "", alt: "Shot", poster: "" }, gallery: [],
  client: "", featured: true, published: true, sortOrder: 3, role: "", timeline: "", results: [],
  body: [{ heading: "Old", paragraphs: ["x"], image: { publicId: "img", src: "", alt: "a", caption: "" } }],
  confidential: false, recognition: "", recognitionUrl: "", demoUrl: "", proofUrl: "", proofLabel: "", contributions: [], showcase: "",
};

test("fills the words and leaves the URL, screenshots and publishing alone", () => {
  const block = "```json\n" + JSON.stringify({
    slug: "moved", published: false, featured: false, media: null,
    description: "AI-assisted marking for thesis papers and code.", role: "Founder, full-stack", status: "Prototype", showcase: "prototype",
    tags: ["Next.js", " ", "FastAPI"], contributions: ["Built the marker"],
    body: [{ heading: "The problem", paragraphs: ["Marking takes weeks."] }, { heading: "", paragraphs: [] }],
  }) + "\n```";
  const result = applyWriteUp(base, block);
  expect(result.ok).toBe(true);
  if (!result.ok) return;
  const p = result.project;
  expect([p.slug, p.published, p.featured, p.sortOrder, p.media?.publicId]).toEqual(["easmark", true, true, 3, "p1"]);
  expect(p.description).toBe("AI-assisted marking for thesis papers and code.");
  expect(p.status).toBe("Prototype");
  expect(p.tags).toEqual(["Next.js", "FastAPI"]);
  expect(p.body).toHaveLength(1);
  expect(p.body[0].image?.publicId).toBe("img");
  expect(result.changed).toContain("write-up sections");
});

test("refuses a broken block and unknown statuses", () => {
  expect(applyWriteUp(base, '{ "description": "cut off').ok).toBe(false);
  const result = applyWriteUp(base, JSON.stringify({ status: "Shipped", showcase: "nowhere" }));
  expect(result.ok).toBe(false);
});
