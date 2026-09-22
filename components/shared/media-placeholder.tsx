import { ImageIcon, PlayIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type Media =
  | { type: "image"; alt: string; caption?: string }
  | { type: "video"; caption?: string };

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
            : "border-[#070b16]/20 bg-white/50 text-[#070b16]/40"
        )}
      >
        {isVideo ? (
          <span
            className={cn(
              "flex size-11 items-center justify-center rounded-full",
              isDark ? "bg-foreground/10" : "bg-[#070b16]/10"
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
              isDark ? "text-muted-foreground/70" : "text-[#070b16]/35"
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
            isDark ? "text-muted-foreground" : "text-[#070b16]/50"
          )}
        >
          {media.caption}
        </figcaption>
      )}
    </figure>
  );
}

export { MediaPlaceholder };
