import Link from "next/link";

import { ContentIcon } from "@/components/shared/content-icon";
import type { ServiceLineView } from "@/lib/content/blocks/views";

/**
 * The seven lines of work, as an index beside the hero.
 *
 * The right half of this hero was empty, and the first question somebody
 * arrives with is "do you do the thing I need?" — which the old page answered
 * only after a scroll past two stacked heading blocks. Listing the lines up
 * front answers it above the fold, and each row jumps to the card that
 * explains it, so the index is navigation rather than decoration.
 *
 * Anchors rather than a sticky menu: seven rows is a list somebody reads once
 * to orient themselves, not a control they keep coming back to.
 */
function ServicesIndex({ lines }: { lines: ServiceLineView[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-2 backdrop-blur-sm">
      <p className="px-4 pt-3 pb-2 font-mono text-[0.625rem] tracking-[0.16em] text-muted-foreground uppercase">
        What we take on
      </p>
      <ul>
        {lines.map((line, index) => (
          <li key={line.title}>
            <Link
              href={`#${anchorFor(line.title)}`}
              className="group flex items-center gap-3 rounded-xl px-4 py-2.5 transition-colors hover:bg-primary/[0.07]"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary transition-colors group-hover:border-primary/40">
                <ContentIcon name={line.iconName} className="size-4" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {line.title}
              </span>
              <span
                aria-hidden
                className="font-mono text-[0.625rem] tabular-nums text-muted-foreground/60"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Shared with the cards, so a row scrolls to the card it names. Derived from
   the title rather than stored, because these are edited in the admin and a
   stored id would drift from the text the first time one is reworded. */
function anchorFor(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "line"
  );
}

export { ServicesIndex, anchorFor };
