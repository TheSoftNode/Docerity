"use client";

import { useEffect, useState } from "react";
import { ImagesIcon, Loader2Icon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type Asset = {
  publicId: string;
  url: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
};

/**
 * Picks something already uploaded, rather than uploading it again.
 *
 * Without this, using the same client logo in two places meant uploading the
 * file twice and paying for it twice, and there was no way to see what was
 * already there at all. Cloudinary's own dashboard is not an answer: it is a
 * different login and it shows public_ids rather than pictures in context.
 *
 * Loaded when opened, not on mount. Every image field on a page would
 * otherwise fetch the same list, which on the About page is eleven copies of
 * one request.
 */
function MediaPicker({
  onPick,
  folder = "posts",
}: {
  onPick: (url: string) => void;
  folder?: "posts" | "work";
}) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || assets) return;

    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(`/api/admin/media?folder=${folder}`);
        const body = await response.json();
        if (cancelled) return;

        if (!response.ok) {
          setError(body?.error?.message ?? "Could not load what is stored.");
          return;
        }
        setAssets(body.data.assets as Asset[]);
      } catch {
        if (!cancelled) setError("Could not load what is stored.");
      }
    })();

    /* Cancelled rather than left to resolve: closing the picker while the
       list is in flight would otherwise set state on a component nobody is
       looking at. */
    return () => {
      cancelled = true;
    };
  }, [open, assets, folder]);

  if (!open) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="shrink-0"
        onClick={() => setOpen(true)}
      >
        <ImagesIcon />
        Stored
      </Button>
    );
  }

  return (
    <div className="mt-2 rounded-lg border border-border bg-background/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
          Already uploaded
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => setOpen(false)}
          aria-label="Close the picker"
        >
          <XIcon />
        </Button>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      ) : assets === null ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2Icon className="size-3.5 animate-spin" />
          Loading
        </p>
      ) : assets.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Nothing uploaded yet. The first file you add here will show up in this
          list everywhere else.
        </p>
      ) : (
        <ul className="mt-3 grid max-h-64 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
          {assets.map((asset) => (
            <li key={asset.publicId}>
              <button
                type="button"
                onClick={() => {
                  onPick(asset.url);
                  setOpen(false);
                }}
                title={`${asset.publicId} · ${asset.width}×${asset.height}`}
                className="flex w-full flex-col items-center gap-1 rounded-lg border border-border bg-white p-1.5 outline-none transition-colors hover:border-primary/50 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.url}
                  alt=""
                  loading="lazy"
                  className="h-12 w-full object-contain"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export { MediaPicker };
