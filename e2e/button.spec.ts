import { test, expect } from "@playwright/test";

/** Relative luminance, for the WCAG contrast ratio below. */
function luminance([r, g, b]: number[]) {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a: number[], b: number[]) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function parse(colour: string): number[] {
  const nums = colour.match(/[\d.]+/g)?.map(Number) ?? [];
  return nums.slice(0, 3);
}

test.describe("Buttons", () => {
  test("carry the chamfered silhouette", async ({ page }) => {
    await page.goto("/");
    const clip = await page
      .locator("section a[href='/contact']")
      .first()
      .evaluate((el) => getComputedStyle(el).clipPath);

    /* A rounded rectangle would report `none`; the polygon is the shape. */
    expect(clip).toContain("polygon");
  });

  test("the focus indicator is visible against the button it sits on", async ({ page }) => {
    /*
      This exists because the indicator was invisible twice while being
      present in the computed style.

      First an inset `box-shadow`, which Tailwind composes from several custom
      properties and which silently dropped the colour. Then an outline in the
      ring colour — which is the same sapphire as the primary button's fill,
      so it painted sapphire on sapphire. `clip-path` also erases any outer
      ring, so none of the usual defaults would have worked here.
    */
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const target = page.locator("section a[href='/contact']").first();
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press("Tab");
      if (await target.evaluate((el) => el === document.activeElement)) break;
    }

    const style = await target.evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        focusVisible: el.matches(":focus-visible"),
        style: cs.outlineStyle,
        width: parseFloat(cs.outlineWidth),
        colour: cs.outlineColor,
        fill: cs.backgroundColor,
      };
    });

    expect(style.focusVisible, "the CTA never took keyboard focus").toBe(true);
    expect(style.style, "focus outline is not drawn").not.toBe("none");
    expect(style.width, "focus outline is too thin to see").toBeGreaterThanOrEqual(2);

    const ratio = contrast(parse(style.colour), parse(style.fill));
    expect(
      ratio,
      `focus outline ${style.colour} on fill ${style.fill} is only ${ratio.toFixed(2)}:1`
    ).toBeGreaterThanOrEqual(3);
  });
});
