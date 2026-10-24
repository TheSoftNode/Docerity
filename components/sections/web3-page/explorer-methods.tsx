"use client";

import { useId, useState } from "react";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CapabilityView } from "@/lib/content/blocks/views";
import { methodName } from "@/components/sections/web3-page/explorer-content";

/**
 * What we build, as an explorer's "write contract" list: each capability a
 * method that opens to say what it is. A disclosure list, one open at a
 * time, the first open so the section never lands looking empty.
 */
function ExplorerMethods({ capabilities }: { capabilities: CapabilityView[] }) {
  const id = useId();
  const [open, setOpen] = useState(0);

  return (
    <ol className="flex flex-col gap-2.5">
      {capabilities.map((capability, index) => {
        const expanded = index === open;
        return (
          <li
            key={capability.title}
            className={cn(
              "overflow-hidden rounded-[18px] border transition-colors duration-300",
              expanded ? "border-[var(--ld-ink)] bg-[var(--ld-card)]" : "border-[var(--ld-line)] bg-white"
            )}
          >
            <h3>
              <button
                type="button"
                id={`${id}-m-${index}`}
                aria-expanded={expanded}
                aria-controls={`${id}-d-${index}`}
                onClick={() => setOpen(expanded ? -1 : index)}
                className="flex w-full items-center gap-3.5 px-[18px] py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)] focus-visible:ring-inset"
              >
                <span className="font-mono text-xs text-[var(--ld-text-muted)]">{index + 1}.</span>
                <span className="min-w-0 flex-1 truncate font-mono text-[clamp(13px,1.25vw,15.5px)]">
                  <span className="text-[var(--ld-deep)]">{methodName(capability.title)}</span>
                  <span className="text-[var(--ld-text-muted)]">()</span>
                  <span className="sr-only">: {capability.title}</span>
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-7 place-items-center rounded-lg transition-[transform,background-color,color] duration-300",
                    expanded ? "rotate-180 bg-[var(--ld-ink)] text-[var(--ld-paper)]" : "bg-[#eef1f8] text-[var(--ld-ink)]"
                  )}
                >
                  <ChevronDownIcon className="size-3.5" />
                </span>
              </button>
            </h3>
            <div
              id={`${id}-d-${index}`}
              role="region"
              aria-labelledby={`${id}-m-${index}`}
              className={cn(
                "grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none",
                expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden" inert={!expanded}>
                <div className="pr-[18px] pb-5 pl-[46px]">
                  <p className="ld-display text-[22px] font-bold tracking-[-0.02em]">{capability.title}</p>
                  <p className="mt-2 text-[15.5px] leading-relaxed text-[var(--ld-text-2)]">{capability.description}</p>
                  <span aria-hidden="true" className="mt-3.5 inline-flex items-center gap-2 rounded-[10px] bg-[var(--ld-ink)] px-3 py-1.5 font-mono text-xs text-[var(--ld-paper)]">
                    → Result::Ok <span className="text-[#8de3b6]">✓</span>
                  </span>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export { ExplorerMethods };
