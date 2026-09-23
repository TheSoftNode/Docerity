"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Light/dark switch, backed by next-themes.
 *
 * Which icon shows is decided in CSS (`dark:hidden` / `hidden dark:block`),
 * not React state. `resolvedTheme` is undefined until next-themes has mounted,
 * so a state-driven icon would either render nothing on the first pass or
 * disagree with the server and trip a hydration mismatch. Keying off the class
 * on <html> keeps the markup identical on both sides.
 */
function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  function toggle() {
    // Before mount `resolvedTheme` is undefined; the class is already correct
    // by then because next-themes applies it pre-paint, so read from there.
    const isDark =
      resolvedTheme === undefined
        ? document.documentElement.classList.contains("dark")
        : resolvedTheme === "dark";
    setTheme(isDark ? "light" : "dark");
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Toggle light and dark theme"
      className={cn("text-muted-foreground hover:text-foreground", className)}
    >
      <SunIcon className="hidden dark:block" />
      <MoonIcon className="dark:hidden" />
    </Button>
  );
}

export { ThemeToggle };
