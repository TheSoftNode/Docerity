"use client";

import { useState } from "react";
import { SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { CONTENT_ICONS, CONTENT_ICON_NAMES } from "@/lib/content/icons";
import { ContentIcon } from "@/components/shared/content-icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * Picks one of the icons the content registry allows.
 *
 * A grid of the real icons rather than a `<select>` of names, because
 * "ConciergeBellIcon" does not tell you what it looks like and the whole point
 * of the choice is how it looks.
 *
 * Collapsed by default: fifty icons expanded inside a form that already has a
 * dozen fields turns the page into a sheet of symbols.
 */
function IconPicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (name: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const matches = query
    ? CONTENT_ICON_NAMES.filter((name) =>
        /* Matched without the "Icon" suffix every name carries, so typing
           "icon" does not return all of them. */
        name.replace(/Icon$/, "").toLowerCase().includes(query.toLowerCase())
      )
    : CONTENT_ICON_NAMES;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
          <ContentIcon name={value} className="size-4 text-primary" />
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
        >
          {open ? "Done" : `Change ${label.toLowerCase()} icon`}
        </Button>
        <span className="font-mono text-[0.6875rem] text-muted-foreground">
          {value.replace(/Icon$/, "")}
        </span>
      </div>

      {open ? (
        <div className="rounded-xl border border-border bg-card/50 p-3">
          <div className="relative">
            <SearchIcon
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search icons"
              className="h-9 pl-8"
              aria-label="Search icons"
            />
          </div>

          <div className="mt-3 grid max-h-52 grid-cols-8 gap-1 overflow-y-auto sm:grid-cols-10">
            {matches.map((name) => {
              const Icon = CONTENT_ICONS[name];
              const selected = name === value;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                    setQuery("");
                  }}
                  /* The name is the accessible label; the icon alone announces
                     nothing. */
                  aria-label={name.replace(/Icon$/, "")}
                  aria-pressed={selected}
                  title={name.replace(/Icon$/, "")}
                  className={cn(
                    "inline-flex aspect-square items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-foreground",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                </button>
              );
            })}
          </div>

          {matches.length === 0 ? (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Nothing matches. Icons are added in{" "}
              <code className="text-foreground">lib/content/icons.ts</code>.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export { IconPicker };
