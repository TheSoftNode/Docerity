"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { nearestPage, shelfWithGap, type Page } from "@/components/sections/small-pages/shelf-content";

/* Spine colours in turn, each with the text colour that reads on it. */
const TONES = [
  "bg-[var(--ld-deep)] text-[var(--ld-paper)]",
  "bg-[var(--ld-paper)] text-[var(--ld-ink)]",
  "bg-[#2a4aa6] text-[var(--ld-paper)]",
  "bg-[var(--ld-tint)] text-[var(--ld-ink)]",
  "bg-[var(--ld-panel)] text-[var(--ld-paper)]",
  "bg-[#dfe6fb] text-[var(--ld-ink)]",
];

/**
 * The not-found page's shelf: every page in the site's menus as a spine you
 * can take, and a gap labelled with the address that was asked for. When the
 * address is close to a real page, the gap sits beside it and the page offers
 * it ("Did you mean Projects?"). The address comes from the browser, since a
 * not-found page is rendered without knowing which path missed.
 */
function NotFoundShelf({ pages, note, guessLabel = "Did you mean" }: { pages: Page[]; note: string; guessLabel?: string }) {
  const path = usePathname() ?? "";
  const near = nearestPage(path, pages);
  const spots = shelfWithGap(pages, near);

  return (
    <>
      {near ? (
        <Link
          href={near.href}
          className="ld-up ld-delay-2 mt-[22px] inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--ld-accent)] px-5 text-[15px] font-semibold text-[var(--ld-ink)] outline-none transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--ld-paper)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ld-ink)]"
        >
          {guessLabel} {near.label}? <span aria-hidden="true">→</span>
        </Link>
      ) : null}

      <div className="ld-up ld-delay-3 relative mt-[clamp(40px,5vw,64px)]">
        <ul aria-label="Pages on this site" className="flex h-[260px] items-end gap-1.5 overflow-x-auto px-2 pt-10 [scrollbar-width:none] sm:h-[300px] sm:px-6">
          {spots.map((spot, index) =>
            spot.kind === "gap" ? (
              <li key="gap" aria-hidden="true" className="relative grid h-[82%] w-[62px] flex-none place-items-center rounded-md border-2 border-dashed border-[var(--ld-accent)] bg-[rgb(255_122_89/0.06)]">
                <span className="rotate-180 font-mono text-[13px] whitespace-nowrap text-[#ffb39c] [writing-mode:vertical-rl]">{path || "this page"}</span>
                <span className="ld-float absolute bottom-full left-1/2 mb-2.5 -translate-x-1/2 rounded-[7px] bg-[var(--ld-accent)] px-2 py-1 font-mono text-[11px] whitespace-nowrap text-[var(--ld-ink)] uppercase">
                  Not on the shelf
                </span>
              </li>
            ) : (
              <li key={spot.page.href} className="flex h-full flex-none flex-col justify-end" style={{ width: 54 + (spot.page.label.length % 4) * 10 }}>
                <Link
                  href={spot.page.href}
                  style={{ height: `${70 + ((index * 37) % 23)}%` }}
                  className={cn(
                    "flex w-full origin-bottom-left flex-col items-center justify-between rounded-[6px_6px_3px_3px] py-3.5 shadow-[inset_-6px_0_0_rgb(0_0_0/0.12),inset_2px_0_0_rgb(255_255_255/0.1)] outline-none transition-[transform,filter] duration-300 ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-3.5 hover:brightness-110 focus-visible:-translate-y-3.5 focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)] motion-reduce:transition-none",
                    TONES[index % TONES.length],
                    spot.leaning && "-rotate-[4deg]"
                  )}
                >
                  <span aria-hidden="true" className="h-[3px] w-3/5 rounded-sm bg-current opacity-35" />
                  <span className="ld-display rotate-180 text-[clamp(15px,1.6vw,20px)] font-extrabold tracking-[-0.01em] whitespace-nowrap [writing-mode:vertical-rl]">
                    {spot.page.label}
                  </span>
                  <span aria-hidden="true" className="font-mono text-[10px] opacity-60">
                    {spot.page.href}
                  </span>
                </Link>
              </li>
            )
          )}
        </ul>
        <div aria-hidden="true" className="h-3.5 rounded bg-[linear-gradient(180deg,#2a3c78,#16244f)] shadow-[0_30px_50px_-20px_rgb(0_0_0/0.7)]" />
        <p className="mt-4 font-mono text-xs text-[var(--ld-muted-3)] uppercase">{note}</p>
      </div>
    </>
  );
}

export { NotFoundShelf };
