import { ImageIcon, PlayIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * A media frame in a body section.
 *
 * `src` is what turns it into real media: with one, `SectionMedia` renders the
 * image or the clip, and without one it renders the dashed box below. The
 * optional source is why the two live in one type rather than two: an author
 * marks where a diagram goes, and fills it in later without the section
 * changing shape.
 */
export type Media =
  | { type: "image"; alt: string; caption?: string; src?: string }
  | { type: "video"; caption?: string; src?: string; poster?: string; alt?: string };

function MediaPlaceholder({
  media,
  tone = "light",
}: {
  media: Media;
  tone?: "light" | "dark";
}) {
  const isVideo = media.type === "video";
  const isDark = tone === "dark";

  return (
    <figure className="my-6">
      <div
        className={cn(
          "flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed",
          isDark
            ? "border-border bg-card text-muted-foreground"
            : "border-border bg-card/50 text-muted-foreground"
        )}
      >
        {isVideo ? (
          <span
            className={cn(
              "flex size-11 items-center justify-center rounded-full",
              isDark ? "bg-foreground/10" : "bg-muted"
            )}
          >
            <PlayIcon className="size-5 translate-x-0.5" strokeWidth={1.75} />
          </span>
        ) : (
          <ImageIcon className="size-8" strokeWidth={1.5} />
        )}
        <p className="font-mono text-[11px] tracking-[0.15em] uppercase">
          {isVideo ? "Video placeholder" : "Image placeholder"}
        </p>
        {!isVideo && (
          <p
            className={cn(
              "max-w-xs px-4 text-center text-xs",
              isDark ? "text-muted-foreground/70" : "text-muted-foreground"
            )}
          >
            {media.alt}
          </p>
        )}
      </div>
      {media.caption && (
        <figcaption
          className={cn(
            "mt-2 text-center text-xs",
            isDark ? "text-muted-foreground" : "text-muted-foreground"
          )}
        >
          {media.caption}
        </figcaption>
      )}
    </figure>
  );
}

export { MediaPlaceholder };
