"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { MenuIcon, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The admin's sidebar: navy in both themes, like the site's own nav, so the
 * frame stays put while the pages change. A fixed column on a wide screen; on
 * a narrow one a bar across the top whose menu opens over the page.
 */
function AdminRail({
  brand,
  children,
}: {
  brand: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedOn, setOpenedOn] = useState(pathname);

  /*
    Closed on navigation, adjusted during render rather than in an effect, so
    the menu is never drawn open over the page it just opened.
  */
  if (open && openedOn !== pathname) {
    setOpen(false);
    setOpenedOn(pathname);
  }

  return (
    <aside
      className={cn(
        "relative z-40 shrink-0 bg-sidebar text-sidebar-foreground",
        "sticky top-0 lg:static",
        "lg:w-[264px]"
      )}
    >
      <div className="flex h-full flex-col gap-4 px-4 py-3 lg:sticky lg:top-0 lg:max-h-svh lg:gap-7 lg:px-4 lg:py-6">
        <div className="flex items-center justify-between gap-3 lg:px-2">
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
            className="inline-flex size-10 items-center justify-center rounded-full border border-sidebar-border text-sidebar-accent-foreground transition-colors hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring lg:hidden"
          >
            {open ? <XIcon className="size-4" /> : <MenuIcon className="size-4" />}
          </button>
        </div>

        {/* Tapping the page behind the open menu closes it; the button above is the accessible way out. */}
        {open ? (
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-16 z-0 cursor-default bg-[rgb(8_16_46/0.45)] backdrop-blur-[2px] lg:hidden"
          />
        ) : null}

        <div
          id="admin-sections"
          className={cn(
            /* Over the page, not above it, so opening the menu never moves what you were reading. */
            "absolute inset-x-0 top-full z-10 max-h-[calc(100svh-4rem)] flex-col gap-6 overflow-y-auto bg-sidebar px-4 pt-3 pb-5 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)]",
            open ? "flex" : "hidden",
            "lg:static lg:z-auto lg:flex lg:max-h-none lg:flex-1 lg:overflow-y-auto lg:bg-transparent lg:p-0 lg:shadow-none"
          )}
        >
          {children}
        </div>
      </div>
    </aside>
  );
}

export { AdminRail };
