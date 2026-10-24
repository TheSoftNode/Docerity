"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";
import type { SectionHeading } from "@/lib/content/blocks/source";
import { useExplorer } from "@/components/sections/web3-page/explorer-context";
import {
  contractEvents,
  contractFacts,
  contractId,
  formatCount,
  isWinner,
  linesOf,
  searchContracts,
  type ListedContract,
} from "@/components/sections/web3-page/explorer-content";

const TICK_MS = 2600;
type Tab = "overview" | "contract" | "events";

/**
 * The explorer's body: latest blocks confirming beside the contracts table,
 * then the open contract's page.
 *
 * The blocks are the page's motion, labelled with the listed contracts; they
 * hold still under reduced motion. The table is filtered by the search and
 * the network, and picking a row opens that contract's page below, with an
 * overview, the listing as code, and the events its listing records.
 */
function ExplorerContracts({
  heading,
  contracts,
  networks,
}: {
  heading: SectionHeading;
  contracts: ListedContract[];
  networks: string[];
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const { query, network, selected, setSelected } = useExplorer();
  const [tick, setTick] = useState(0);
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") setTick((value) => value + 1);
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const shown = searchContracts(contracts, query, network);
  const open = shown.find((contract) => contract.slug === selected) ?? shown[0] ?? contracts.find((contract) => contract.slug === selected) ?? contracts[0];
  if (!open) return null;

  const facts = contractFacts(open, networks);
  const events = contractEvents(open, networks);
  const winner = isWinner(open.badge);

  return (
    <>
      <section id="contracts" aria-labelledby="contracts-title" className="scroll-mt-24 bg-[#eef1f8] text-[var(--ld-ink)]">
        <div className="mx-auto max-w-[1240px] px-4 pb-[clamp(40px,5vw,56px)] sm:px-6 lg:px-8">
          <div className="mb-[22px] flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2.5 font-mono text-xs tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">{heading.eyebrow}</p>
              <h2 id="contracts-title" className="ld-display text-[clamp(30px,3.6vw,48px)] leading-none font-extrabold tracking-[-0.04em]">
                {heading.title}
              </h2>
            </div>
            <p aria-live="polite" className="font-mono text-[11px] tracking-[0.08em] text-[var(--ld-text-muted)] uppercase">
              {shown.length} shown{network ? ` · ${network}` : ""}
              {query ? ` · “${query}”` : ""}
            </p>
          </div>

          <div className="grid gap-[18px] lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div aria-hidden="true" className="overflow-hidden rounded-[22px] border border-[var(--ld-line)] bg-white">
              <div className="flex items-center justify-between border-b border-[var(--ld-line)] px-5 py-4">
                <span className="text-base font-bold">Latest blocks</span>
                <span className="font-mono text-[11px] text-[var(--ld-text-muted)] uppercase">{network || "All networks"}</span>
              </div>
              <ol>
                {[0, 1, 2, 3, 4].map((offset) => {
                  const pending = offset === 0;
                  const contract = contracts[(tick + offset) % contracts.length];
                  const chain = contract.tags.find((tag) => networks.includes(tag)) ?? "its network";
                  return (
                    <li
                      key={`${tick}-${offset}`}
                      className={cn("grid grid-cols-[46px_minmax(0,1fr)_auto] items-center gap-3.5 border-b border-[#eef1f8] px-5 py-3.5 last:border-b-0", pending && "ld-pop")}
                    >
                      <span
                        className={cn(
                          "grid size-[46px] place-items-center rounded-xl font-mono text-[11px]",
                          pending ? "bg-[#fff4d6] text-[#7a5600]" : "bg-[var(--ld-ink)] text-[var(--ld-paper)]"
                        )}
                      >
                        Bk
                      </span>
                      <span className="min-w-0">
                        <span className="block font-mono text-[13px] text-[var(--ld-deep)]">#{String(1042 + tick - offset).padStart(6, "0")}</span>
                        <span className="mt-0.5 block truncate text-[13px] text-[var(--ld-text-muted)]">
                          {pending ? "Collecting transactions…" : `Includes ${contract.name} on ${chain}`}
                        </span>
                      </span>
                      <span className={cn("text-right font-mono text-[11px]", pending ? "text-[#b07a00]" : "text-[#1d7a52]")}>
                        {pending ? "Pending" : "Confirmed ✓"}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="overflow-hidden rounded-[22px] border border-[var(--ld-line)] bg-white">
              <div className="flex items-center justify-between border-b border-[var(--ld-line)] px-5 py-4">
                <span className="text-base font-bold">Contracts</span>
                <span className="font-mono text-[11px] text-[var(--ld-text-muted)]">{shown.length} / {contracts.length}</span>
              </div>
              <ul>
                {shown.map((contract) => {
                  const on = contract.slug === open.slug;
                  const size = linesOf(contract.description);
                  return (
                    <li key={contract.slug} className="border-b border-[#eef1f8] last:border-b-0">
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => {
                          setSelected(contract.slug);
                          setTab("overview");
                        }}
                        className={cn(
                          "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3.5 px-5 py-4 text-left outline-none transition-colors hover:bg-[#f5f7fc] focus-visible:bg-[#f5f7fc]",
                          on && "bg-[#eef1f8]"
                        )}
                      >
                        <span className="min-w-0">
                          <span className="flex flex-wrap items-center gap-2.5">
                            <span className="text-base font-bold">{contract.name}</span>
                            <span className="rounded-full bg-[#dff5ea] px-2 py-0.5 font-mono text-[10.5px] text-[#1d7a52] uppercase">✓ Verified listing</span>
                          </span>
                          <span className="mt-1 block font-mono text-xs text-[var(--ld-text-muted)]">
                            {contractId(contract.name)} · {contract.tags.find((tag) => networks.includes(tag)) ?? "—"}
                          </span>
                        </span>
                        <span className="text-right">
                          <span className={cn("block text-[13px] font-semibold", isWinner(contract.badge) ? "text-[#b2432a]" : "text-[var(--ld-deep)]")}>
                            {isWinner(contract.badge) ? "Hackathon winner" : contract.badge}
                          </span>
                          {size ? <span className="mt-0.5 block font-mono text-[11px] text-[var(--ld-text-muted)]">{formatCount(size)}+ lines</span> : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
                {shown.length === 0 ? (
                  <li className="px-5 py-[22px] text-[14.5px] text-[var(--ld-text-muted)]">
                    Nothing matches that. Try a network (Solana), a language (Rust) or a word like DeFi.
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="contract-title" className="bg-[#eef1f8] text-[var(--ld-ink)]">
        <div className="mx-auto max-w-[1240px] px-4 pb-[clamp(64px,8vw,104px)] sm:px-6 lg:px-8">
          <article className="overflow-hidden rounded-[26px] border border-[var(--ld-line)] bg-white">
            <header key={open.slug} className="ld-pop flex flex-wrap items-center justify-between gap-4 bg-[var(--ld-ink)] px-[26px] py-[22px] text-[var(--ld-paper)]">
              <span className="min-w-0">
                <span className="block font-mono text-[11.5px] tracking-[0.1em] text-[var(--ld-tint)] uppercase">Contract · {contractId(open.name)}</span>
                <h3 id="contract-title" className="ld-display mt-2 text-[clamp(30px,3.6vw,48px)] leading-none font-extrabold tracking-[-0.045em]">
                  {open.name}
                </h3>
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-[92px] -rotate-12 place-items-center rounded-full border-[1.5px] text-center font-mono text-[9px] leading-[1.35] tracking-[0.08em] uppercase",
                  winner ? "border-[#ffb39c] text-[#ffb39c]" : "border-[var(--ld-tint)] text-[var(--ld-tint)]"
                )}
              >
                <span>
                  <span className="mb-0.5 block text-lg">{winner ? "★" : "◆"}</span>
                  {winner ? "Hackathon winner" : "Recognised"}
                </span>
              </span>
            </header>

            <div role="tablist" aria-label={`${open.name} details`} className="flex gap-1 border-b border-[var(--ld-line)] px-[18px] pt-2.5">
              {(
                [
                  ["overview", "Overview"],
                  ["contract", "Contract"],
                  ["events", "Events"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={tab === value}
                  onClick={() => setTab(value)}
                  className={cn(
                    "min-h-[42px] border-b-2 px-4 text-sm font-semibold transition-colors",
                    tab === value ? "border-[var(--ld-ink)] text-[var(--ld-ink)]" : "border-transparent text-[var(--ld-text-muted)] hover:text-[var(--ld-ink)]"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div role="tabpanel" aria-label={tab}>
              {tab === "overview" ? (
                <div className="grid lg:grid-cols-2">
                  <dl className="px-[26px] pt-2.5 pb-[22px]">
                    {facts.map((fact) => (
                      <div key={fact.label} className="grid grid-cols-[130px_minmax(0,1fr)] gap-3.5 border-b border-[#eef1f8] py-[13px] last:border-b-0 sm:grid-cols-[150px_minmax(0,1fr)]">
                        <dt className="text-sm text-[var(--ld-text-muted)]">{fact.label}</dt>
                        <dd className="text-[14.5px] font-semibold">{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="border-t border-[var(--ld-line)] px-[26px] py-[22px] lg:border-t-0 lg:border-l">
                    <p className="font-mono text-[11px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">What it does</p>
                    <p className="mt-3 text-[17px] leading-relaxed text-[var(--ld-text-2)]">{open.description}</p>
                  </div>
                </div>
              ) : null}

              {tab === "contract" ? (
                <pre className="overflow-x-auto bg-[var(--ld-panel)] px-[26px] py-6 font-mono text-[13.5px] leading-[1.8] text-[var(--ld-muted)]">
                  <span className="text-[var(--ld-muted-3)]">{`// ${open.name}, as listed. Not the source.`}</span>
                  {"\n"}
                  <span className="text-[var(--ld-tint)]">program</span> <span className="text-[var(--ld-paper)]">{contractId(open.name).replace("dcr:", "").replace(/-/g, "_")}</span>
                  {" {\n"}
                  {facts
                    .filter((fact) => fact.value !== "—" && fact.label !== "Recognition")
                    .map((fact) => (
                      <span key={fact.label}>
                        {"  "}
                        <span className="text-[var(--ld-muted-3)]">{fact.label.toLowerCase().padEnd(9)}</span> ={" "}
                        <span className="text-[#8de3b6]">&quot;{fact.value}&quot;</span>
                        {"\n"}
                      </span>
                    ))}
                  {"}"}
                </pre>
              ) : null}

              {tab === "events" ? (
                <ol className="px-[26px] pt-3 pb-[22px]">
                  {events.map((event) => (
                    <li key={event.kind + event.text} className="grid grid-cols-[22px_minmax(0,1fr)] gap-3.5 border-b border-[#eef1f8] py-3 last:border-b-0">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "mt-[5px] size-2.5 rounded-full",
                          event.kind === "Award" ? "bg-[var(--ld-accent)]" : event.kind === "Deployed" ? "bg-[#54D696]" : "bg-[var(--ld-tint)]"
                        )}
                      />
                      <span>
                        <span className="block font-mono text-xs text-[var(--ld-deep)] uppercase">{event.kind}</span>
                        <span className="mt-0.5 block text-[15px]">{event.text}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          </article>
        </div>
      </section>
    </>
  );
}

export { ExplorerContracts };
