/**
 * The homepage's colour palettes.
 *
 * One signature palette and three alternates, rather than the long list that
 * was tried during design. A visitor who switches is choosing a mood for the
 * same brand, and four is the most that still reads as one company: every
 * extra palette is another first impression somebody else might get.
 *
 * The colours themselves live in `app/home.css` as custom properties keyed off
 * `data-palette` on <html>. This file holds only what JavaScript needs: the
 * keys, the names a person sees, the two swatch colours the switcher draws,
 * and the logo recoloured for each palette.
 *
 * Shared by the server (the no-flash script) and the client (the switcher),
 * so it imports nothing that is either.
 */

export const PALETTE_KEYS = ["sapphire", "swiss", "brass", "volt"] as const;

export type PaletteKey = (typeof PALETTE_KEYS)[number];

export type Palette = {
  key: PaletteKey;
  name: string;
  /** The darkest colour, drawn as the left half of the switcher's swatch. */
  ink: string;
  /** The accent, drawn as the right half. */
  accent: string;
  /** The Docerity mark, recoloured to sit in this palette. */
  logo: string;
};

/** The brand palette. What everyone sees until they choose otherwise. */
export const DEFAULT_PALETTE: PaletteKey = "sapphire";

/**
 * Where a visitor's choice is kept between visits.
 *
 * Namespaced, because `localStorage` is shared with everything else on the
 * origin, including next-themes, which keeps its own `theme` key.
 */
export const PALETTE_STORAGE_KEY = "docerity:palette";

export const PALETTES: readonly Palette[] = [
  {
    key: "sapphire",
    name: "Sapphire Navy",
    ink: "#08102E",
    accent: "#FF7A59",
    logo: "/brand/logo-sapphire.png",
  },
  {
    key: "swiss",
    name: "Swiss Mono",
    ink: "#0B0B0B",
    accent: "#FF3B30",
    logo: "/brand/logo-swiss.png",
  },
  {
    key: "brass",
    name: "Oxblood & Brass",
    ink: "#170A0D",
    accent: "#F5B83D",
    logo: "/brand/logo-brass.png",
  },
  {
    key: "volt",
    name: "Midnight Volt",
    ink: "#0C0B1D",
    accent: "#D6FF3B",
    logo: "/brand/logo-volt.png",
  },
];

export function isPaletteKey(value: unknown): value is PaletteKey {
  return typeof value === "string" && (PALETTE_KEYS as readonly string[]).includes(value);
}
