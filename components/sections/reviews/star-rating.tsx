"use client";

import { useState } from "react";
import { StarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A rating input built from radio buttons.
 *
 * Radios rather than five buttons and a state variable, because a radio group
 * is what this is: arrow keys move between options, the browser enforces one
 * selection, and a screen reader announces "3 of 5" without any ARIA. The
 * stars are the labels; the inputs are visually hidden but still focusable,
 * which is why the focus ring is drawn on the label through `peer-focus`.
 *
 * `sr-only` rather than `hidden` or `opacity-0` on the input: the first removes
 * it from the tab order entirely, and the second leaves a 0-sized target that
 * a pointer can still land on in some browsers.
 */
function StarRating({
  name,
  value,
  onChange,
  invalid,
}: {
  name: string;
  value: number;
  onChange: (rating: number) => void;
  invalid?: boolean;
}) {
  /* Hover has to be tracked to light up every star up to the pointer, which is
     the convention people expect. It is separate from `value` so moving away
     without clicking restores the real selection. */
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  return (
    <div
      role="radiogroup"
      aria-label="Rating out of five"
      aria-invalid={invalid || undefined}
      className="flex items-center gap-1"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((rating) => (
        <label
          key={rating}
          onMouseEnter={() => setHovered(rating)}
          className="group/star cursor-pointer p-0.5"
        >
          <input
            type="radio"
            name={name}
            value={rating}
            checked={value === rating}
            onChange={() => onChange(rating)}
            className="peer sr-only"
          />
          <span className="sr-only">{`${rating} out of 5`}</span>
          <StarIcon
            aria-hidden
            className={cn(
              "size-7 transition-all duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foreground",
              rating <= shown
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-muted-foreground/40 group-hover/star:text-muted-foreground"
            )}
          />
        </label>
      ))}

      <span
        className="ml-2 font-mono text-xs text-muted-foreground"
        /* The visible count is decorative: the radio group already announces
           the selection, and reading it twice is noise. */
        aria-hidden
      >
        {value > 0 ? `${value}/5` : "pick one"}
      </span>
    </div>
  );
}

/** The read-only counterpart, for displaying a submitted rating. */
function StarDisplay({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img"
      aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          aria-hidden
          className={cn(
            "size-3.5",
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-muted-foreground/30"
          )}
        />
      ))}
    </span>
  );
}

export { StarRating, StarDisplay };
