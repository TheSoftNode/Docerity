"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { ArrowRightIcon, CheckIcon, FilmIcon, LoaderCircleIcon } from "lucide-react";

import { completeLessonAction, watchAction } from "@/app/academy/actions";
import type { Earned } from "@/lib/academy/types";
import { EarnedNote } from "@/components/academy/earned-toast";
import { cn } from "@/lib/utils";

/* The YouTube IFrame API, loaded once for the page. */
type YTPlayer = { getCurrentTime(): number; getDuration(): number; destroy(): void };
type YTNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      host?: string;
      playerVars?: Record<string, number | string>;
      events?: { onStateChange?: (event: { data: number }) => void };
    }
  ) => YTPlayer;
  PlayerState: { PLAYING: number; ENDED: number };
};
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;
function loadYouTube(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  apiPromise ??= new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT!);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.head.appendChild(script);
  });
  return apiPromise;
}

/** Watching this share of a video counts the lesson as done. */
const DONE_AT = 0.9;

/**
 * The video, and the button that finishes the lesson.
 *
 * While the video plays, the furthest point reached is saved every ten
 * seconds; reaching 90% finishes the lesson by itself. Lessons without a
 * video yet (or a reading) are finished with the button. Without enrolment
 * the video plays as a preview and nothing is saved.
 */
export function LessonPlayer({
  slug,
  lessonId,
  youtubeId,
  title,
  tracked,
  initiallyDone,
  nextHref,
  nextTitle,
  showVideo,
}: {
  slug: string;
  lessonId: string;
  youtubeId: string;
  title: string;
  tracked: boolean;
  initiallyDone: boolean;
  nextHref: string | null;
  nextTitle: string | null;
  showVideo: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(initiallyDone);
  const [earned, setEarned] = useState<Earned | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const doneRef = useRef(initiallyDone);

  const finish = useCallback(() => {
    if (doneRef.current || !tracked) return;
    doneRef.current = true;
    start(async () => {
      const result = await completeLessonAction(slug, lessonId);
      if (result.ok) {
        setDone(true);
        setEarned(result.earned);
        setError("");
      } else {
        doneRef.current = false;
        setError(result.message);
      }
    });
  }, [lessonId, slug, tracked]);

  useEffect(() => {
    if (!showVideo || !youtubeId || !host.current) return;
    let player: YTPlayer | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let furthest = 0;
    let cancelled = false;

    const tick = () => {
      if (!player) return;
      const at = player.getCurrentTime();
      const length = player.getDuration();
      if (at > furthest) furthest = at;
      if (tracked) void watchAction(slug, lessonId, furthest);
      if (length > 0 && furthest / length >= DONE_AT) finish();
    };

    loadYouTube().then((YT) => {
      if (cancelled || !host.current) return;
      const mount = document.createElement("div");
      host.current.replaceChildren(mount);
      player = new YT.Player(mount, {
        videoId: youtubeId,
        host: "https://www.youtube-nocookie.com",
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING && !timer) timer = setInterval(tick, 10_000);
            if (event.data !== YT.PlayerState.PLAYING && timer) {
              clearInterval(timer);
              timer = null;
              tick();
            }
            if (event.data === YT.PlayerState.ENDED) finish();
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      player?.destroy();
    };
  }, [finish, lessonId, showVideo, slug, tracked, youtubeId]);

  return (
    <div>
      {showVideo ? (
        youtubeId ? (
          <div className="ld-keep-dark relative aspect-video overflow-hidden rounded-[22px] bg-[#08102e] [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:size-full">
            <div ref={host} className="absolute inset-0 grid place-items-center text-sm text-[#9aa7cf]">
              Loading the video…
            </div>
          </div>
        ) : (
          <div className="ld-keep-dark flex aspect-video flex-col items-center justify-center gap-3 rounded-[22px] bg-[#08102e] bg-[image:radial-gradient(600px_300px_at_70%_20%,rgb(28_58_140/0.6),transparent_70%)] px-6 text-center text-[#f4f5fa]">
            <span className="grid size-14 place-items-center rounded-full bg-[rgb(175_196_255/0.12)] text-[#afc4ff]">
              <FilmIcon className="size-6" />
            </span>
            <p className="ld-display text-[22px] font-bold tracking-[-0.02em]">The video for this lesson is on its way</p>
            <p className="max-w-[40ch] text-[15px] text-[#c4cbe3]">Everything it covers is in the notes below, so you can carry on now.</p>
          </div>
        )
      ) : null}

      {tracked ? (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {done ? (
            <span className="inline-flex h-12 items-center gap-2 rounded-full bg-[#e3f6ec] px-5 text-[15px] font-semibold text-[#1d7a52]">
              <CheckIcon className="size-4" /> Done
            </span>
          ) : (
            <button
              type="button"
              onClick={finish}
              disabled={pending}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--ld-ink)] px-5 text-[15px] font-semibold text-[var(--ld-paper)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {pending ? <LoaderCircleIcon className="size-4 animate-spin" /> : <CheckIcon className="size-4" />}
              Mark as done
            </button>
          )}
          {nextHref ? (
            <Link
              href={nextHref}
              className={cn(
                "inline-flex h-12 items-center gap-2 rounded-full px-5 text-[15px] font-semibold transition-transform hover:-translate-y-0.5",
                done ? "bg-[var(--ld-accent)] text-[#08102e]" : "border border-[var(--ld-line-2)] text-[var(--ld-ink)]"
              )}
            >
              Next{nextTitle ? `: ${nextTitle}` : ""} <ArrowRightIcon className="size-4" />
            </Link>
          ) : null}
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-sm text-[#b4401f]">
          {error}
        </p>
      ) : null}
      {earned ? <EarnedNote earned={earned} /> : null}
      <span className="sr-only">{title}</span>
    </div>
  );
}
