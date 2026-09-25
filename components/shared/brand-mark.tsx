import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * The Docerity mark.
 *
 * The artwork has its colours baked in, and they only work against a light
 * surface: measured against the site's own backgrounds, the navy body of the D
 * is 1.08:1 on the dark theme, which is invisible rather than merely low
 * contrast. So the mark always sits on a light plate rather than being dropped
 * bare onto whatever is behind it. On the dark theme that plate reads as a
 * deliberate chip; on the light one the border is what separates it from the
 * page.
 *
 * The plate is not a dark-mode workaround to be removed later. A logo with a
 * fixed palette needs a known surface, and the alternative is maintaining two
 * versions of the file that drift apart.
 */
function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        /* `bg-white` rather than `bg-card`, which follows the theme and would
           put the navy on near-black in dark mode. */
        "relative inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-white",
        className
      )}
    >
      <Image
        src="/docerity-logo.webp"
        alt=""
        width={256}
        height={256}
        /*
          Inset so the mark has room inside the plate. The source is trimmed to
          the artwork and squared on a transparent canvas, so without this it
          would run edge to edge and lose the rounded corners.
        */
        className="size-[72%] object-contain"
        /* It is in the header of every page, so it is never below the fold and
           lazy-loading it only delays the first thing somebody sees. */
        priority
      />
    </span>
  );
}

export { BrandMark };
