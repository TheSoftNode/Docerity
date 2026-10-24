"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils";
import { EXAMPLES, TIERS, formatCost, formatWeight, route } from "@/components/sections/ai-page/ai-router";

/**
 * The router, for the visitor: type a request, or tap an example, and see
 * what it noticed, where the request goes and what that costs against
 * sending everything to the top model.
 *
 * Routing runs on every keystroke in the browser; there is nothing to submit
 * and nothing leaves the page, which the label says. The decision is a live
 * region, so a screen reader hears where each request went.
 */
function RouterConsole() {
  const id = useId();
  const [request, setRequest] = useState<string>(EXAMPLES[0]);
  const result = route(request);
  const tier = TIERS[result.tier];
  const saving = Math.round(result.saving * 100);

  return (
    <div className="ld-up ld-delay-3 mt-[clamp(32px,4vw,52px)] overflow-hidden rounded-[30px] border border-[rgb(var(--ld-tint-rgb)/0.22)] bg-[rgb(10_20_56/0.75)] shadow-[0_70px_140px_-60px_rgb(0_0_0/0.8)] backdrop-blur-[10px]">
      <div className="border-b border-[rgb(var(--ld-tint-rgb)/0.12)] px-[clamp(18px,2.4vw,30px)] pt-[clamp(18px,2.4vw,30px)] pb-[18px]">
        <label htmlFor={`${id}-ask`} className="flex flex-wrap items-center gap-x-2.5 font-mono text-[11.5px] tracking-[0.1em] text-[var(--ld-muted-3)] uppercase">
          Your request
          <span className="tracking-normal text-[rgb(125_142_192/0.7)] normal-case">· an illustration in your browser; nothing is sent anywhere</span>
        </label>
        <div className="mt-3 flex items-center gap-3 rounded-[20px] border-[1.5px] border-[rgb(var(--ld-tint-rgb)/0.3)] bg-[rgb(var(--ld-ink-rgb)/0.7)] py-2 pr-2 pl-5 focus-within:border-[rgb(var(--ld-tint-rgb)/0.7)]">
          <input
            id={`${id}-ask`}
            value={request}
            onChange={(event) => setRequest(event.target.value)}
            placeholder="Ask it to do something…"
            autoComplete="off"
            maxLength={240}
            className="h-[52px] min-w-0 flex-1 bg-transparent text-[clamp(17px,1.6vw,21px)] text-[var(--ld-paper)] outline-none placeholder:text-[var(--ld-muted-3)]"
          />
          {request ? (
            <button
              type="button"
              onClick={() => setRequest("")}
              className="min-h-11 shrink-0 rounded-[14px] px-4 text-sm font-semibold text-[var(--ld-muted)] transition-colors hover:text-[var(--ld-paper)]"
            >
              Clear
            </button>
          ) : null}
        </div>
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-[11px] tracking-[0.08em] text-[var(--ld-muted-3)] uppercase">Or try</span>
          {EXAMPLES.map((example) => {
            const on = example === request;
            return (
              <button
                key={example}
                type="button"
                aria-pressed={on}
                onClick={() => setRequest(example)}
                className={cn(
                  "min-h-[34px] rounded-full border px-3.5 text-[13.5px] transition-colors",
                  on
                    ? "border-[var(--ld-paper)] bg-[var(--ld-paper)] text-[var(--ld-ink)]"
                    : "border-[rgb(var(--ld-tint-rgb)/0.28)] text-[var(--ld-muted)] hover:border-[var(--ld-tint)] hover:text-[var(--ld-paper)]"
                )}
              >
                {example}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,0.9fr)]">
        <div className="border-b border-[rgb(var(--ld-tint-rgb)/0.12)] px-[clamp(18px,2.4vw,30px)] py-6 lg:border-r lg:border-b-0">
          <p className="mb-3.5 font-mono text-[11px] tracking-[0.1em] text-[var(--ld-muted-3)] uppercase">01 · What it noticed</p>
          <ul className="flex flex-col gap-2">
            {(result.signals.length > 0
              ? result.signals
              : [{ label: request.trim() ? "Nothing demanding spotted" : "Waiting for a request", weight: 0 }]
            ).map((signal) => (
              <li
                key={signal.label}
                className="ld-pop flex items-center gap-2.5 rounded-xl border border-[rgb(var(--ld-tint-rgb)/0.14)] bg-[rgb(var(--ld-tint-rgb)/0.07)] px-3 py-2.5 text-sm"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-[7px] shrink-0 rounded-full",
                    signal.weight >= 2 ? "bg-[var(--ld-accent)]" : signal.weight < 0 ? "bg-[#8de3b6]" : signal.weight > 0 ? "bg-[var(--ld-tint)]" : "bg-[rgb(var(--ld-tint-rgb)/0.5)]"
                  )}
                />
                <span className="flex-1">{signal.label}</span>
                <span className="font-mono text-[11px] text-[var(--ld-muted-3)]">{formatWeight(signal.weight)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div aria-live="polite" className="border-b border-[rgb(var(--ld-tint-rgb)/0.12)] px-[clamp(18px,2.4vw,30px)] py-6 lg:border-r lg:border-b-0">
          <p className="mb-3.5 font-mono text-[11px] tracking-[0.1em] text-[var(--ld-muted-3)] uppercase">02 · Where it goes</p>
          <div key={tier.id} className="ld-pop">
            <span className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--ld-tint-rgb)/0.12)] px-3 py-1 font-mono text-[11px] tracking-[0.08em] text-[var(--ld-tint)] uppercase">
              Tier {result.tier + 1} · {tier.label}
            </span>
            <p className="ld-display mt-3.5 text-[clamp(36px,4vw,56px)] leading-[0.95] font-extrabold tracking-[-0.045em]">{tier.model}</p>
            <p className="mt-3 text-[15.5px] leading-normal text-[var(--ld-muted)]">{tier.why}</p>
          </div>
        </div>

        <div className="px-[clamp(18px,2.4vw,30px)] py-6">
          <p className="mb-3.5 font-mono text-[11px] tracking-[0.1em] text-[var(--ld-muted-3)] uppercase">03 · What it costs</p>
          <div className="flex flex-col gap-3.5">
            <div>
              <span className="flex justify-between text-[13px] text-[var(--ld-muted)]">
                Routed <span className="font-mono">{formatCost(tier.cost)}</span>
              </span>
              <span aria-hidden="true" className="mt-1.5 block h-2 overflow-hidden rounded-full bg-[rgb(var(--ld-tint-rgb)/0.12)]">
                <span
                  className="block h-full rounded-full bg-[linear-gradient(90deg,var(--ld-tint),var(--ld-paper))] transition-[width] duration-700 ease-[cubic-bezier(.2,.7,.2,1)]"
                  style={{ width: `${Math.max(1.5, tier.cost * 100)}%` }}
                />
              </span>
            </div>
            <div>
              <span className="flex justify-between text-[13px] text-[var(--ld-muted)]">
                Everything to the top model <span className="font-mono">1.00×</span>
              </span>
              <span aria-hidden="true" className="mt-1.5 block h-2 rounded-full bg-[rgb(var(--ld-tint-rgb)/0.35)]" />
            </div>
            <p className="ld-display mt-1 text-[34px] font-extrabold tracking-[-0.04em]">
              {saving === 0 ? "Full price" : `−${saving}%`}
              <span className="text-base font-semibold tracking-normal text-[var(--ld-muted-3)]"> on this one</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 border-t border-[rgb(var(--ld-tint-rgb)/0.12)] bg-[rgb(var(--ld-ink-rgb)/0.45)] px-[clamp(18px,2.4vw,30px)] py-4">
        <span className="mr-1.5 font-mono text-[11px] tracking-[0.08em] text-[var(--ld-muted-3)] uppercase">Tiers</span>
        {TIERS.map((candidate, index) => (
          <span key={candidate.id} className="inline-flex items-center gap-2.5">
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[13.5px] font-semibold transition-colors duration-300",
                index === result.tier
                  ? "border-[var(--ld-paper)] bg-[var(--ld-paper)] text-[var(--ld-ink)]"
                  : "border-[rgb(var(--ld-tint-rgb)/0.2)] bg-[rgb(var(--ld-tint-rgb)/0.06)] text-[var(--ld-muted)]"
              )}
            >
              <span className="font-mono text-[10.5px] opacity-70">T{index + 1}</span>
              {candidate.model}
            </span>
            {index < TIERS.length - 1 ? (
              <span aria-hidden="true" className="text-[13px] text-[rgb(var(--ld-tint-rgb)/0.4)]">
                →
              </span>
            ) : null}
          </span>
        ))}
        <span className="ml-auto font-mono text-[11px] text-[var(--ld-muted-3)] uppercase">If a provider fails, the next tier takes it</span>
      </div>
    </div>
  );
}

export { RouterConsole };
