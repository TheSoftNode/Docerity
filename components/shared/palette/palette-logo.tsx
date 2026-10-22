import Image from "next/image";

import { cn } from "@/lib/utils";
import { PALETTES } from "@/lib/theme/palettes";

/**
 * The Docerity mark, in whichever palette the page is wearing.
 *
 * All four recolourings are rendered and the stylesheet shows the one that
 * matches `data-palette` (see `.ld-logo` in app/home.css). Choosing in CSS
 * rather than in React is what lets the right mark appear in the first paint:
 * the palette is applied by a blocking script before hydration, and a React
 * choice would show the brand mark until the bundle arrived.
 *
 * The cost is four small images, which share a cache and are 45KB each; the
 * hidden three are `display: none`, so the browser does not decode them.
 */
function PaletteLogo({
  className,
  priority = false,
}: {
  className?: string;
  /* True in the header, which is above the fold on every visit. The footer's
     copy leaves it off so it loads lazily. */
  priority?: boolean;
}) {
  return (
    <span className={cn("ld-logo inline-block shrink-0", className)} aria-hidden="true">
      {PALETTES.map((palette) => (
        <Image
          key={palette.key}
          data-logo={palette.key}
          src={palette.logo}
          alt=""
          width={256}
          height={256}
          priority={priority && palette.key === "sapphire"}
          className="h-full w-full object-contain"
        />
      ))}
    </span>
  );
}

export { PaletteLogo };
