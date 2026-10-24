import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { getGroup, getHeading } from "@/lib/content/blocks/source";
import type { StageView, TitledView } from "@/lib/content/blocks/views";
import { CallClock } from "@/components/sections/mentorship-page/call-clock";
import { pad } from "@/components/sections/mentorship-page/mentorship-content";

/*
  Each tile's picture of the item at work, by position: the call, a review
  comment being resolved, the plan ticking off stages, a message answered.
  The pictures are decoration showing the format; the editable title and
  description beside each say what it is. A fifth item gets the text alone.
*/
function CallPicture() {
  return (
    <div className="relative grid h-60 grid-cols-2 gap-3 bg-[radial-gradient(circle_at_70%_0%,rgb(64_110_230/0.5),transparent_60%)] p-5">
      <div className="relative grid place-items-center rounded-2xl bg-[var(--ld-deep)]">
        <span className="ld-display text-xl font-extrabold">You</span>
        <span className="absolute bottom-3 left-3 flex h-[18px] items-end gap-[3px]">
          {[0, 0.15, 0.3, 0.45].map((delay) => (
            <span key={delay} className="ld-wave w-[3px] rounded-sm bg-[var(--ld-tint)]" style={{ animationDelay: `${delay}s` }} />
          ))}
        </span>
      </div>
      <div className="relative grid place-items-center rounded-2xl bg-[#13296b] shadow-[inset_0_0_0_2px_rgb(var(--ld-tint-rgb)/0.5)]">
        <span className="grid size-14 place-items-center rounded-2xl bg-[var(--ld-ink)]">
          <Image src="/brand/logo-sapphire.png" alt="" width={34} height={34} className="size-[34px] object-contain" />
        </span>
        <span className="absolute bottom-2.5 left-3 font-mono text-[10.5px] text-[var(--ld-muted)] uppercase">Your mentor</span>
      </div>
      <span className="absolute bottom-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-[rgb(var(--ld-tint-rgb)/0.2)] bg-[rgb(6_11_32/0.85)] px-3 py-1.5 font-mono text-[11px] text-[var(--ld-paper)]">
        <span className="ld-blink size-[7px] rounded-full bg-[#FF6B3D]" />
        1:1 · <CallClock />
      </span>
    </div>
  );
}

function ReviewPicture() {
  return (
    <div className="h-60 bg-[var(--ld-panel)] p-[22px] font-mono text-[13px] leading-[1.9] text-[var(--ld-muted)]">
      <div>
        <span className="text-[var(--ld-muted-3)]">12</span>&nbsp;&nbsp;<span className="text-[var(--ld-tint)]">const</span> d = await load(id)
      </div>
      <div className="ld-beat-1 my-2 ml-[26px] rounded-xl border border-[rgb(var(--ld-tint-rgb)/0.4)] bg-[#13296b] px-3 py-2 font-sans text-[13px] text-[var(--ld-paper)]">
        Name it for what it holds. <span className="text-[var(--ld-muted-3)]">d → draft</span>
      </div>
      <div>
        <span className="text-[var(--ld-muted-3)]">13</span>&nbsp;&nbsp;<span className="text-[#8de3b6]">+ const draft = await load(id)</span>
      </div>
      <div className="ld-beat-2 mt-1.5 inline-flex items-center gap-1.5 text-[11px] text-[#8de3b6]">✓ RESOLVED · BEFORE THE CALL</div>
    </div>
  );
}

function PlanPicture({ stages }: { stages: StageView[] }) {
  return (
    <div className="flex h-60 flex-col justify-center gap-2.5 bg-[linear-gradient(160deg,#dfe6fb,#c7d5fd)] px-6 py-[22px] text-[var(--ld-ink)]">
      {stages.slice(0, 4).map((stage, index) => (
        <div key={stage.label} className="flex items-center gap-3 rounded-xl border border-[rgb(var(--ld-ink-rgb)/0.08)] bg-[rgb(251_251_253/0.85)] px-3 py-2.5">
          <span
            className={cn(
              "grid size-5 place-items-center rounded-md border-[1.5px] border-[var(--ld-line-2)] text-xs font-bold text-transparent",
              /* The last stage stays ahead: the plan is never finished. */
              index < Math.min(stages.length, 4) - 1 && "ld-tick"
            )}
            style={{ animationDelay: `${index * 1.4}s` }}
          >
            ✓
          </span>
          <span className="text-sm font-medium">{stage.label}</span>
          <span className="ml-auto font-mono text-[11px] text-[var(--ld-text-muted)] uppercase">Stage {pad(index + 1)}</span>
        </div>
      ))}
    </div>
  );
}

function MessagePicture() {
  return (
    <div className="flex h-60 flex-col justify-end gap-2.5 bg-[radial-gradient(circle_at_20%_0%,rgb(var(--ld-tint-rgb)/0.25),transparent_60%)] p-[22px]">
      <span className="ld-beat-1 max-w-[80%] self-start rounded-[16px_16px_16px_4px] bg-[var(--ld-paper)] px-3.5 py-2.5 text-sm text-[var(--ld-ink)]">
        Migration failing on prod, can you take a look?
      </span>
      <span className="ld-beat-2 max-w-[80%] self-end rounded-[16px_16px_4px_16px] border border-[rgb(var(--ld-tint-rgb)/0.25)] bg-[var(--ld-ink)] px-3.5 py-2.5 text-sm text-[var(--ld-paper)]">
        On it. Paste the error and the last migration.
      </span>
      <span className="ld-beat-3 inline-flex gap-1 self-start rounded-2xl bg-[rgb(var(--ld-paper-rgb)/0.16)] px-3.5 py-3">
        {[0, 0.15, 0.3].map((delay) => (
          <span key={delay} className="ld-typing size-1.5 rounded-full bg-[var(--ld-paper)]" style={{ animationDelay: `${delay}s` }} />
        ))}
      </span>
    </div>
  );
}

/* Tile colours by position, and the shade of the accent that reads on each. */
const TILES = [
  { tile: "bg-[var(--ld-ink)] text-[var(--ld-paper)]", desc: "text-[var(--ld-muted)]", num: "text-[var(--ld-accent)]" },
  { tile: "border border-[var(--ld-line)] bg-[var(--ld-card)] text-[var(--ld-ink)]", desc: "text-[var(--ld-text-2)]", num: "text-[#c9502f]" },
  { tile: "border border-[var(--ld-line)] bg-[var(--ld-card)] text-[var(--ld-ink)]", desc: "text-[var(--ld-text-2)]", num: "text-[#c9502f]" },
  { tile: "bg-[var(--ld-deep)] text-[var(--ld-paper)]", desc: "text-[var(--ld-muted)]", num: "text-[#ffb39c]" },
];

/**
 * What you get: the editable format items as a bento, each with a small
 * picture of it at work, on columns of unequal width and four different
 * grounds, so the four do not read as a grid of identical cards.
 */
async function MentorshipFormat() {
  const [heading, items, stages] = await Promise.all([
    getHeading("mentorship", "mentorship-format"),
    getGroup<TitledView[]>("mentorship", "formatSteps"),
    getGroup<StageView[]>("mentorship", "stages"),
  ]);

  const pictures: ReactNode[] = [<CallPicture key="call" />, <ReviewPicture key="review" />, <PlanPicture key="plan" stages={stages ?? []} />, <MessagePicture key="message" />];

  return (
    <section aria-labelledby="format-title" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
      <div className="doc-shell py-[clamp(64px,8vw,112px)]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">{heading.eyebrow}</p>
            <h2 id="format-title" className="ld-display text-[clamp(38px,5.2vw,72px)] leading-[0.95] font-extrabold tracking-[-0.045em]">
              {heading.title}
            </h2>
          </div>
          {heading.lede ? <p className="max-w-[26rem] text-[17px] leading-relaxed text-[var(--ld-text-2)]">{heading.lede}</p> : null}
        </div>

        <ul className="mt-11 grid gap-[18px] md:grid-cols-[1.15fr_0.85fr]">
          {(items ?? []).map((item, index) => {
            const look = TILES[index % TILES.length];
            return (
              <li
                key={item.title}
                className={cn(
                  "overflow-hidden rounded-[26px] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-36px_rgb(var(--ld-ink-rgb)/0.45)]",
                  look.tile
                )}
              >
                {pictures[index] ? <div aria-hidden="true">{pictures[index]}</div> : null}
                <div className="px-7 pt-6 pb-[30px]">
                  <h3 className="ld-display text-[28px] font-bold tracking-[-0.02em]">{item.title}</h3>
                  <p className={cn("mt-2 text-base leading-normal", look.desc)}>{item.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export { MentorshipFormat };
