"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { ArrowUpRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/lib/content/blocks/site";
import { useScrolled } from "@/hooks/use-scrolled";
import { usePalette } from "@/hooks/use-palette";
import { PALETTES } from "@/lib/theme/palettes";
import { PaletteLogo } from "@/components/shared/palette/palette-logo";
import {
  PaletteSwatchRow,
  PaletteSwitcher,
} from "@/components/shared/palette/palette-switcher";

type Props = Pick<SiteSettings, "name" | "navLinks" | "email">;

/* Delay utilities in order, so the menu's rows cascade in when it opens. */
const CASCADE = ["ld-delay-1", "ld-delay-2", "ld-delay-3", "ld-delay-4", "ld-delay-5", "ld-delay-6"];

/**
 * Two fine lines of unequal length that become a cross.
 *
 * The shorter line reaches full width when the button is hovered or focused,
 * a small sign that it responds, and both swing into a cross when the menu is
 * open. Drawn as spans rather than swapped icons, so the change is a motion,
 * which is what tells somebody the same button closes what it opened.
 */
function MenuIcon({ open }: { open: boolean }) {
  const line =
    "absolute right-0 h-[1.5px] rounded-full bg-current transition-all duration-300 ease-[cubic-bezier(.2,.7,.2,1)]";
  return (
    <span aria-hidden="true" className="relative block h-3 w-[18px]">
      <span className={cn(line, open ? "top-[5px] w-full rotate-45" : "top-[2px] w-full")} />
      <span
        className={cn(
          line,
          open
            ? "top-[5px] w-full -rotate-45"
            : "top-[8px] w-[11px] group-hover:w-full group-focus-visible:w-full"
        )}
      />
    </span>
  );
}

function SiteHeaderView({ name, navLinks, email }: Props) {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const pathname = usePathname();
  /* A link is current on its own page and on the pages beneath it, so the
     Projects link stays marked on a project's case study too. */
  const isCurrent = (href: string) =>
    href !== "/" && (pathname === href || pathname.startsWith(`${href}/`));
  const { palette } = usePalette();
  const currentPalette = PALETTES.find((entry) => entry.key === palette) ?? PALETTES[0];

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

  /* The page shell is a wrapper around the pill, not the pill itself. The shell
     zeroes its own padding on wide screens, and on the pill that also stripped
     the pill's inner padding, pressing the logo and the button against its
     rounded ends. As a wrapper it still lines the pill up with every
     section's content edge. */
  return (
    <header className="sticky top-3 z-40">
      <div className="doc-shell">
        <nav
          aria-label="Main"
          className={cn(
            "flex items-center justify-between gap-3 rounded-full border py-1.5 pr-1.5 pl-3.5 backdrop-blur-[14px] transition-colors duration-300 sm:pl-4",
            "border-[rgb(var(--ld-paper-rgb)/0.14)] text-[var(--ld-paper)]",
            /* Glass over the dark heroes at the top. Once scrolled the pill can
               be over a light section, where a see-through navy mixes with the
               white beneath into slate grey, so it goes near-solid and stays
               the same navy over any band. */
            scrolled
              ? "bg-[rgb(var(--ld-ink-rgb)/0.95)] shadow-[0_18px_40px_-24px_rgb(var(--ld-ink-rgb)/0.6)]"
              : "bg-[rgb(var(--ld-ink-rgb)/0.6)]"
          )}
        >
          <Link
            href="/"
            className="ld-display flex items-center gap-2.5 text-[19px] font-extrabold tracking-[-0.02em]"
          >
            <PaletteLogo className="size-[30px]" priority />
            {name}
          </Link>

          {/* The full row appears only where all of it fits. Below that the links
              move into the menu, rather than the bar quietly overflowing. */}
          <ul className="hidden items-center gap-6 text-[14.5px] font-medium text-[var(--ld-muted)] xl:flex">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  aria-current={isCurrent(link.href) ? "page" : undefined}
                  className={cn(
                    "relative transition-opacity hover:opacity-70",
                    isCurrent(link.href) &&
                      "text-[var(--ld-paper)] after:absolute after:inset-x-0 after:-bottom-2 after:h-0.5 after:rounded-full after:bg-[var(--ld-accent)]"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <PaletteSwitcher className="hidden size-10 sm:grid" />
            <Link
              href="/contact"
              className="group hidden min-h-10 items-center gap-1.5 rounded-full bg-[var(--ld-accent)] px-4.5 text-sm font-semibold text-[var(--ld-ink)] transition-transform hover:-translate-y-0.5 sm:inline-flex"
            >
              Start a project
              <ArrowUpRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={menuId}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
              className={cn(
                "group grid size-10 place-items-center rounded-full border outline-none transition-colors duration-300 xl:hidden",
                "border-[rgb(var(--ld-paper-rgb)/0.18)] bg-[rgb(var(--ld-paper-rgb)/0.06)] hover:bg-[rgb(var(--ld-paper-rgb)/0.12)]",
                "focus-visible:ring-1 focus-visible:ring-[rgb(var(--ld-accent-rgb)/0.7)]",
                /* Open is marked by the cross itself, in the accent, rather than
                   by filling the button: a solid disc read as a different
                   control from the glass one it replaced. */
                open ? "text-[var(--ld-accent)]" : "text-[var(--ld-paper)]"
              )}
            >
              <MenuIcon open={open} />
            </button>
          </div>
        </nav>

        {open ? (
          <div
            id={menuId}
            className={cn(
              "ld-zoom mt-2 max-h-[calc(100svh-5.5rem)] overflow-y-auto rounded-[26px] border p-1.5 backdrop-blur-[18px] xl:hidden",
              "border-[rgb(var(--ld-paper-rgb)/0.12)] bg-[rgb(var(--ld-ink-rgb)/0.92)] text-[var(--ld-paper)]",
              "shadow-[0_40px_80px_-30px_rgb(0_0_0/0.7)]"
            )}
          >
            {/* Compact rows, each a full 44px target, sized so the whole menu
                (links, theme and call to action) fits on a small phone without
                scrolling. */}
            <ul className="px-2">
              {navLinks.map((link, index) => (
                <li
                  key={link.label}
                  className={cn("ld-up border-b border-[rgb(var(--ld-paper-rgb)/0.08)] last:border-b-0", CASCADE[index % CASCADE.length])}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={isCurrent(link.href) ? "page" : undefined}
                    className="group flex min-h-11 items-center justify-between gap-4 rounded-xl px-3 transition-colors hover:bg-[rgb(var(--ld-paper-rgb)/0.06)] focus-visible:bg-[rgb(var(--ld-paper-rgb)/0.06)] focus-visible:outline-none"
                  >
                    <span
                      className={cn(
                        "text-base font-medium tracking-[-0.01em]",
                        isCurrent(link.href) && "text-[var(--ld-accent)]"
                      )}
                    >
                      {link.label}
                    </span>
                    <ArrowUpRightIcon
                      aria-hidden="true"
                      className="size-4 text-[var(--ld-muted-3)] transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--ld-accent)]"
                    />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-1.5 rounded-[20px] bg-[rgb(var(--ld-paper-rgb)/0.05)] px-3.5 pt-2.5 pb-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-mono text-[10px] tracking-[0.14em] text-[var(--ld-muted-3)] uppercase">
                  Colour theme
                </p>
                <p className="text-[13px] font-medium text-[var(--ld-muted)]">{currentPalette.name}</p>
              </div>
              <PaletteSwatchRow className="-mx-1.5 justify-between" />
            </div>

            <div className="px-1.5 pt-2.5 pb-1.5">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="group flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--ld-accent)] text-[15px] font-semibold text-[var(--ld-ink)]"
              >
                Start a project
                <ArrowUpRightIcon className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <a
                href={`mailto:${email}`}
                className="mt-2 block text-center font-mono text-[11px] text-[var(--ld-muted-3)] transition-colors hover:text-[var(--ld-paper)]"
              >
                {email}
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export { SiteHeaderView };
