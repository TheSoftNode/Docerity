"use client";

import { useState } from "react";
import { Popover } from "@base-ui/react/popover";

import { cn } from "@/lib/utils";
import { PALETTES, type Palette } from "@/lib/theme/palettes";
import { usePalette } from "@/hooks/use-palette";

/**
 * A palette drawn as a split disc: its ink on the left, its accent on the
 * right. Two colours are enough to tell four palettes apart at 24px, and they
 * are the two a visitor actually sees most of.
 */
function Swatch({ palette, className }: { palette: Palette; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative block overflow-hidden rounded-full ring-1 ring-white/20 ring-inset",
        className
      )}
      style={{ background: palette.ink }}
    >
      <span className="absolute inset-y-0 right-0 w-1/2" style={{ background: palette.accent }} />
    </span>
  );
}

/**
 * The row of four, shared by the popover and the mobile menu.
 *
 * Radio semantics rather than four toggle buttons: exactly one palette is ever
 * active, and a screen reader should announce it as a choice of one.
 */
function SwatchRow({
  onPick,
  onPreview,
  className,
}: {
  onPick?: () => void;
  /* Lets the popover show the name of whichever swatch is under the pointer
     or focus, without each swatch carrying a visible label. */
  onPreview?: (palette: Palette | null) => void;
  className?: string;
}) {
  const { palette: current, setPalette } = usePalette();

  return (
    <div role="radiogroup" aria-label="Colour theme" className={cn("flex items-center gap-2", className)}>
      {PALETTES.map((palette) => {
        const active = palette.key === current;
        return (
          <button
            key={palette.key}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={palette.name}
            title={palette.name}
            onClick={() => {
              setPalette(palette.key);
              onPick?.();
            }}
            onPointerEnter={() => onPreview?.(palette)}
            onPointerLeave={() => onPreview?.(null)}
            onFocus={() => onPreview?.(palette)}
            onBlur={() => onPreview?.(null)}
            className={cn(
              /* 44px of target around a 28px disc, so it is easy to hit on a
                 phone without the swatches looking oversized. */
              "grid size-11 place-items-center rounded-full outline-none transition-transform duration-200",
              "hover:scale-105 focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)]"
            )}
          >
            <span
              className={cn(
                "grid size-9 place-items-center rounded-full border-2 transition-colors duration-300",
                active ? "border-current" : "border-transparent"
              )}
            >
              <Swatch palette={palette} className="size-7" />
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * The navbar's palette control: a single disc showing the current palette,
 * which opens a small card with all four.
 *
 * Deliberately quiet. No label and no chevron in the bar, because the control
 * is an extra for the curious, not a step anybody needs to take; the card
 * names each palette as it is hovered, which is when the name is useful.
 */
function PaletteSwitcher({ className }: { className?: string }) {
  const { palette: current } = usePalette();
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<Palette | null>(null);

  const active = PALETTES.find((palette) => palette.key === current) ?? PALETTES[0];
  const shown = preview ?? active;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label={`Colour theme: ${active.name}`}
        className={cn(
          "grid size-11 place-items-center rounded-full border border-[rgb(var(--ld-paper-rgb)/0.18)] bg-[rgb(var(--ld-paper-rgb)/0.06)] outline-none transition-colors duration-200",
          "hover:bg-[rgb(var(--ld-paper-rgb)/0.12)] focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)]",
          className
        )}
      >
        <Swatch palette={active} className="size-6" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={12} className="z-50">
          <Popover.Popup
            className={cn(
              "w-[15.5rem] rounded-2xl border border-[var(--ld-line)] bg-[var(--ld-card)] p-3 text-[var(--ld-ink)] shadow-[0_30px_60px_-24px_rgb(0_0_0/0.55)] outline-none",
              "origin-[var(--transform-origin)] transition-[opacity,transform] duration-200 ease-out",
              "data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0"
            )}
          >
            <Popover.Title className="px-1 font-mono text-[10px] tracking-[0.14em] text-[var(--ld-text-muted)] uppercase">
              Colour theme
            </Popover.Title>
            <SwatchRow
              className="mt-2 justify-between"
              onPick={() => setOpen(false)}
              onPreview={setPreview}
            />
            {/* Live, so a screen reader hears the name of the swatch it has
                focused as well as seeing the ring move. */}
            <p aria-live="polite" className="mt-2 px-1 text-sm font-medium">
              {shown.name}
            </p>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

export { PaletteSwitcher, SwatchRow as PaletteSwatchRow };
