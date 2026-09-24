"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Theme provider.
 *
 * `attribute="class"` matches the stylesheet, which keys dark values off a
 * `.dark` class on <html> (see `@custom-variant dark` in globals.css).
 *
 * Dark is the brand's own palette, so it is what everyone sees first:
 * `enableSystem` is off, which is what makes `defaultTheme` actually apply.
 * Left on, next-themes would resolve "system" for anyone who has not chosen
 * and a light-OS visitor would land on the light theme instead. A saved
 * choice still wins on every later visit.
 *
 * `disableTransitionOnChange` stops every colour transition on the page from
 * animating at once when the theme flips.
 */
function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}

export { Providers };
