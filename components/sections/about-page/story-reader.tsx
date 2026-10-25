"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { codeRuns, storyOpening, type StoryBlock } from "@/components/sections/about-page/about-content";

function Text({ text }: { text: string }) {
  return (
    <>
      {codeRuns(text).map((run, index) =>
        run.code ? (
          <code key={index} className="rounded-md bg-[#eef1f8] px-1.5 py-0.5 font-mono text-[0.86em] text-[var(--ld-deep)]">
            {run.text}
          </code>
        ) : (
          run.text
        )
      )}
    </>
  );
}

export type StoryByline = { name: string; role: string; portrait: string };

/** Who wrote it, under the title: the photo, the name, the role and how long it takes to read. */
function Byline({ byline, minutes }: { byline: StoryByline; minutes: number }) {
  return (
    <p className="mb-[26px] flex items-center gap-3 border-b border-[#eef1f8] pb-[22px]">
      {byline.portrait ? (
        <Image
          src={byline.portrait}
          alt=""
          width={34}
          height={34}
          className="size-[34px] shrink-0 rounded-full object-cover shadow-[0_0_0_2px_#fff,0_0_0_3px_var(--ld-line)]"
        />
      ) : null}
      <span className="flex min-w-0 flex-col leading-[1.3]">
        <span className="text-[14.5px] font-semibold text-[var(--ld-ink)]">{byline.name}</span>
        <span className="mt-0.5 font-mono text-[11.5px] tracking-[0.04em] text-[var(--ld-text-muted)] uppercase">
          {[byline.role, `${minutes} min read`].filter(Boolean).join(" · ")}
        </span>
      </span>
    </p>
  );
}

/**
 * The story inside the README: its opening paragraphs, fading out, and a
 * button that opens the rest in place. Opened, the whole story reads on in
 * the same pane, ending on the cursor, with a way back to the top of it.
 * A story no longer than the opening is shown whole, with no button. The
 * byline is the one place the founder's photo appears.
 */
function StoryReader({ title, blocks, minutes, byline }: { title: string; blocks: StoryBlock[]; minutes: number; byline?: StoryByline }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const top = useRef<HTMLDivElement>(null);
  const opening = storyOpening(blocks);
  const more = blocks.length > opening.length;
  const shown = open || !more ? blocks : opening;

  const close = () => {
    setOpen(false);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={top} className="scroll-mt-28">
      {title ? (
        <h3 className="mb-[18px] font-mono text-sm font-normal text-[var(--ld-deep)]">
          <span aria-hidden="true"># </span>
          {title}
        </h3>
      ) : null}
      {byline?.name ? <Byline byline={byline} minutes={minutes} /> : null}
      <div id={`${id}-story`} className="relative">
        {shown.map((block, index) => {
          const last = index === shown.length - 1 && (open || !more);
          return block.kind === "heading" ? (
            <h4 key={index} className="ld-display mt-4 mb-4 text-[clamp(22px,1.9vw,26px)] font-bold tracking-[-0.02em]">
              {block.text}
            </h4>
          ) : (
            <p key={index} className="pb-[22px] text-[clamp(16.5px,1.35vw,19px)] leading-[1.72] text-[var(--ld-text-2)] last:pb-0">
              <Text text={block.text} />
              {last ? <span aria-hidden="true" className="ld-blink ml-1 inline-block h-[1.1em] w-[9px] translate-y-[3px] bg-[var(--ld-accent)]" /> : null}
            </p>
          );
        })}
        {/* The opening fades into the button, so it reads as the start of something longer. */}
        {more && !open ? <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-white/0 to-white" /> : null}
      </div>

      {more ? (
        <div className={cn("flex flex-wrap items-center gap-x-5 gap-y-2", open ? "mt-9 border-t border-[var(--ld-line)] pt-6" : "mt-3")}>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={`${id}-story`}
            onClick={() => (open ? close() : setOpen(true))}
            className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-[var(--ld-ink)] pr-2.5 pl-[22px] text-[15px] font-semibold text-[var(--ld-paper)] outline-none transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)] focus-visible:ring-offset-2"
          >
            {open ? "Back to the top" : "Read the full story"}
            <span className="grid size-[30px] place-items-center rounded-full bg-[var(--ld-paper)] text-[var(--ld-ink)]">
              {open ? <ArrowUpIcon aria-hidden="true" className="size-3.5" /> : <ArrowDownIcon aria-hidden="true" className="size-3.5" />}
            </span>
          </button>
          {open || byline?.name ? null : <span className="font-mono text-xs text-[var(--ld-text-muted)] uppercase">{minutes} min read</span>}
        </div>
      ) : null}
    </div>
  );
}

export { StoryReader };
