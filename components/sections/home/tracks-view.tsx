"use client";

import Link from "next/link";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { mentorWeek, tracks, type TrackKey } from "@/components/sections/home/home-data";

type Props = {
  serviceLines: string[];
  pair: { concept: string; analogy: string } | null;
};

/* Delay utilities in order, so chips and days cascade in when a panel opens. */
const CASCADE = ["ld-delay-1", "ld-delay-2", "ld-delay-3", "ld-delay-4", "ld-delay-5", "ld-delay-6"];

/**
 * The track switcher.
 *
 * A WAI-ARIA tab set: the tabs are buttons in a tablist, only the selected one
 * is in the tab order, and the arrow keys (plus Home and End) move between
 * them. Each panel is labelled by its tab. A panel is unmounted when it is not
 * selected, which is also what replays its entrance animation on every switch.
 */
function TracksView({ serviceLines, pair }: Props) {
  const [selected, setSelected] = useState<TrackKey>("build");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = tracks.length - 1;
    const next =
      event.key === "ArrowDown" || event.key === "ArrowRight"
        ? index === last ? 0 : index + 1
        : event.key === "ArrowUp" || event.key === "ArrowLeft"
          ? index === 0 ? last : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;

    if (next === null) return;
    event.preventDefault();
    setSelected(tracks[next].key);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className="flex flex-wrap items-stretch gap-8">
      <div role="tablist" aria-label="Tracks" aria-orientation="vertical" className="flex flex-[1_1_300px] flex-col">
        {tracks.map((track, index) => {
          const active = track.key === selected;
          return (
            <button
              key={track.key}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              id={`${baseId}-tab-${track.key}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`${baseId}-panel-${track.key}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setSelected(track.key)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={cn(
                "relative flex items-baseline gap-5 border-t border-[var(--ld-line-2)] py-6 text-left outline-none transition-colors duration-300",
                "focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--ld-paper)]",
                active ? "text-[var(--ld-ink)]" : "text-[var(--ld-text-dim)] hover:text-[var(--ld-text-2)]"
              )}
            >
              <span className="font-mono text-sm">{track.number}</span>
              <span className="ld-display text-[clamp(44px,5vw,72px)] leading-none font-extrabold tracking-[-0.045em]">
                {track.label}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "absolute -top-px left-0 h-[3px] w-full origin-left bg-[var(--ld-ink)] transition-transform duration-500 ease-[cubic-bezier(.2,.7,.2,1)]",
                  active ? "scale-x-100" : "scale-x-0"
                )}
              />
            </button>
          );
        })}
        <p className="mt-auto border-t border-[var(--ld-line-2)] pt-6 text-[15px] text-[var(--ld-text-muted)]">
          Select a track to see what is inside.
        </p>
      </div>

      <div className="min-h-[500px] min-w-0 flex-[999_1_520px]">
        {tracks.map((track) =>
          track.key === selected ? (
            <div
              key={track.key}
              id={`${baseId}-panel-${track.key}`}
              role="tabpanel"
              aria-labelledby={`${baseId}-tab-${track.key}`}
              tabIndex={0}
              className="h-full outline-none"
            >
              {track.key === "build" ? <BuildPanel lines={serviceLines} /> : null}
              {track.key === "mentor" ? <MentorPanel /> : null}
              {track.key === "explain" ? <ExplainPanel pair={pair} /> : null}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

function PanelHeader({ track, inverse }: { track: (typeof tracks)[number]; inverse?: boolean }) {
  return (
    <>
      <p className={cn("font-mono text-[13px] uppercase", inverse ? "text-[var(--ld-tint)]" : "opacity-80")}>
        {track.number} / {track.label}
      </p>
      <h3 className="ld-display relative mt-5 max-w-[32rem] text-[clamp(26px,3vw,40px)] leading-[1.1] font-bold tracking-[-0.03em]">
        {track.headline}
      </h3>
    </>
  );
}

function PanelAction({ track, tone }: { track: (typeof tracks)[number]; tone: "accent" | "ink" }) {
  return (
    <Link
      href={track.action.href}
      className={cn(
        "group mt-11 inline-flex min-h-13 items-center gap-2.5 self-start rounded-full px-6 font-semibold transition-transform hover:-translate-y-0.5",
        tone === "accent"
          ? "bg-[var(--ld-accent)] text-[var(--ld-ink)]"
          : "bg-[var(--ld-ink)] text-[var(--ld-paper)]"
      )}
    >
      {track.action.label}
      <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function BuildPanel({ lines }: { lines: string[] }) {
  const track = tracks[0];
  return (
    <div className="ld-zoom relative flex h-full flex-col overflow-hidden rounded-[28px] bg-[var(--ld-ink)] p-[clamp(24px,4vw,48px)] text-[var(--ld-paper)]">
      <div
        aria-hidden="true"
        className="ld-drift absolute -top-15 -right-15 size-[220px] rounded-full border-[40px] border-[var(--ld-accent)]"
      />
      <PanelHeader track={track} inverse />
      <ul className="relative mt-9 flex flex-wrap gap-2.5">
        {lines.map((line, index) => (
          <li
            key={line}
            className={cn(
              "ld-up rounded-full border border-[rgb(var(--ld-paper-rgb)/0.25)] px-4.5 py-3 text-[15px]",
              CASCADE[index % CASCADE.length]
            )}
          >
            {line}
          </li>
        ))}
      </ul>
      <PanelAction track={track} tone="accent" />
    </div>
  );
}

function MentorPanel() {
  const track = tracks[1];
  const tones = {
    accent: "bg-[var(--ld-accent)] text-[var(--ld-ink)]",
    ink: "bg-[var(--ld-ink)] text-[var(--ld-paper)]",
    tint: "bg-[var(--ld-tint-soft)] text-[var(--ld-ink)]",
  } as const;

  return (
    <div className="ld-zoom flex h-full flex-col rounded-[28px] border border-[var(--ld-line)] bg-[var(--ld-card)] p-[clamp(24px,4vw,48px)]">
      <PanelHeader track={track} />
      <p className="mt-8 mb-3 font-mono text-xs text-[var(--ld-text-muted)] uppercase">Your week</p>
      <ol className="grid grid-cols-7 gap-1.5">
        {mentorWeek.map((entry, index) => (
          <li
            key={entry.day}
            className={cn(
              "ld-up flex h-[92px] flex-col justify-between rounded-xl p-2 font-mono text-[11px] uppercase",
              "role" in entry ? tones[entry.tone] : "bg-[var(--ld-paper)]",
              CASCADE[index % CASCADE.length]
            )}
          >
            <span>{entry.day}</span>
            {"role" in entry ? (
              <span className="font-sans text-[13px] font-semibold normal-case">{entry.role}</span>
            ) : null}
          </li>
        ))}
      </ol>
      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2.5 text-[15px] text-[var(--ld-text-2)]">
        <li>Weekly protected 1:1s</li>
        <li>Honest code review</li>
        <li>Milestones between sessions</li>
      </ul>
      <PanelAction track={track} tone="ink" />
    </div>
  );
}

function ExplainPanel({ pair }: { pair: Props["pair"] }) {
  const track = tracks[2];
  return (
    <div className="ld-zoom flex h-full flex-col rounded-[28px] bg-[var(--ld-accent)] p-[clamp(24px,4vw,48px)] text-[var(--ld-ink)]">
      <PanelHeader track={track} />
      {pair ? (
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <div className="ld-up ld-delay-1 flex-[1_1_200px] rounded-[20px] bg-[var(--ld-ink)] p-6 text-[var(--ld-paper)]">
            <p className="font-mono text-xs text-[var(--ld-tint)] uppercase">The concept</p>
            <p className="ld-display mt-2 text-[34px] font-extrabold tracking-[-0.03em]">{pair.concept}</p>
          </div>
          <span aria-label="is like" className="ld-up ld-delay-2 ld-display text-5xl font-extrabold">
            ≈
          </span>
          <div className="ld-up ld-delay-3 flex-[1_1_200px] rounded-[20px] bg-[var(--ld-paper)] p-6">
            <p className="font-mono text-xs text-[var(--ld-text-muted)] uppercase">Like this</p>
            <p className="ld-display mt-2 text-[26px] leading-[1.1] font-extrabold tracking-[-0.02em]">
              {pair.analogy}
            </p>
          </div>
        </div>
      ) : null}
      <div className="mt-auto">
        <PanelAction track={track} tone="ink" />
      </div>
    </div>
  );
}

export { TracksView };
