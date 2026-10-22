"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { ArrowUpRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/lib/content/blocks/site";
import { useScrolled } from "@/hooks/use-scrolled";
import { PaletteLogo } from "@/components/shared/palette/palette-logo";
import {
  PaletteSwatchRow,
  PaletteSwitcher,
} from "@/components/shared/palette/palette-switcher";

type Props = Pick<SiteSettings, "name" | "navLinks">;

/**
 * Three lines that become a cross. Drawn as spans rather than swapped icons so
 * the change is a motion, which is what tells somebody the same button closes
 * what it opened.
 */
function Hamburger({ open }: { open: boolean }) {
  const bar = "absolute inset-x-0 h-0.5 rounded-full bg-current transition-all duration-300";
  return (
    <span aria-hidden="true" className="relative block h-3.5 w-5">
      <span className={cn(bar, "top-0", open && "translate-y-1.5 rotate-45")} />
      <span className={cn(bar, "top-1.5", open && "opacity-0")} />
      <span className={cn(bar, "top-3", open && "-translate-y-1.5 -rotate-45")} />
    </span>
  );
}

function HomeNavView({ name, navLinks }: Props) {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  /* Escape closes the menu, as it would a dialog. Listening only while it is
     open keeps the handler from competing with the palette popover's own. */
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /* No side padding on the header from `lg`: there the pill itself is the page
     shell, so its edge lines up with every section's content edge. */
  return (
    <header className="sticky top-3.5 z-40 px-3 sm:px-6 lg:px-0">
      <nav
        aria-label="Main"
        className={cn(
          "doc-shell flex items-center justify-between gap-3 rounded-full border py-2.5 pr-2.5 pl-4 backdrop-blur-[14px] transition-colors duration-300 sm:pl-5",
          "border-[rgb(var(--ld-paper-rgb)/0.14)] text-[var(--ld-paper)]",
          scrolled ? "bg-[rgb(var(--ld-ink-rgb)/0.86)]" : "bg-[rgb(var(--ld-ink-rgb)/0.6)]"
        )}
      >
        <Link
          href="/"
          className="ld-display flex items-center gap-3 text-[21px] font-extrabold tracking-[-0.02em]"
        >
          <PaletteLogo className="size-[34px]" priority />
          {name}
        </Link>

        {/* The full row appears only where all of it fits. Below that the links
            move into the menu, rather than the bar quietly overflowing. */}
        <ul className="hidden items-center gap-7 text-[15px] font-medium text-[var(--ld-muted)] xl:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link href={link.href} className="transition-opacity hover:opacity-70">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <PaletteSwitcher className="hidden sm:grid" />
          <Link
            href="/contact"
            className="group hidden min-h-11 items-center gap-2 rounded-full bg-[var(--ld-accent)] px-5 text-[15px] font-semibold text-[var(--ld-ink)] transition-transform hover:-translate-y-0.5 sm:inline-flex"
          >
            Start a project
            <ArrowUpRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
            className="grid size-11 place-items-center rounded-full bg-[var(--ld-paper)] text-[var(--ld-ink)] xl:hidden"
          >
            <Hamburger open={open} />
          </button>
        </div>
      </nav>

      {open ? (
        <div
          id={menuId}
          className="ld-zoom doc-shell mt-2.5 rounded-3xl bg-[var(--ld-paper)] p-6 text-[var(--ld-ink)] shadow-[0_30px_60px_-24px_rgb(0_0_0/0.5)] xl:hidden"
        >
          <ul className="ld-display flex flex-col text-[28px] font-bold">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} onClick={() => setOpen(false)} className="block py-2">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-5 mb-1 font-mono text-[11px] tracking-[0.12em] text-[var(--ld-text-muted)] uppercase">
            Colour theme
          </p>
          <PaletteSwatchRow className="-ml-1.5" />

          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="mt-5 flex min-h-13 items-center justify-center rounded-full bg-[var(--ld-accent)] font-semibold text-[var(--ld-ink)]"
          >
            Start a project
          </Link>
        </div>
      ) : null}
    </header>
  );
}

export { HomeNavView };
