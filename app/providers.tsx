"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Theme provider.
 *
 * `attribute="class"` matches the stylesheet, which keys dark values off a
 * `.dark` class on <html> (see `@custom-variant dark` in globals.css).
 * `enableSystem` means a visitor who has never chosen gets their OS setting,
 * and `disableTransitionOnChange` stops every colour-transition on the page
 * from animating at once when the theme flips.
 */
function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}

export { Providers };
