"use client";

import { useEffect, useId, useState, type KeyboardEvent } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowDownIcon, ArrowUpRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SectionHeading } from "@/lib/content/blocks/source";
import type { AudienceView, StageView } from "@/lib/content/blocks/views";
import {
  pad,
  pathThrough,
  STAGE_INTERVAL_MS,
  startStageIndex,
  stationsFor,
} from "@/components/sections/mentorship-page/mentorship-content";

/* Each audience panel's palette, by position: navy, royal, light. */
const PANEL_TONES = [
  {
    bg: "bg-[linear-gradient(160deg,#0b1844,var(--ld-ink))] text-[var(--ld-paper)]",
    num: "text-[var(--ld-tint)]",
    stroke: "[-webkit-text-stroke:1.5px_rgb(var(--ld-tint-rgb)/0.45)]",
    desc: "text-[var(--ld-muted)]",
    ring: "border-[rgb(var(--ld-tint-rgb)/0.25)]",
    pin: "bg-[rgb(var(--ld-paper-rgb)/0.1)] text-[var(--ld-paper)]",
    pinDot: "bg-[var(--ld-tint)] text-[var(--ld-ink)]",
  },
  {
    bg: "bg-[linear-gradient(160deg,#2a4fae,var(--ld-deep))] text-[var(--ld-paper)]",
    num: "text-[var(--ld-muted)]",
    stroke: "[-webkit-text-stroke:1.5px_rgb(var(--ld-paper-rgb)/0.4)]",
    desc: "text-[#e3eaff]",
    ring: "border-[rgb(var(--ld-paper-rgb)/0.25)]",
    pin: "bg-[rgb(var(--ld-ink-rgb)/0.3)] text-[var(--ld-paper)]",
    pinDot: "bg-[var(--ld-paper)] text-[var(--ld-deep)]",
  },
  {
    bg: "bg-[linear-gradient(160deg,#c9d6fd,var(--ld-tint))] text-[var(--ld-ink)]",
    num: "text-[#2a3a72]",
    stroke: "[-webkit-text-stroke:1.5px_rgb(var(--ld-ink-rgb)/0.3)]",
    desc: "text-[#1d2a55]",
    ring: "border-[rgb(var(--ld-ink-rgb)/0.18)]",
    pin: "bg-[rgb(var(--ld-ink-rgb)/0.08)] text-[var(--ld-ink)]",
    pinDot: "bg-[var(--ld-ink)] text-[var(--ld-tint)]",
  },
];

/**
 * The audience panels and the path.
 *
 * The panels are WAI-ARIA tabs: the chosen one widens to show its description
 * and where that audience usually starts, the rest fold to a sideways title.
 * The choice moves a marker on the path below, which is the point of putting
 * the two together.
 *
 * The path advances on its own and holds while the pointer is over it or
 * keyboard focus is inside it (WCAG 2.2.2), and not at all under reduced
 * motion. Below `md` the curve becomes an upright list of the same stations.
 */
function AudiencePathView({
  audienceHeading,
  pathHeading,
  audiences,
  stages,
}: {
  audienceHeading: SectionHeading;
  pathHeading: SectionHeading;
  audiences: AudienceView[];
  stages: StageView[];
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const id = useId();
  const [chosen, setChosen] = useState(0);
  const [stage, setStage] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused || reduceMotion;

  const count = stages.length;
  useEffect(() => {
    if (paused || count < 2) return;
    const timer = window.setTimeout(() => {
      if (document.visibilityState === "visible") setStage((value) => (value + 1) % count);
    }, STAGE_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [paused, stage, count]);

  const audience = audiences[Math.min(chosen, audiences.length - 1)];
  const startIndex = audience ? startStageIndex(audience.startsAt, stages) : 0;
  const startLabel = audience?.short ? `${audience.short} start here` : "You start here";
  const stations = stationsFor(count);
  const d = pathThrough(stations);
  const current = Math.min(stage, Math.max(count - 1, 0));

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = audiences.length - 1;
    const next =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? index === last ? 0 : index + 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? index === 0 ? last : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : -1;
    if (next === -1) return;
    event.preventDefault();
    setChosen(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  }

  return (
    <>
      {audiences.length > 0 ? (
        <section aria-labelledby={`${id}-who`} className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
          <div className="doc-shell py-[clamp(64px,8vw,112px)]">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="mb-3.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">
                  {audienceHeading.eyebrow}
                </p>
                <h2
                  id={`${id}-who`}
                  className="ld-display max-w-[14ch] text-[clamp(38px,5.2vw,72px)] leading-[0.95] font-extrabold tracking-[-0.045em]"
                >
                  {audienceHeading.title}
                </h2>
              </div>
              <p className="font-mono text-xs tracking-[0.08em] text-[var(--ld-text-muted)] uppercase">
                Pick the one that sounds like you →
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Starting points"
              className="mt-11 flex flex-col gap-3.5 md:h-[460px] md:flex-row"
            >
              {audiences.map((item, index) => {
                const on = index === chosen;
                const tone = PANEL_TONES[index % PANEL_TONES.length];
                const starts = stages[startStageIndex(item.startsAt, stages)];
                return (
                  <button
                    key={item.title}
                    id={`${id}-tab-${index}`}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-label={item.title}
                    aria-controls={`${id}-panel`}
                    tabIndex={on ? 0 : -1}
                    onClick={() => setChosen(index)}
                    onPointerEnter={(event) => {
                      if (event.pointerType === "mouse") setChosen(index);
                    }}
                    onKeyDown={(event) => onTabKey(event, index)}
                    className={cn(
                      "relative min-w-0 overflow-hidden rounded-[26px] p-7 text-left outline-none transition-[flex-grow,background-color] duration-700 ease-[cubic-bezier(.2,.7,.2,1)] focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)] focus-visible:ring-offset-2",
                      "md:basis-0",
                      on ? cn("md:grow-[3.2]", tone.bg) : "bg-[#e6eaf5] text-[var(--ld-ink)] md:grow"
                    )}
                  >
                    {on ? (
                      <>
                        <span aria-hidden="true" className={cn("absolute -top-15 -right-15 size-60 rounded-full border", tone.ring)} />
                        <span aria-hidden="true" className={cn("absolute -top-2.5 -right-2.5 size-35 rounded-full border", tone.ring)} />
                      </>
                    ) : null}
                    <span
                      className={cn(
                        "relative flex items-start justify-between font-mono text-xs tracking-[0.1em]",
                        on ? tone.num : "text-[var(--ld-text-muted)]"
                      )}
                    >
                      <span />
                      <ArrowUpRightIcon
                        aria-hidden="true"
                        className={cn("size-[18px] transition-transform duration-500", on && "rotate-45")}
                      />
                    </span>

                    {/* Folded: the title on its side. Hidden below md, where
                        every panel is open. */}
                    <span
                      aria-hidden={on}
                      className={cn(
                        "ld-display absolute bottom-7 left-7 hidden rotate-180 text-[26px] font-bold tracking-[-0.02em] whitespace-nowrap transition-opacity duration-300 [writing-mode:vertical-rl] md:block",
                        on ? "opacity-0" : "opacity-100"
                      )}
                    >
                      {item.title}
                    </span>

                    <span
                      className={cn(
                        "relative mt-5 block transition-[opacity,transform] duration-500 md:absolute md:right-7 md:bottom-7 md:left-7 md:mt-0",
                        on ? "opacity-100" : "md:pointer-events-none md:translate-y-4 md:opacity-0"
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "ld-display mb-[18px] hidden text-[clamp(90px,10vw,150px)] leading-[0.8] font-extrabold tracking-[-0.06em] text-transparent md:block",
                          on && tone.stroke
                        )}
                      >
                        {pad(index + 1)}
                      </span>
                      <span aria-hidden="true" className="mb-[18px] block h-0.5 w-9 rounded-full bg-[var(--ld-accent)]" />
                      <span className="ld-display block max-w-[18ch] text-[clamp(26px,2.8vw,40px)] leading-none font-extrabold tracking-[-0.035em]">
                        {item.title}
                      </span>
                      <span className={cn("mt-3.5 block max-w-[32rem] text-[17px] leading-normal", on ? tone.desc : "text-[var(--ld-text-2)]")}>
                        {item.description}
                      </span>
                      {starts ? (
                        <span
                          className={cn(
                            "mt-5 inline-flex items-center gap-2.5 rounded-full py-2 pr-3.5 pl-2 text-sm font-semibold",
                            on ? tone.pin : "bg-[rgb(var(--ld-ink-rgb)/0.06)]"
                          )}
                        >
                          Usually starts at {starts.label}
                          <ArrowDownIcon aria-hidden="true" className="size-3.5" />
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
            <p id={`${id}-panel`} role="tabpanel" aria-live="polite" className="sr-only">
              {audience ? `${audience.title}. ${audience.description}` : ""}
            </p>
          </div>
        </section>
      ) : null}

      {count > 0 ? (
        <section
          id="how-it-works"
          aria-labelledby={`${id}-path`}
          className="relative scroll-mt-24 overflow-hidden bg-[linear-gradient(160deg,#0b1844_0%,var(--ld-deep)_100%)] text-[var(--ld-paper)]"
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onFocus={(event) => {
            if ((event.target as HTMLElement).matches(":focus-visible")) setFocused(true);
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
          }}
        >
          <span
            aria-hidden="true"
            className="absolute -top-[40%] -right-[10%] aspect-square w-[min(70vw,900px)] rounded-full bg-[radial-gradient(circle,rgb(var(--ld-tint-rgb)/0.16),transparent_60%)]"
          />
          <div className="doc-shell relative py-[clamp(64px,8vw,112px)]">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="mb-3.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-tint)] uppercase">{pathHeading.eyebrow}</p>
                <h2
                  id={`${id}-path`}
                  className="ld-display text-[clamp(38px,5.2vw,72px)] leading-[0.95] font-extrabold tracking-[-0.045em]"
                >
                  {pathHeading.title}
                </h2>
              </div>
              {pathHeading.lede ? (
                <p className="max-w-[24rem] text-[17px] leading-relaxed text-[var(--ld-muted)]">{pathHeading.lede}</p>
              ) : null}
            </div>

            <ol aria-label="Stages" className="relative mt-12 md:mt-[clamp(48px,6vw,72px)] md:aspect-[1200/300]">
              <svg
                viewBox="0 0 1200 300"
                preserveAspectRatio="none"
                aria-hidden="true"
                className="absolute inset-0 hidden size-full overflow-visible md:block"
              >
                <defs>
                  <linearGradient id={`${id}-line`} x1="0" x2="1">
                    <stop offset="0" stopColor="#AFC4FF" />
                    <stop offset="1" stopColor="#F4F5FA" />
                  </linearGradient>
                </defs>
                <path d={d} fill="none" stroke="rgb(8 16 46 / 0.35)" strokeWidth="14" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                <path
                  d={d}
                  fill="none"
                  stroke={`url(#${id}-line)`}
                  strokeWidth="14"
                  strokeLinecap="round"
                  pathLength={100}
                  strokeDasharray="100 100"
                  strokeDashoffset={100 - (stations[current]?.along ?? 0)}
                  vectorEffect="non-scaling-stroke"
                  className="transition-[stroke-dashoffset] duration-1000 ease-[cubic-bezier(.2,.7,.2,1)]"
                />
                <path
                  d={d}
                  fill="none"
                  stroke="rgb(8 16 46 / 0.5)"
                  strokeWidth="2"
                  strokeDasharray="2 12"
                  vectorEffect="non-scaling-stroke"
                  className="ld-flow"
                />
              </svg>
              {/* The upright rail for narrow screens. */}
              <span aria-hidden="true" className="absolute top-2 bottom-2 left-[10px] w-[3px] rounded-full bg-[rgb(var(--ld-tint-rgb)/0.25)] md:hidden" />

              {stages.map((item, index) => {
                const station = stations[index];
                const on = index === current;
                const done = index < current;
                const isStart = index === startIndex;
                return (
                  <li
                    key={item.label}
                    className="relative pb-6 pl-10 md:static md:p-0"
                    style={{ ["--x" as string]: `${station.x}%`, ["--y" as string]: `${station.y}%` }}
                  >
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setStage(index)}
                      className="group flex w-full items-start gap-0 text-left outline-none md:contents"
                    >
                      <span
                        className={cn(
                          "absolute top-0 left-0 grid size-[23px] place-items-center rounded-full border-[3px] font-mono text-[13px] transition-[background-color,border-color,box-shadow] duration-500",
                          "md:top-[var(--y)] md:left-[var(--x)] md:size-[54px] md:-translate-x-1/2 md:-translate-y-1/2 md:border-4",
                          "group-focus-visible:ring-2 group-focus-visible:ring-[var(--ld-accent)]",
                          on
                            ? "border-[var(--ld-paper)] bg-[var(--ld-paper)] text-[var(--ld-ink)] shadow-[0_0_0_7px_rgb(11_24_68/0.9),0_0_0_8.5px_rgb(var(--ld-accent-rgb)/0.85),0_0_40px_rgb(var(--ld-tint-rgb)/0.45)]"
                            : done
                              ? "border-[var(--ld-tint)] bg-[var(--ld-tint)] text-[var(--ld-ink)]"
                              : "border-[rgb(var(--ld-tint-rgb)/0.35)] bg-[#13296b] text-[var(--ld-tint)]"
                        )}
                      >
                        <span className="hidden md:inline">{pad(index + 1)}</span>
                      </span>
                      <span
                        className={cn(
                          "block whitespace-nowrap md:absolute md:left-[var(--x)] md:-translate-x-1/2 md:text-center",
                          station.high
                            ? "md:top-[calc(var(--y)-40px)] md:-translate-y-full"
                            : "md:top-[calc(var(--y)+40px)]"
                        )}
                      >
                        <span
                          className={cn(
                            "ld-display block text-[22px] font-bold tracking-[-0.02em] transition-colors duration-500 md:text-[clamp(16px,1.7vw,24px)]",
                            on ? "text-[var(--ld-paper)]" : done ? "text-[var(--ld-muted)]" : "text-[rgb(213_223_252/0.65)]"
                          )}
                        >
                          {item.label}
                        </span>
                        <span className="mt-1 block text-[13.5px] text-[rgb(213_223_252/0.7)]">{item.summary}</span>
                      </span>
                    </button>
                    {isStart ? (
                      <span
                        className={cn(
                          "ld-pop z-10 mt-2 inline-flex items-center gap-2 rounded-[10px] border border-[rgb(var(--ld-tint-rgb)/0.35)] bg-[var(--ld-ink)] px-3 py-1.5 font-mono text-[11px] tracking-[0.06em] whitespace-nowrap text-[var(--ld-paper)] uppercase shadow-[0_16px_30px_-12px_rgb(0_0_0/0.6)]",
                          "md:absolute md:left-[var(--x)] md:mt-0 md:-translate-x-1/2",
                          station.high ? "md:top-[calc(var(--y)+40px)]" : "md:top-[calc(var(--y)-40px)] md:-translate-y-full"
                        )}
                        key={startLabel}
                      >
                        <span aria-hidden="true" className="size-[7px] rounded-full bg-[#54D696]" />
                        {startLabel}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ol>

            {stages[current] ? (
              <div className="mt-[clamp(40px,8vw,104px)] grid gap-[clamp(28px,4vw,64px)] rounded-[26px] border border-[rgb(var(--ld-tint-rgb)/0.2)] bg-[rgb(var(--ld-ink-rgb)/0.42)] p-[clamp(24px,3vw,40px)] backdrop-blur-[10px] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div>
                  <p className="font-mono text-xs tracking-[0.1em] text-[var(--ld-tint)] uppercase">
                    Stage <span className="text-[var(--ld-accent)]">{pad(current + 1)}</span> of {pad(count)}
                  </p>
                  <h3 className="ld-display mt-3.5 text-[clamp(36px,4.2vw,60px)] leading-[0.95] font-extrabold tracking-[-0.045em]">
                    {stages[current].label}
                  </h3>
                  <p className="mt-3 text-lg text-[var(--ld-tint)]">{stages[current].summary}</p>
                </div>
                <div className="flex flex-col justify-between gap-6">
                  <p className="text-[17.5px] leading-relaxed text-[var(--ld-muted)]">{stages[current].description}</p>
                  <div aria-hidden="true" className="flex items-center gap-3.5">
                    <span className="h-[3px] flex-1 overflow-hidden rounded-full bg-[rgb(var(--ld-tint-rgb)/0.18)]">
                      <span
                        key={paused ? "held" : current}
                        className={cn(
                          "block h-full bg-[var(--ld-paper)]",
                          paused ? "w-full opacity-35" : current % 2 ? "ld-fill-a" : "ld-fill-b"
                        )}
                        style={paused ? undefined : { animationDuration: `${STAGE_INTERVAL_MS}ms` }}
                      />
                    </span>
                    <span className="font-mono text-[11px] tracking-[0.08em] text-[var(--ld-muted)] uppercase">
                      {paused ? "Paused" : "Auto"}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  );
}

export { AudiencePathView };
