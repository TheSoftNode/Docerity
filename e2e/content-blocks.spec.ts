import { test, expect } from "@playwright/test";

import { isContentIconName } from "@/lib/content/icons";
import { cleanBlock, safeImagePath, validateBlock } from "@/lib/content/blocks/clean";
import { DEFAULTS } from "@/lib/content/blocks/defaults";
import { mergeBlock } from "@/lib/content/blocks/merge";
import {
  BLOCKS,
  BLOCK_KEYS,
  blockFor,
  isBlockKey,
  type BlockRecord,
} from "@/lib/content/blocks/schema";

/*
  The editable page sections, checked against their own descriptions.

  These need no browser, so they run in Node like the other unit specs. The
  point of them is that `schema.ts` and `defaults.ts` are two halves of the same
  statement, written in different files by hand, and nothing else notices when
  they drift: a field added to the schema and not to the defaults is a blank
  input, and a field in the defaults the schema does not mention is silently
  dropped on the first save. Both of those are quiet, and both are caught here.
*/

test.describe.configure({ mode: "parallel" });

test.describe("Every content block", () => {
  test("has defaults for every group it describes", () => {
    for (const block of BLOCKS) {
      const defaults = DEFAULTS[block.key];
      for (const group of block.groups) {
        expect(
          defaults[group.name],
          `${block.key}.${group.name} has no default`
        ).toBeDefined();
      }
    }
  });

  test("keyed groups have a default for every entry they declare", () => {
    /* A component looks these up by name. A missing one renders nothing, which
       is a heading quietly disappearing rather than an error. */
    for (const block of BLOCKS) {
      for (const group of block.groups) {
        if (group.kind !== "keyed") continue;
        const stored = DEFAULTS[block.key][group.name] as Record<string, BlockRecord>;
        for (const entry of group.entries) {
          expect(
            stored?.[entry.key],
            `${block.key}.${group.name}.${entry.key} has no default`
          ).toBeDefined();
        }
      }
    }
  });

  test("describes every group its defaults carry", () => {
    /* The other direction: a default nothing describes is content that renders
       today and cannot be edited, which is the whole problem this replaced. */
    for (const block of BLOCKS) {
      const described = new Set(block.groups.map((group) => group.name));
      for (const name of Object.keys(DEFAULTS[block.key])) {
        expect(described.has(name), `${block.key}.${name} is not described`).toBe(true);
      }
    }
  });

  test("survives a clean unchanged", () => {
    /*
      The strongest of these. `cleanBlock` rebuilds a block from the field
      descriptions alone, so anything the defaults carry that the schema does
      not mention disappears here, and anything the schema requires that the
      defaults lack appears as an empty string. Round-tripping to itself means
      the two agree field by field, not just group by group.
    */
    for (const key of BLOCK_KEYS) {
      expect(cleanBlock(key, DEFAULTS[key]), `${key} changed when cleaned`).toEqual(
        DEFAULTS[key]
      );
    }
  });

  test("passes its own validation", () => {
    /* The copy that is live today has to be savable. A required field the live
       copy leaves blank would mean the editor refuses to save what the site is
       already showing. */
    for (const key of BLOCK_KEYS) {
      expect(validateBlock(key, DEFAULTS[key]), `${key} does not validate`).toEqual({});
    }
  });

  test("uses icon names the registry knows", () => {
    /* An unknown name resolves to the fallback icon at render time, which is a
       silent wrong answer rather than an error. */
    for (const block of BLOCKS) {
      for (const group of block.groups) {
        if (group.kind !== "list") continue;
        const iconFields = group.fields.filter((field) => field.kind === "icon");
        if (iconFields.length === 0) continue;

        for (const row of DEFAULTS[block.key][group.name] as BlockRecord[]) {
          for (const field of iconFields) {
            const name = row[field.name] as string;
            expect(
              isContentIconName(name),
              `${block.key}.${group.name}.${field.name} is "${name}"`
            ).toBe(true);
          }
        }
      }
    }
  });

  test("fits inside its own limits", () => {
    for (const block of BLOCKS) {
      for (const group of block.groups) {
        if (group.kind === "object" || group.kind === "keyed") continue;
        const value = DEFAULTS[block.key][group.name] as unknown[];
        expect(
          value.length,
          `${block.key}.${group.name} has more entries than its own maximum`
        ).toBeLessThanOrEqual(group.max);
      }
    }
  });
});

test.describe("Block keys", () => {
  test("every key resolves to a block", () => {
    for (const key of BLOCK_KEYS) {
      expect(blockFor(key).key).toBe(key);
    }
  });

  test("anything else is refused", () => {
    /* The route narrows with this before touching the database, so a made-up
       key has to be false rather than merely unknown. */
    for (const value of ["", "About", "../about", "__proto__", 7, null, undefined]) {
      expect(isBlockKey(value)).toBe(false);
    }
  });
});

test.describe("Cleaning what was posted", () => {
  test("drops a field the description does not mention", () => {
    /*
      The save action is a POST endpoint, so this is the boundary. A block is
      rebuilt from its fields rather than merged over, which is what stops
      somebody writing arbitrary keys into the document.
    */
    const cleaned = cleanBlock("contact", {
      steps: [{ title: "A step", description: "What happens.", onclick: "alert(1)" }],
      somethingElse: [{ anything: "at all" }],
    });

    const steps = cleaned.steps as BlockRecord[];
    expect(Object.keys(steps[0]).sort()).toEqual(["description", "title"]);
    expect(cleaned.somethingElse).toBeUndefined();
  });

  test("drops a row somebody added and never filled in", () => {
    /* Adding a row and changing your mind should not block a save of the rows
       above it. */
    const cleaned = cleanBlock("contact", {
      steps: [
        { title: "A step", description: "What happens." },
        { title: "", description: "" },
      ],
    });
    expect((cleaned.steps as BlockRecord[]).length).toBe(1);
  });

  test("refuses to store an image off this site", () => {
    /*
      An absolute URL in an <img src> on a public page hands the host every
      visitor's IP address and leaves the picture swappable afterwards. A
      Cloudinary delivery URL is the one exception, because that is what an
      upload produces.
    */
    expect(safeImagePath("/clients/hitoai.webp")).toBe("/clients/hitoai.webp");
    expect(safeImagePath("https://res.cloudinary.com/demo/image/upload/x.png")).toBe(
      "https://res.cloudinary.com/demo/image/upload/x.png"
    );

    for (const hostile of [
      "https://evil.example/logo.png",
      "//evil.example/logo.png",
      "http://res.cloudinary.com.evil.example/x.png",
      "javascript:alert(1)",
      "data:image/svg+xml,<svg onload=alert(1)>",
    ]) {
      expect(safeImagePath(hostile), hostile).toBe("");
    }
  });

  test("blanks an icon the registry does not know", () => {
    const cleaned = cleanBlock("services", {
      capabilities: [
        { title: "A thing", description: "Doing it.", iconName: "NotARealIcon" },
      ],
    });
    expect((cleaned.capabilities as BlockRecord[])[0].iconName).toBe("");
  });

  test("caps a group at its maximum", () => {
    const tooMany = Array.from({ length: 40 }, (_, i) => ({
      title: `Step ${i}`,
      description: "A description long enough to count.",
    }));
    /* Found by name, not by position: sections gained a headings group and
       `groups[0]` silently became a different group. */
    const group = blockFor("contact").groups.find((g) => g.name === "steps")!;
    const cleaned = cleanBlock("contact", { steps: tooMany });
    expect((cleaned.steps as BlockRecord[]).length).toBe(
      group.kind === "list" ? group.max : 0
    );
  });
});

test.describe("Validating a block", () => {
  test("names the row with the missing field", () => {
    const errors = validateBlock("contact", {
      steps: [
        { title: "Fine", description: "Also fine." },
        { title: "", description: "Missing its title." },
      ],
    });
    expect(errors.steps).toContain("Step 2");
  });

  test("holds a group to its minimum", () => {
    /* The explainer band tickers one pair against another, so a single pair
       has nothing to ticker. */
    const errors = validateBlock("explainers", {
      pairs: [
        {
          id: "caching",
          conceptLabel: "Caching",
          conceptCaption: "Store it once",
          conceptIcon: "ZapIcon",
          analogyLabel: "A sticky note",
          analogyCaption: "Quick answer",
          analogyIcon: "StickyNoteIcon",
        },
      ],
    });
    expect(errors.pairs).toBeTruthy();
  });
});

test.describe("Merging a stored section over the built-in one", () => {
  /*
    The merge decides what a page actually shows, and getting it wrong is
    silent: the editor saves, says "Saved", and the page keeps rendering the
    old copy. That is exactly what happened to keyed groups, which are plain
    objects rather than arrays and fell through an `Array.isArray` check, so
    every section heading and every page title could be edited and ignored.
  */

  test("a stored heading wins over the built-in one", () => {
    const merged = mergeBlock("web3", {
      headings: { "web3-capabilities": { eyebrow: "Mine", title: "Also mine", lede: "" } },
    });

    const headings = merged.headings as Record<string, BlockRecord>;
    expect(headings["web3-capabilities"].title).toBe("Also mine");
  });

  test("and the entries beside it keep the built-in copy", () => {
    /* Taking the whole group from the database would blank every heading the
       person did not touch. */
    const merged = mergeBlock("web3", {
      headings: { "web3-capabilities": { eyebrow: "Mine", title: "Also mine", lede: "" } },
    });

    const headings = merged.headings as Record<string, BlockRecord>;
    const defaults = DEFAULTS.web3.headings as Record<string, BlockRecord>;
    expect(headings["web3-hero"]).toEqual(defaults["web3-hero"]);
  });

  test("a field missing from an older document falls back per field", () => {
    /* A document written before `lede` existed has no such key, and the entry
       should not lose it. */
    const merged = mergeBlock("web3", {
      headings: { "web3-hero": { title: "A newer heading" } },
    });

    const headings = merged.headings as Record<string, BlockRecord>;
    const defaults = DEFAULTS.web3.headings as Record<string, BlockRecord>;
    expect(headings["web3-hero"].title).toBe("A newer heading");
    expect(headings["web3-hero"].lede).toBe(defaults["web3-hero"].lede);
  });

  test("a group emptied to nothing falls back rather than rendering blank", () => {
    /* Deleting every row is indistinguishable from a group that was never
       saved, and showing nothing by accident is worse than showing the
       original. Emptying one for real is what Reset is for. */
    const merged = mergeBlock("contact", { steps: [] });
    expect(merged.steps).toEqual(DEFAULTS.contact.steps);
  });

  test("a stored list wins over the built-in one", () => {
    const merged = mergeBlock("contact", {
      steps: [{ title: "One step", description: "That is all." }],
    });
    expect((merged.steps as BlockRecord[]).length).toBe(1);
  });

  test("an object group merges field by field", () => {
    const merged = mergeBlock("about", { founder: { name: "Someone Else" } });
    const founder = merged.founder as BlockRecord;
    const defaults = DEFAULTS.about.founder as BlockRecord;

    expect(founder.name).toBe("Someone Else");
    expect(founder.role).toBe(defaults.role);
  });

  test("a group the database says nothing about keeps its default", () => {
    const merged = mergeBlock("contact", {});
    expect(merged).toEqual(DEFAULTS.contact);
  });
});
