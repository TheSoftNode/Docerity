import { LockIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The hostname, for the address bar.
 *
 * Parsed rather than shown whole: a full URL with its scheme and path is
 * longer than the bar and reads as a link to click, which this is not — it is
 * a label saying where the screenshot was taken. Returns nothing for anything
 * unparseable, and the bar renders the project's name instead, because a
 * malformed URL in the admin must not throw a public page.
 */
function hostOf(url?: string): string {
  if (!url) return "";
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * A browser window around a screenshot.
 *
 * Every project here is something running in a browser, and a bare bordered
 * rectangle makes a screenshot of one read as an illustration of an app rather
 * than a picture of it. The chrome and the address are the whole point: they
 * say this is real and this is where it lives, which is the claim the top of a
 * project page most wants to make.
 *
 * Decorative throughout — `aria-hidden` on the chrome, no link in the address
 * bar. The real link is the button in the hero, and a screen reader hearing
 * "lock, metapilot.vercel.app" here would be hearing furniture.
 */
function BrowserFrame({
  url,
  label,
  className,
  children,
}: {
  url?: string;
  /** Falls back into the address bar when there is no URL to show. */
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  const host = hostOf(url);

  return (
    <div
      className={cn(
        /* The shadow does the lifting: this is the brightest, most important
           thing on the page and it should sit above the page rather than in
           it. */
        "overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/20",
        className
      )}
    >
      <div
        aria-hidden
        className="flex items-center gap-2 border-b border-border/80 bg-surface-raised px-3 py-2.5 sm:px-4"
      >
        <span className="flex shrink-0 items-center gap-1.5">
          {["bg-red-400/70", "bg-amber-400/70", "bg-emerald-400/70"].map((tone) => (
            <span key={tone} className={cn("size-2.5 rounded-full", tone)} />
          ))}
        </span>

        <span className="mx-auto flex min-w-0 max-w-sm flex-1 items-center justify-center gap-1.5 rounded-md border border-border/70 bg-background/60 px-3 py-1">
          {host ? <LockIcon className="size-2.5 shrink-0 text-muted-foreground/70" /> : null}
          <span className="truncate font-mono text-[0.625rem] text-muted-foreground">
            {host || label}
          </span>
        </span>

        {/* Balances the traffic lights so the address bar sits centred. */}
        <span className="w-[3.25rem] shrink-0" />
      </div>

      {children}
    </div>
  );
}

export { BrowserFrame };
