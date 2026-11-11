"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { ArrowUpRightIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/lib/content/blocks/site";
import { useScrolled } from "@/hooks/use-scrolled";
import { PaletteLogo } from "@/components/shared/palette/palette-logo";

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
  const { resolvedTheme, setTheme } = useTheme();
  /* Before next-themes has mounted, the class it set before paint is the truth. */
  const isDark = () =>
    resolvedTheme === undefined ? document.documentElement.classList.contains("dark") : resolvedTheme === "dark";

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
            "ld-nav flex items-center justify-between gap-3 rounded-full border py-1.5 pr-1.5 pl-3.5 backdrop-blur-[14px] transition-[border-color,box-shadow] duration-300 sm:pl-4",
            /* Near-solid navy everywhere, so it is the same navy over a dark
               hero and a white one: see-through, it mixes with white into
               slate grey. At the top it has no border, so over the dark heroes
               it simply sits on the page; scrolled, the border and shadow lift
               it off whatever band is beneath. */
            "bg-[rgb(var(--ld-ink-rgb)/0.95)] text-[var(--ld-paper)]",
            scrolled
              ? "border-[rgb(var(--ld-paper-rgb)/0.14)] shadow-[0_18px_40px_-24px_rgb(var(--ld-ink-rgb)/0.6)]"
              : "border-transparent"
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
            {/* Light and dark. Which icon shows is decided by the class on
                <html>, so the server and the first paint agree. */}
            <button
              type="button"
              onClick={() => setTheme(isDark() ? "light" : "dark")}
              aria-label="Switch between light and dark"
              title="Light or dark"
              className="hidden size-10 place-items-center rounded-full border border-[rgb(var(--ld-paper-rgb)/0.18)] bg-[rgb(var(--ld-paper-rgb)/0.06)] text-[var(--ld-paper)] outline-none transition-colors hover:bg-[rgb(var(--ld-paper-rgb)/0.12)] focus-visible:ring-1 focus-visible:ring-[rgb(var(--ld-accent-rgb)/0.7)] sm:grid"
            >
              <SunIcon className="hidden size-[18px] dark:block" />
              <MoonIcon className="size-[18px] dark:hidden" />
            </button>
            {/* The client portal: projects, progress and requests, for people the studio works with. */}
            <Link
              href="/account"
              aria-label="Your account"
              title="Your account"
              className="hidden size-10 place-items-center rounded-full border border-[rgb(var(--ld-paper-rgb)/0.18)] bg-[rgb(var(--ld-paper-rgb)/0.06)] text-[var(--ld-paper)] outline-none transition-colors hover:bg-[rgb(var(--ld-paper-rgb)/0.12)] focus-visible:ring-1 focus-visible:ring-[rgb(var(--ld-accent-rgb)/0.7)] sm:grid"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21a8 8 0 0 1 16 0" />
              </svg>
            </Link>
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
              "ld-nav-menu ld-zoom mt-2 max-h-[calc(100svh-5.5rem)] overflow-y-auto rounded-[26px] border p-1.5 backdrop-blur-[18px] xl:hidden",
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

            <div className="mt-1.5 flex items-center justify-between gap-3 rounded-[20px] bg-[rgb(var(--ld-paper-rgb)/0.05)] py-1.5 pr-1.5 pl-3.5">
              <p className="text-[14px] font-medium text-[var(--ld-muted)]">Appearance</p>
              <div className="flex rounded-full bg-[rgb(var(--ld-paper-rgb)/0.06)] p-1">
                {(["light", "dark"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setTheme(option)}
                    className={cn(
                      "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold capitalize transition-colors",
                      option === "light"
                        ? "bg-transparent text-[var(--ld-muted)] [html.light_&]:bg-[var(--ld-accent)] [html.light_&]:text-[#08102e]"
                        : "bg-transparent text-[var(--ld-muted)] [html.dark_&]:bg-[var(--ld-accent)] [html.dark_&]:text-[#08102e]"
                    )}
                  >
                    {option === "light" ? <SunIcon className="size-3.5" /> : <MoonIcon className="size-3.5" />}
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-1.5 pt-2.5 pb-1.5">
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="mb-2 flex min-h-11 items-center justify-center gap-2 rounded-full border border-[rgb(var(--ld-paper-rgb)/0.18)] text-[15px] font-semibold text-[var(--ld-paper)]"
              >
                Your account
              </Link>
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
