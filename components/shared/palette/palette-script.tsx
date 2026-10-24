import {
  DEFAULT_PALETTE,
  PALETTE_KEYS,
  PALETTE_STORAGE_KEY,
} from "@/lib/theme/palettes";

/**
 * Applies a returning visitor's palette before the first paint.
 *
 * The choice lives in localStorage, which the server cannot read, so without
 * this the page would render in the brand palette and then visibly repaint
 * once React hydrated. A blocking inline script in <head> runs before the body
 * is painted, which is the same technique next-themes uses for light and dark.
 *
 * Deliberately tiny and defensive: it validates the stored value against the
 * known keys, so a stale or tampered entry cannot put an arbitrary string into
 * an attribute the stylesheet selects on, and it swallows storage errors,
 * which some privacy modes throw on read.
 */
const script = `(function(){try{var k=localStorage.getItem(${JSON.stringify(
  PALETTE_STORAGE_KEY
)});var ok=${JSON.stringify(PALETTE_KEYS)};document.documentElement.setAttribute("data-palette",ok.indexOf(k)>-1?k:${JSON.stringify(
  DEFAULT_PALETTE
)});}catch(e){document.documentElement.setAttribute("data-palette",${JSON.stringify(
  DEFAULT_PALETTE
)});}})();`;

function PaletteScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export { PaletteScript };
