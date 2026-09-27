"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon, FilmIcon, ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Asset = {
  publicId: string;
  url: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
  createdAt: string;
};

function size(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

/**
 * The uploaded files, with their addresses.
 *
 * A client component for one reason: copying a URL. That is the useful thing
 * to do from here, since the editors' own pickers cover choosing one, and this
 * page is for the times you want to paste an address somewhere else.
 */
function MediaGrid({ images, videos }: { images: Asset[]; videos: Asset[] }) {
  const [tab, setTab] = useState<"images" | "videos">("images");
  const [copied, setCopied] = useState("");

  const assets = tab === "images" ? images : videos;

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      window.setTimeout(() => setCopied(""), 1600);
    } catch {
      /* Clipboard access can be refused, and there is nothing useful to say
         about it: the address is visible under the picture either way. */
    }
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 border-b border-border/80 pb-3">
        {(
          [
            ["images", "Images", images.length, ImageIcon],
            ["videos", "Video", videos.length, FilmIcon],
          ] as const
        ).map(([id, label, count, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-current={tab === id ? "true" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
              tab === id
                ? "bg-card text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-3.5" />
            {label}
            <span className="font-mono text-xs text-muted-foreground">{count}</span>
          </button>
        ))}
      </div>

      {assets.length === 0 ? (
        <p className="mt-6 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          Nothing here yet. Files uploaded from a project, a post or a page
          section appear in this list.
        </p>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {assets.map((asset) => (
            <li
              key={asset.publicId}
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
            >
              <span className="flex h-28 items-center justify-center bg-white">
                {tab === "images" ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={asset.url}
                    alt=""
                    loading="lazy"
                    className="max-h-24 w-full object-contain"
                  />
                ) : (
                  <video src={asset.url} preload="metadata" className="h-28 w-full object-contain" />
                )}
              </span>

              <div className="flex flex-1 flex-col gap-1 p-3">
                <p className="truncate font-mono text-[0.625rem] text-muted-foreground">
                  {asset.publicId.split("/").pop()}
                </p>
                <p className="font-mono text-[0.625rem] text-muted-foreground/70">
                  {asset.width}×{asset.height} · {asset.format} · {size(asset.bytes)}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-7 justify-start px-1.5 text-xs"
                  onClick={() => copy(asset.url)}
                >
                  {copied === asset.url ? <CheckIcon /> : <CopyIcon />}
                  {copied === asset.url ? "Copied" : "Copy address"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export { MediaGrid };
