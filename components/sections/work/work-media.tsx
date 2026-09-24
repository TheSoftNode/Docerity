"use client";

import Image from "next/image";
import { PlayIcon } from "lucide-react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { projectMedia, type ProjectSlug } from "@/components/sections/work/work-data";
import { WorkPreview, type PreviewVariant } from "@/components/sections/work/work-preview";

/*
  The card grid is 1 / 2 / 3 columns, so a card is roughly the full viewport
  on a phone, half on a tablet and a third on desktop. Telling the browser
  that up front stops it downloading a 3x-too-large image on mobile.
*/
const CARD_SIZES = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw";

/**
 * The card's media slot.
 *
 * Renders a real screenshot or clip when one exists for this project, and the
 * generated SVG preview when it does not — so a card is never an empty box
 * waiting on assets. Both fill the same 16:10 frame, which means dropping in
 * real media never changes the grid's geometry.
 */
function WorkMedia({
  slug,
  variant,
  className,
  /* Defaults to the card grid's geometry; a project page overrides it,
     because the same default would have it download a third-width source for
     a full-width frame. */
  sizes = CARD_SIZES,
}: {
  slug: ProjectSlug;
  variant: PreviewVariant;
  className?: string;
  sizes?: string;
}) {
  const reduceMotion = useReducedMotion();
  const media = projectMedia[slug];

  return (
    <div
      className={cn(
        "relative aspect-[16/10] w-full overflow-hidden",
        /* The generated previews draw on a 2:1 canvas, so they letterbox
           inside a 16:10 frame. Matching the frame to their own fill makes
           that invisible; real media covers the frame and wants the darker
           field behind it while it loads. */
        media ? "bg-muted" : "bg-card",
        className
      )}
    >
      <div className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]">
        {!media ? (
          <WorkPreview variant={variant} />
        ) : media.type === "image" ? (
          <Image
            src={media.src}
            alt={media.alt}
            fill
            sizes={sizes}
            /* Anchored to the top. These are full-page captures with ratios
               from 1.06 to 2.38 against a 16:10 frame, so the tall ones crop
               vertically — centred, that discards the header and shows an
               anonymous slice of mid-page. The top of a product page is the
               part anyone recognises. */
            className="object-cover object-top"
          />
        ) : (
          <video
            src={media.src}
            poster={media.poster}
            muted
            loop
            playsInline
            /* A clip that starts itself is motion the viewer did not ask for,
               so it stays on its poster frame under reduced motion. */
            autoPlay={!reduceMotion}
            preload="metadata"
            aria-label={media.alt}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {media?.type === "video" && reduceMotion ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-12 items-center justify-center rounded-full border border-border bg-background/70 backdrop-blur-sm">
            <PlayIcon className="size-5 translate-x-px text-foreground" />
          </span>
        </span>
      ) : null}
    </div>
  );
}

export { WorkMedia };
