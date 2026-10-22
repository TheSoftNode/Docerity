"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, type PointerEvent } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import { BOARD_WIDTH, boardingPass } from "@/components/sections/home/home-data";

export type BoardRow = {
  number: string;
  label: string;
  status: string;
  lamp: string;
  /** The words this row cycles through, already fitted to the board. */
  words: string[];
  /** Where each word leads, index for index with `words`. */
  hrefs: string[];
};

/* ---------------------------------------------------------------
   The clock in the board's header.

   One interval shared by every subscriber, read through
   `useSyncExternalStore` so the server renders a placeholder and the client
   takes over without a hydration mismatch. The snapshot is cached between
   ticks, which the hook requires: returning a fresh string on every read
   would make React think the store changed on each render.
   --------------------------------------------------------------- */
let clockValue = "--:--:--";
const clockListeners = new Set<() => void>();
let clockTimer: number | undefined;

function formatNow() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function subscribeClock(listener: () => void) {
  clockListeners.add(listener);
  if (clockTimer === undefined) {
    clockValue = formatNow();
    clockTimer = window.setInterval(() => {
      clockValue = formatNow();
      clockListeners.forEach((notify) => notify());
    }, 1000);
  }
  return () => {
    clockListeners.delete(listener);
    if (clockListeners.size === 0 && clockTimer !== undefined) {
      window.clearInterval(clockTimer);
      clockTimer = undefined;
    }
  };
}

function useClock() {
  return useSyncExternalStore(
    subscribeClock,
    () => clockValue,
    () => "--:--:--"
  );
}

/* ---------------------------------------------------------------
   The split-flap scramble.

   When the board moves to a new word, each tile shows random characters until
   its turn comes to lock, left to right, with each row starting a little after
   the one above. `progress` counts ticks since the change; it is stored with
   the step it belongs to, so the first render after a change already reads as
   "nothing locked yet" instead of flashing the new word for one tick.

   The first word is rendered fully locked, on the server and the client
   alike, so there is no random text to mismatch during hydration.
   --------------------------------------------------------------- */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const TICK_MS = 55;
const ROW_STAGGER = 3;
const SETTLED = BOARD_WIDTH + ROW_STAGGER * 3;

function useScramble(step: number, enabled: boolean) {
  const [state, setState] = useState({ step, progress: SETTLED });

  useEffect(() => {
    if (!enabled || step === 0) return;
    let progress = 0;
    const timer = window.setInterval(() => {
      progress += 1;
      setState({ step, progress });
      if (progress >= SETTLED) window.clearInterval(timer);
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [step, enabled]);

  if (!enabled) return SETTLED;
  return state.step === step ? state.progress : 0;
}

/*
  The character a searching tile shows on a given tick.

  A small integer hash of the tick and the tile's position rather than
  `Math.random()`, so rendering stays pure (the same props always draw the same
  board, which is what React requires of render) while still looking random to
  anybody watching.
*/
function glyphAt(progress: number, row: number, index: number) {
  let hash = progress * 374761393 + row * 668265263 + index * 2246822519;
  hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
  return GLYPHS[Math.abs(hash ^ (hash >>> 16)) % GLYPHS.length];
}

function tilesFor(word: string, progress: number, row: number) {
  return Array.from({ length: BOARD_WIDTH }, (_, index) => {
    const target = word[index] ?? " ";
    const locked = index < progress - row * ROW_STAGGER;
    if (locked) return { char: target === " " ? " " : target, searching: false };
    return { char: glyphAt(progress, row, index), searching: true };
  });
}

/* ---------------------------------------------------------------
   The board.
   --------------------------------------------------------------- */
function NowBoard({
  rows,
  step,
  activeRow,
}: {
  rows: BoardRow[];
  step: number;
  /** The row that matches the headline's current line, lifted toward the viewer. */
  activeRow: number;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const progress = useScramble(step, !reduceMotion);
  const clock = useClock();
  const [tilt, setTilt] = useState<{ x: number; y: number } | null>(null);

  /* The board turns toward the pointer while it is over it, and goes back to
     its slow sway when it leaves. Skipped for touch, where there is no hover
     to follow, and under reduced motion. */
  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    setTilt({ x: -y * 18, y: x * 26 });
  }

  return (
    <div
      onPointerMove={onPointerMove}
      onPointerLeave={() => setTilt(null)}
      className="px-3 pt-7 pb-24 [perspective:1300px] [perspective-origin:50%_40%]"
    >
      <div
        className={cn("relative [transform-style:preserve-3d]", tilt ? "" : "ld-sway")}
        style={tilt ? { transform: "rotateY(-10deg) rotateX(6deg)" } : undefined}
      >
        <div
          className="relative transition-transform duration-300 ease-out [transform-style:preserve-3d]"
          style={{ transform: tilt ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` : undefined }}
        >
          {/* The floor shadow and three back plates, set behind the face in
              depth. They are what make the board read as an object with
              thickness when it turns, rather than a card. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-[10%] -bottom-[70px] h-[46px] rounded-full bg-black/60 blur-[26px] [transform:translateZ(-80px)]"
          />
          <div aria-hidden="true" className="absolute inset-0 rounded-[22px] bg-[var(--ld-ink-3)] [transform:translateZ(-18px)]" />
          <div aria-hidden="true" className="absolute inset-0 rounded-[22px] bg-[var(--ld-ink-2)] [transform:translateZ(-12px)]" />
          <div aria-hidden="true" className="absolute inset-0 rounded-[22px] bg-[var(--ld-panel)] [transform:translateZ(-6px)]" />

          <div className="ld-board relative rounded-[22px] border border-[rgb(var(--ld-tint-rgb)/0.28)] border-t-[rgb(var(--ld-paper-rgb)/0.28)] bg-[var(--ld-deep)] p-3.5 [transform-style:preserve-3d] sm:p-5">
            <div className="flex items-center justify-between gap-3 px-1.5 pt-1 pb-4 font-mono text-xs tracking-[0.08em]">
              <span className="inline-flex items-center gap-2.5 text-[var(--ld-paper)]">
                <span className="ld-pulse size-2.5 rounded-[3px] bg-[var(--ld-accent)]" />
                DOCERITY · NOW
              </span>
              <span className="text-[var(--ld-tint)] tabular-nums" suppressHydrationWarning>
                {clock}
              </span>
            </div>

            <div className="flex items-center gap-3 px-3 pb-2 font-mono text-[10px] tracking-[0.1em] text-[var(--ld-muted-3)]">
              <span className="hidden w-[76px] shrink-0 sm:inline">TRACK</span>
              <span className="flex-1">NOW</span>
              <span className="hidden sm:inline">STATUS</span>
            </div>

            <ul className="flex flex-col gap-1.5 [transform-style:preserve-3d]">
              {rows.map((row, rowIndex) => {
                const position = step % row.words.length;
                const word = row.words[position];
                const active = rowIndex === activeRow;
                return (
                  <li key={row.label}>
                    <Link
                      href={row.hrefs[position]}
                      aria-label={`${row.label}: ${word}`}
                      className={cn(
                        "flex flex-col gap-2 rounded-xl border-l-[3px] px-2.5 py-3 sm:flex-row sm:items-center sm:gap-3 transition-[transform,background-color,border-color,box-shadow] duration-700 ease-[cubic-bezier(.2,.7,.2,1)] hover:bg-[rgb(var(--ld-paper-rgb)/0.07)]",
                        active
                          ? "border-[var(--ld-accent)] bg-[var(--ld-row)] shadow-[0_26px_40px_-18px_rgb(0_0_0/0.75)] [transform:translateZ(42px)]"
                          : "border-transparent [transform:translateZ(0)]"
                      )}
                    >
                      <span
                        className={cn(
                          "flex shrink-0 gap-2 font-mono text-[11px] leading-normal transition-colors duration-500 sm:block sm:w-[76px]",
                          active ? "text-[var(--ld-accent)]" : "text-[var(--ld-tint)]"
                        )}
                      >
                        <span className="opacity-70 sm:block">{row.number}</span>
                        <span className="font-medium uppercase sm:block">{row.label}</span>
                      </span>
                      <span aria-hidden="true" className="flex min-w-0 flex-1 gap-[3px] [perspective:260px]">
                        {tilesFor(word, progress, rowIndex).map((tile, index) => (
                          <span
                            key={index}
                            className="ld-tile"
                            data-searching={tile.searching}
                            style={{ color: tile.searching ? "var(--ld-dim)" : "var(--ld-paper)" }}
                          >
                            {tile.char}
                          </span>
                        ))}
                      </span>
                      <span className="hidden items-center gap-1.5 font-mono text-[10px] whitespace-nowrap text-[var(--ld-tint)] uppercase sm:inline-flex">
                        <span
                          className="ld-live size-[7px] rounded-full"
                          style={{ background: row.lamp, boxShadow: `0 0 12px ${row.lamp}` }}
                        />
                        {row.status}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-[rgb(var(--ld-tint-rgb)/0.25)] px-1.5 pt-3.5 pb-0.5 font-mono text-[11px] text-[var(--ld-muted-3)]">
              <span>Tap a row to open it</span>
              <span aria-hidden="true" className="text-[var(--ld-paper)]">↗</span>
            </div>
          </div>

          <BoardingPass />
        </div>
      </div>
    </div>
  );
}

/**
 * The ticket floating in front of the board, nearer the viewer than anything
 * else on it, which is what makes the depth legible. It is the hero's quiet
 * second route to the contact page.
 */
function BoardingPass() {
  return (
    <Link
      href="/contact"
      aria-label="Start a project"
      className="group absolute -right-1.5 -bottom-[70px] [transform:translateZ(110px)_rotate(-7deg)] sm:-right-[22px] sm:-bottom-[78px]"
    >
      <span className="ld-float flex w-60 overflow-hidden rounded-2xl bg-[var(--ld-paper)] text-[var(--ld-ink)] shadow-[0_40px_60px_-24px_rgb(0_0_0/0.7)] transition-transform duration-300 group-hover:scale-[1.03] sm:w-[300px]">
        <span className="flex flex-1 flex-col gap-2 px-4 py-3.5">
          <span className="flex justify-between font-mono text-[9px] tracking-[0.14em] text-[var(--ld-text-muted)]">
            <span>BOARDING PASS</span>
            <span>{boardingPass.code}</span>
          </span>
          <span className="ld-display flex items-center gap-2.5 text-2xl font-extrabold tracking-[-0.03em] uppercase">
            {boardingPass.from}
            <svg width="22" height="14" viewBox="0 0 22 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M1 7h19" />
              <path d="M14 1l6 6-6 6" />
            </svg>
            {boardingPass.to}
          </span>
          <span className="flex gap-4 font-mono text-[9px] text-[var(--ld-text-muted)] uppercase">
            {boardingPass.fields.map((field) => (
              <span key={field.label}>
                {field.label}
                <span className="block text-[11px] text-[var(--ld-ink)]">{field.value}</span>
              </span>
            ))}
          </span>
        </span>
        <span className="relative flex w-[74px] shrink-0 flex-col items-center justify-center gap-1.5 border-l-2 border-dashed border-[rgb(var(--ld-ink-rgb)/0.35)] bg-[var(--ld-accent)]">
          {/* The punched notches, cut in the hero's colour so they read as
              holes through the ticket. */}
          <span aria-hidden="true" className="absolute -top-2 -left-2.5 size-4 rounded-full bg-[var(--ld-ink)]" />
          <span aria-hidden="true" className="absolute -bottom-2 -left-2.5 size-4 rounded-full bg-[var(--ld-ink)]" />
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 17L17 7" />
            <path d="M8 7h9v9" />
          </svg>
          <span className="font-mono text-[10px] font-medium tracking-[0.1em] uppercase">
            {boardingPass.stub}
          </span>
        </span>
      </span>
    </Link>
  );
}

export { NowBoard };
