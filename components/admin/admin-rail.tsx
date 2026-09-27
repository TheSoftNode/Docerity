"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The rail, and the one thing it has to do differently on a phone.
 *
 * On a wide screen it is a column beside the content and everything is visible
 * at once. Stacked on a phone that same column became a full screen of
 * navigation before any content: the mark, nine sections, the account block and
 * the sign-out row, so "Hello" sat below the fold on every page of the tool.
 *
 * So the sections and the account block collapse behind a button on small
 * screens, and the bar that stays is the mark and the toggle. From `lg` the
 * button is gone and nothing is hidden, which is why the state is only ever
 * read through a class rather than used to decide what to render: a menu that
 * unmounted its own contents would take the desktop rail with it.
 *
 * A Client Component for the open flag alone. The layout around it stays a
 * Server Component, and the nav and the account block are passed through as
 * children rather than rebuilt here.
 */
function AdminRail({
  brand,
  children,
}: {
  /** The mark and wordmark, which stay visible at every width. */
  brand: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedOn, setOpenedOn] = useState(pathname);

  /*
    Closed on navigation. Without this, tapping a section leaves the menu
    covering the page it just opened, and the first thing you do on arriving
    anywhere is dismiss it.

    Adjusted during render rather than in an effect. React re-runs this
    component immediately and before anything is painted, so the menu is never
    briefly drawn open over the new page, which is exactly what an effect would
    have produced: a render with the old state, then a second one to correct it.
  */
  if (open && openedOn !== pathname) {
    setOpen(false);
    setOpenedOn(pathname);
  }

  return (
    <aside
      className={cn(
        "relative z-40 shrink-0 border-b border-border/80 bg-card/40 backdrop-blur-sm",
        /* Sticky on a phone so the toggle is reachable from anywhere down a
           long list, and so the bar does not scroll away with the content. */
        "sticky top-0 lg:static",
        "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-[linear-gradient(to_right,var(--brand-primary),var(--brand-violet))] after:opacity-40 after:content-['']",
        "lg:w-60 lg:border-r-0 lg:border-b-0 lg:after:inset-y-0 lg:after:left-auto lg:after:h-auto lg:after:w-px lg:after:bg-[linear-gradient(to_bottom,transparent,var(--brand-primary)_20%,var(--brand-violet)_80%,transparent)]"
      )}
    >
      <div className="flex h-full flex-col gap-4 px-4 py-3 lg:sticky lg:top-0 lg:max-h-svh lg:gap-6 lg:py-6">
        <div className="flex items-center justify-between gap-3">
          {brand}

          <button
            type="button"
            onClick={() => {
              setOpen((current) => !current);
              setOpenedOn(pathname);
            }}
            aria-expanded={open}
            aria-controls="admin-sections"
            aria-label={open ? "Close the menu" : "Open the menu"}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground lg:hidden"
          >
            {open ? <XIcon className="size-4" /> : <MenuIcon className="size-4" />}
          </button>
        </div>

        <div
          id="admin-sections"
          className={cn(
            "flex-1 flex-col gap-6 pb-2 lg:flex lg:pb-0",
            open ? "flex" : "hidden"
          )}
        >
          {children}
        </div>
      </div>
    </aside>
  );
}

export { AdminRail };
