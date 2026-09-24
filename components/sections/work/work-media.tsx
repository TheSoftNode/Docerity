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
 * generated SVG preview when it does not, so a card is never an empty box
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
        /* The generated previews draw on a 2:1 canvas and letterbox inside a
           16:10 frame, so matching the frame to their own fill hides that.
           Real screenshots sit on a slightly recessed field instead; see
           the note on the image below. */
        media ? "bg-surface-step-b" : "bg-card",
        className
      )}
    >
      <div className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]">
        {!media ? (
          <WorkPreview variant={variant} />
        ) : media.type === "image" ? (
          /*
            The screenshot is shown whole, inset on a recessed field, rather
            than cropped to fill the frame.

            `cover` looked tidier in the abstract and was wrong in practice:
            these captures range from 1.06 to 2.38 against a 16:10 frame, so
            it sliced the sides off the wide ones: EEP at 2.02 lost "B" from
            "Build Your Projects" and the whole right-hand column. A product
            screenshot that cannot be read is decoration. Inset and contained,
            every card shows the actual thing, and the letterboxing reads as a
            deliberate mount rather than a gap.
          */
          <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4">
            <div className="relative h-full w-full overflow-hidden rounded-lg shadow-[0_18px_40px_-20px_rgba(0,0,0,0.8)] ring-1 ring-border/60">
              <Image
                src={media.src}
                alt={media.alt}
                fill
                sizes={sizes}
                className="object-contain object-top"
              />
            </div>
          </div>
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
