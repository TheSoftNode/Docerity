"use client";

import { useState } from "react";
import {
  AlertTriangleIcon,
  CheckIcon,
  CopyIcon,
  FilmIcon,
  ImageIcon,
  Loader2Icon,
  Trash2Icon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { checkMediaUsage, deleteMedia } from "@/app/admin/media/actions";
import type { MediaUse } from "@/lib/repositories/media-usage.repository";

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
 * The uploaded files, with their addresses and a way to remove them.
 *
 * Two things happen from here that cannot happen anywhere else: copying an
 * address to paste somewhere, and deleting a file for good. Choosing one for a
 * project or a post is the editors' own pickers' job.
 *
 * Deleting takes two presses, and the first one is the useful one: it asks the
 * server what still points at the file, so the confirmation names the project
 * or post it would break rather than asking in the abstract. The server
 * refuses a file that is still referenced unless told otherwise, which is what
 * makes a failed lookup harmless rather than silently destructive.
 */
function MediaGrid({ images, videos }: { images: Asset[]; videos: Asset[] }) {
  const [tab, setTab] = useState<"images" | "videos">("images");
  const [copied, setCopied] = useState("");
  /* Which file is mid-request, which is awaiting confirmation, and what the
     server said is still using it. Keyed by public_id rather than held as one
     value, so a second file cannot inherit the first one's warning. */
  const [busy, setBusy] = useState("");
  const [confirming, setConfirming] = useState("");
  const [usedBy, setUsedBy] = useState<Record<string, MediaUse[]>>({});
  const [failed, setFailed] = useState<Record<string, string>>({});
  const [gone, setGone] = useState<string[]>([]);

  /* Asking first, and asking with the answer already in hand: opening the
     confirmation looks up what points at the file, so the warning names the
     project or post it would break instead of asking in the abstract. */
  async function ask(asset: Asset) {
    setConfirming(asset.publicId);
    setFailed((current) => ({ ...current, [asset.publicId]: "" }));
    setBusy(asset.publicId);

    const result = await checkMediaUsage(asset.publicId);

    setBusy("");
    if (result.ok) {
      setUsedBy((current) => ({ ...current, [asset.publicId]: result.usedBy }));
    } else {
      setFailed((current) => ({ ...current, [asset.publicId]: result.message }));
    }
  }

  async function remove(asset: Asset) {
    setBusy(asset.publicId);
    setFailed((current) => ({ ...current, [asset.publicId]: "" }));

    /* `force` only when the list of uses is on screen. Without it the server
       refuses a file that is still referenced, which is the guard that makes
       a failed usage lookup safe rather than silently destructive. */
    const result = await deleteMedia(
      asset.publicId,
      tab === "images" ? "image" : "video",
      (usedBy[asset.publicId]?.length ?? 0) > 0
    );

    setBusy("");

    if (result.ok) {
      /* Hidden here rather than waiting for the server's list to come back:
         the file is gone, and a card that lingers reads as a failed delete. */
      setGone((current) => [...current, asset.publicId]);
      setConfirming("");
      return;
    }

    setFailed((current) => ({ ...current, [asset.publicId]: result.message }));
    if (result.usedBy) {
      setUsedBy((current) => ({ ...current, [asset.publicId]: result.usedBy! }));
    }
  }

  /* The deleted ones dropped once here, so the grid and the tab counts cannot
     disagree about what is left. */
  const live = (list: Asset[]) => list.filter((asset) => !gone.includes(asset.publicId));
  const liveImages = live(images);
  const liveVideos = live(videos);
  const assets = tab === "images" ? liveImages : liveVideos;

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
            ["images", "Images", liveImages.length, ImageIcon],
            ["videos", "Video", liveVideos.length, FilmIcon],
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
        <ul
          /* Named, because the page has another list in it — the admin nav —
             and "the uploaded files" is what a screen reader needs to hear to
             tell them apart. */
          aria-label={tab === "images" ? "Uploaded images" : "Uploaded video"}
          className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          {assets.map((asset) => {
            const uses = usedBy[asset.publicId] ?? [];

            return (
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

                {confirming === asset.publicId ? (
                  <div className="mt-auto pt-2">
                    {uses.length > 0 ? (
                      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-2">
                        <p className="flex items-start gap-1.5 text-[0.6875rem] font-medium text-destructive">
                          <AlertTriangleIcon className="mt-px size-3 shrink-0" />
                          Used in {uses.length} {uses.length === 1 ? "place" : "places"}
                        </p>
                        <ul className="mt-1 space-y-0.5">
                          {uses.slice(0, 4).map((use) => (
                            <li key={`${use.kind}-${use.href}`} className="truncate text-[0.625rem]">
                              <a
                                href={use.href}
                                className="text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground"
                              >
                                {use.label}
                              </a>
                            </li>
                          ))}
                          {uses.length > 4 ? (
                            <li className="text-[0.625rem] text-muted-foreground/70">
                              and {uses.length - 4} more
                            </li>
                          ) : null}
                        </ul>
                        <p className="mt-1.5 text-[0.625rem] text-muted-foreground">
                          Deleting it leaves those broken.
                        </p>
                      </div>
                    ) : busy === asset.publicId ? (
                      <p className="text-[0.6875rem] text-muted-foreground">
                        Checking where this is used…
                      </p>
                    ) : (
                      <p className="text-[0.6875rem] text-muted-foreground">
                        Nothing points at this file. Delete it?
                      </p>
                    )}

                    {failed[asset.publicId] ? (
                      <p className="mt-1.5 text-[0.6875rem] text-destructive">
                        {failed[asset.publicId]}
                      </p>
                    ) : null}

                    <div className="mt-2 flex items-center gap-1">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={busy === asset.publicId}
                        onClick={() => remove(asset)}
                      >
                        {busy === asset.publicId ? (
                          <Loader2Icon className="animate-spin" />
                        ) : (
                          <Trash2Icon />
                        )}
                        {uses.length > 0 ? "Delete anyway" : "Delete"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        disabled={busy === asset.publicId}
                        onClick={() => setConfirming("")}
                      >
                        Keep
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-auto flex items-center justify-between pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 justify-start px-1.5 text-xs"
                      onClick={() => copy(asset.url)}
                    >
                      {copied === asset.url ? <CheckIcon /> : <CopyIcon />}
                      {copied === asset.url ? "Copied" : "Copy address"}
                    </Button>
                    <Button
                      type="button"
                      variant="subtle-danger"
                      size="icon-sm"
                      aria-label={`Delete ${asset.publicId.split("/").pop()}`}
                      onClick={() => ask(asset)}
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                )}
              </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export { MediaGrid };
