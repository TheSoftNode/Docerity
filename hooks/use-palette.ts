"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  DEFAULT_PALETTE,
  isPaletteKey,
  PALETTE_STORAGE_KEY,
  type PaletteKey,
} from "@/lib/theme/palettes";

/*
  The palette is owned by the `data-palette` attribute on <html>, not by React.

  The no-flash script sets it before React exists, and every switcher on the
  page (the navbar's and the mobile menu's) has to agree with it. Reading the
  attribute through `useSyncExternalStore` makes the DOM the single source of
  truth: a change from either switcher is observed by both, and the server
  render simply reports the default.
*/

/** How long the cross-fade class stays on <html>. Matches home.css. */
const TRANSITION_MS = 500;

function read(): PaletteKey {
  const value = document.documentElement.getAttribute("data-palette");
  return isPaletteKey(value) ? value : DEFAULT_PALETTE;
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-palette"],
  });
  return () => observer.disconnect();
}

function usePalette() {
  const palette = useSyncExternalStore(subscribe, read, () => DEFAULT_PALETTE);

  const setPalette = useCallback((next: PaletteKey) => {
    const root = document.documentElement;
    if (root.getAttribute("data-palette") === next) return;

    root.classList.add("ld-palette-changing");
    root.setAttribute("data-palette", next);
    window.setTimeout(() => root.classList.remove("ld-palette-changing"), TRANSITION_MS);

    /* Storage can throw in some privacy modes. The choice still applies for
       this visit; it just will not be remembered. */
    try {
      window.localStorage.setItem(PALETTE_STORAGE_KEY, next);
    } catch {}
  }, []);

  return { palette, setPalette };
}

export { usePalette };
