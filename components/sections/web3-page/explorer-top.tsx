"use client";

import { useEffect, useId, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { SearchIcon } from "lucide-react";

import type { SectionHeading } from "@/lib/content/blocks/source";
import { useExplorer } from "@/components/sections/web3-page/explorer-context";
import { searchContracts, type ListedContract, type Stat } from "@/components/sections/web3-page/explorer-content";
import { TitlePieces } from "@/components/sections/mentorship-page/title-pieces";

/** How often the block counter moves on, and the search hint changes. */
const TICK_MS = 2600;

/**
 * The top of the explorer: its bar (the search and the block counter) and
 * the overview, where the page's heading sits beside the figures an explorer
 * leads with. The search filters the contracts table below as somebody types.
 */
function ExplorerTop({
  heading,
  stats,
  contracts,
  hints,
}: {
  heading: SectionHeading;
  stats: Stat[];
  contracts: ListedContract[];
  hints: string[];
}) {
  const id = useId();
  const reduceMotion = useReducedMotion() ?? false;
  const { query, setQuery, network } = useExplorer();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") setTick((value) => value + 1);
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const hits = searchContracts(contracts, query, network).length;

  return (
    <section className="relative -mt-[76px] bg-[#eef1f8] pt-[104px] text-[var(--ld-ink)]">
      <div className="bg-[var(--ld-ink)] text-[var(--ld-paper)]">
        <div className="mx-auto grid max-w-[1240px] items-center gap-[18px] px-4 py-4 sm:px-6 md:grid-cols-[auto_minmax(0,1fr)_auto] lg:px-8">
          <span className="inline-flex items-center gap-2.5 font-mono text-[13px] tracking-[0.04em]">
            <span aria-hidden="true" className="grid size-[30px] place-items-center rounded-[9px] bg-[var(--ld-deep)] text-sm">
              ⛓
            </span>
            docerity<span className="text-[var(--ld-muted-3)]">/explorer</span>
          </span>
          <div className="flex h-12 items-center gap-2.5 rounded-[14px] border border-[rgb(var(--ld-tint-rgb)/0.22)] bg-[rgb(var(--ld-paper-rgb)/0.07)] pr-2 pl-4 focus-within:border-[rgb(var(--ld-tint-rgb)/0.6)]">
            <SearchIcon aria-hidden="true" className="size-4 text-[var(--ld-muted-3)]" />
            <label htmlFor={`${id}-search`} className="sr-only">
              Search the contracts
            </label>
            <input
              id={`${id}-search`}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") document.getElementById("contracts")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
              }}
              placeholder={hints[tick % hints.length]}
              autoComplete="off"
              className="h-[46px] min-w-0 flex-1 bg-transparent text-[15px] text-[var(--ld-paper)] outline-none placeholder:text-[var(--ld-muted-3)]"
            />
            <span aria-live="polite" className="rounded-[7px] border border-[rgb(var(--ld-tint-rgb)/0.25)] px-2 py-1 font-mono text-[11px] text-[var(--ld-muted-3)]">
              {hits} / {contracts.length}
              <span className="sr-only"> contracts match</span>
            </span>
          </div>
          <span aria-hidden="true" className="hidden items-center gap-2 rounded-xl bg-[rgb(84_214_150/0.12)] px-3 py-2 font-mono text-xs text-[#8de3b6] md:inline-flex">
            <span className="ld-live size-[7px] rounded-full bg-[#54D696]" />
            BLOCK #{String(1042 + tick).padStart(6, "0")}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-4 pt-[clamp(36px,5vw,64px)] pb-[clamp(40px,5vw,64px)] sm:px-6 lg:px-8">
        <p className="ld-up mb-[18px] flex flex-wrap items-center gap-2.5 font-mono text-xs tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">
          <span className="rounded-full bg-[#dfe6fb] px-2.5 py-1 text-[var(--ld-deep)]">Overview</span>
          {heading.eyebrow}
        </p>
        <div className="grid items-end gap-[clamp(28px,4vw,64px)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div>
            <h1 className="ld-display ld-up ld-delay-1 text-[clamp(42px,5.6vw,88px)] leading-[0.9] font-extrabold tracking-[-0.055em] text-balance [&_.ld-sheen]:bg-none [&_.ld-sheen]:text-[var(--ld-ink)]">
              <TitlePieces title={heading.title} />
            </h1>
            {heading.lede ? (
              <p className="ld-up ld-delay-2 mt-[22px] max-w-[36rem] text-[clamp(16px,1.3vw,18px)] leading-relaxed text-[var(--ld-text-2)]">{heading.lede}</p>
            ) : null}
          </div>
          <dl className="ld-up ld-delay-2 grid grid-cols-2 gap-px overflow-hidden rounded-[20px] border border-[var(--ld-line)] bg-[var(--ld-line)]">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white px-5 py-[18px]">
                <dt className="font-mono text-[10.5px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">{stat.label}</dt>
                <dd className="ld-display mt-2 text-[clamp(26px,2.6vw,36px)] leading-none font-extrabold tracking-[-0.04em]">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

export { ExplorerTop };
