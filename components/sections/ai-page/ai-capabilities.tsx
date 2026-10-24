import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { getGroup, getHeading } from "@/lib/content/blocks/source";
import type { CapabilityView } from "@/lib/content/blocks/views";
import { pad } from "@/components/sections/blog-page/blog-content";

/*
  Each capability's small working picture, by position: tiers taking their
  share of the traffic, a search finding the nearest neighbours, images
  through a quality gate, and a rubric that scores "correct" above "sounds
  right". Decoration showing the idea; the title and description beside each
  say what it is. A fifth capability gets the text alone.
*/
function TierBars() {
  const bars = [
    { label: "GPT-4o", width: "22%", tone: "bg-[var(--ld-paper)]" },
    { label: "Gemini", width: "38%", tone: "bg-[var(--ld-tint)]" },
    { label: "Rules", width: "56%", tone: "bg-[rgb(var(--ld-tint-rgb)/0.5)]" },
  ];
  return (
    <div className="flex h-[150px] flex-col justify-center gap-[9px] p-[22px]">
      {bars.map((bar) => (
        <span key={bar.label} className="flex items-center gap-3">
          <span className="w-[74px] font-mono text-[11px] text-[var(--ld-muted-3)]">{bar.label}</span>
          <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-[rgb(var(--ld-tint-rgb)/0.1)]">
            <span className={cn("ld-grow block h-full rounded-full", bar.tone)} style={{ width: bar.width }} />
          </span>
        </span>
      ))}
    </div>
  );
}

const POINTS = [
  [12, 30], [22, 62], [30, 22], [38, 74], [45, 40], [52, 18], [58, 58], [60, 36], [64, 48],
  [66, 30], [70, 62], [74, 42], [80, 24], [84, 70], [88, 46], [18, 46], [42, 56], [92, 30],
] as const;

function NearestNeighbours() {
  return (
    <div className="relative h-[150px]">
      {POINTS.map(([x, y]) => {
        const near = Math.hypot(x - 62, y - 44) < 13;
        return (
          <span
            key={`${x}-${y}`}
            className={cn("absolute rounded-full", near ? "size-2.5 bg-[var(--ld-paper)]" : "size-[7px] bg-[rgb(var(--ld-tint-rgb)/0.4)]")}
            style={{ left: `${x}%`, top: `${y}%` }}
          />
        );
      })}
      <span className="ld-pulse absolute top-[44%] left-[62%] -mt-[37px] -ml-[37px] size-[74px] rounded-full border-[1.5px] border-dashed border-[rgb(var(--ld-paper-rgb)/0.6)]" />
    </div>
  );
}

function QualityGate() {
  const frames = [
    { tag: "Blur ✕", ring: "border-[#ffb39c]", tone: "bg-[#ffb39c]", blur: true },
    { tag: "Exposure ✕", ring: "border-[#ffb39c]", tone: "bg-[#ffb39c]", blur: false },
    { tag: "Pass ✓", ring: "border-[#8de3b6]", tone: "bg-[#8de3b6]", blur: false },
  ];
  return (
    <div className="flex h-[150px] items-center justify-center gap-3.5">
      {frames.map((frame) => (
        <span key={frame.tag} className={cn("relative h-24 w-[82px] rounded-xl border-[1.5px] bg-[linear-gradient(160deg,#2a4fae,#13296b)]", frame.ring)}>
          {frame.blur ? <span className="absolute inset-0 rounded-xl backdrop-blur-[2px]" /> : null}
          <span className={cn("absolute -bottom-2.5 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 font-mono text-[9.5px] whitespace-nowrap text-[var(--ld-ink)] uppercase", frame.tone)}>
            {frame.tag}
          </span>
        </span>
      ))}
    </div>
  );
}

function Rubric() {
  const rows = [
    { label: "Correct", score: 5 },
    { label: "Complete", score: 4 },
    { label: "Sounds right only", score: 1 },
  ];
  return (
    <div className="flex h-[150px] flex-col justify-center gap-[7px] px-[22px] py-5 font-mono text-xs">
      {rows.map((row) => (
        <span key={row.label} className="flex items-center gap-2.5 rounded-[10px] bg-[rgb(var(--ld-tint-rgb)/0.06)] px-2.5 py-[7px]">
          <span className="flex-1 text-[var(--ld-muted)]">{row.label}</span>
          <span className="inline-flex gap-[3px]">
            {[1, 2, 3, 4, 5].map((pip) => (
              <span key={pip} className={cn("size-2 rounded-[2px]", pip <= row.score ? "bg-[var(--ld-paper)]" : "bg-[rgb(var(--ld-tint-rgb)/0.18)]")} />
            ))}
          </span>
        </span>
      ))}
    </div>
  );
}

const PICTURES: ReactNode[] = [<TierBars key="tiers" />, <NearestNeighbours key="rag" />, <QualityGate key="gate" />, <Rubric key="rubric" />];

/**
 * What we build, as four pieces each with a small working picture, then the
 * models they draw on, picked per task.
 */
async function AiCapabilities() {
  const [heading, capabilities, modelsHeading, models] = await Promise.all([
    getHeading("ai", "ai-capabilities"),
    getGroup<CapabilityView[]>("ai", "capabilities"),
    getHeading("ai", "ai-models"),
    getGroup<string[]>("ai", "models"),
  ]);

  return (
    <section aria-labelledby="ai-capabilities-title" className="relative overflow-hidden bg-[linear-gradient(160deg,#0b1844,#13296b)] text-[var(--ld-paper)]">
      <div className="doc-shell py-[clamp(64px,8vw,112px)]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3.5 flex items-center gap-2.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-tint)] uppercase">
              <span aria-hidden="true" className="size-[7px] rounded-[2px] bg-[var(--ld-accent)]" />
              {heading.eyebrow}
            </p>
            <h2 id="ai-capabilities-title" className="ld-display text-[clamp(38px,5.2vw,72px)] leading-[0.95] font-extrabold tracking-[-0.045em]">
              {heading.title}
            </h2>
          </div>
          {heading.lede ? <p className="max-w-[26rem] text-[17px] leading-relaxed text-[var(--ld-muted)]">{heading.lede}</p> : null}
        </div>

        <ul className="mt-11 grid gap-4 md:grid-cols-2">
          {(capabilities ?? []).map((capability, index) => (
            <li
              key={capability.title}
              className="overflow-hidden rounded-3xl border border-[rgb(var(--ld-tint-rgb)/0.16)] bg-[rgb(var(--ld-ink-rgb)/0.45)] transition-[transform,border-color] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-1 hover:border-[rgb(var(--ld-tint-rgb)/0.4)]"
            >
              {PICTURES[index] ? <div aria-hidden="true">{PICTURES[index]}</div> : null}
              <div className="px-6 pt-1 pb-[26px]">
                <p className="font-mono text-xs text-[var(--ld-tint)]">{pad(index + 1)}</p>
                <h3 className="ld-display mt-2 text-2xl font-bold tracking-[-0.02em]">{capability.title}</h3>
                <p className="mt-2 text-[15.5px] leading-normal text-[var(--ld-muted)]">{capability.description}</p>
              </div>
            </li>
          ))}
        </ul>

        {models && models.length > 0 ? (
          <div className="mt-[clamp(48px,6vw,72px)] grid gap-6 border-t border-[rgb(var(--ld-tint-rgb)/0.16)] pt-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
            <div>
              <p className="mb-3 font-mono text-[11.5px] tracking-[0.1em] text-[var(--ld-muted-3)] uppercase">{modelsHeading.eyebrow}</p>
              <h2 className="ld-display max-w-[16ch] text-[clamp(26px,3vw,40px)] leading-none font-extrabold tracking-[-0.04em]">{modelsHeading.title}</h2>
              {modelsHeading.lede ? <p className="mt-3 max-w-[30rem] text-[15.5px] leading-relaxed text-[var(--ld-muted)]">{modelsHeading.lede}</p> : null}
            </div>
            <ul className="flex flex-wrap gap-2 lg:justify-end">
              {models.map((model) => (
                <li key={model} className="rounded-full border border-[rgb(var(--ld-tint-rgb)/0.28)] px-3.5 py-2 text-[13.5px] text-[var(--ld-muted)]">
                  {model}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export { AiCapabilities };
