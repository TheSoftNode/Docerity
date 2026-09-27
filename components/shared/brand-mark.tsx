import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * The Docerity mark.
 *
 * Rendered bare, on whatever is behind it. The previous artwork could not be:
 * its body was a deep navy that measured 1.08:1 against the dark theme's
 * background, which is invisible rather than merely low contrast, so it sat on
 * a white plate to guarantee itself a light surface. That plate cost the mark a
 * third of its box, because it had to be inset to keep the rounded corners.
 *
 * This one is blue-violet throughout and needs no such help: 5.06:1 on the
 * light background and 3.69:1 on the dark one, so the shape reads on both.
 * Without the plate it also gets the whole 36px instead of 72% of it, and at
 * this size that is the difference between the internal gaps being visible and
 * the mark being a blob.
 *
 * The file has a real alpha channel, and the gaps between the chevrons are part
 * of it. They pick up the page behind them rather than being painted white,
 * which is why the mark does not show a pale seam on the dark theme.
 */
function BrandMark({ className }: { className?: string }) {
  return (
    <Image
      src="/docerity-logo.webp"
      alt=""
      width={256}
      height={256}
      className={cn("size-9 shrink-0 object-contain", className)}
      /* It is in the header of every page, so it is never below the fold and
         lazy-loading it only delays the first thing somebody sees. */
      priority
    />
  );
}

export { BrandMark };
