"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils";
import type { FaqView } from "@/lib/content/blocks/views";
import { pad } from "@/components/sections/mentorship-page/mentorship-content";

/**
 * The questions as a disclosure list, one open at a time: each question is a
 * button that says whether its answer is expanded, and the answer opens by
 * growing its grid row, so it animates to its real height without measuring.
 * The first is open, so the section never lands looking empty.
 */
function FaqList({ faqs }: { faqs: FaqView[] }) {
  const id = useId();
  const [open, setOpen] = useState(0);

  return (
    <div className="border-t-2 border-[var(--ld-ink)]">
      {faqs.map((faq, index) => {
        const expanded = index === open;
        return (
          <div key={faq.question} className="border-b border-[var(--ld-line)]">
            <h3>
              <button
                type="button"
                id={`${id}-q-${index}`}
                aria-expanded={expanded}
                aria-controls={`${id}-a-${index}`}
                onClick={() => setOpen(expanded ? -1 : index)}
                className="flex w-full items-center gap-[18px] py-6 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)]"
              >
                <span
                  aria-hidden="true"
                  className={cn("font-mono text-xs", expanded ? "text-[#c9502f]" : "text-[var(--ld-text-muted)]")}
                >
                  {pad(index + 1)}
                </span>
                <span className="ld-display flex-1 text-[clamp(20px,1.9vw,26px)] font-bold tracking-[-0.02em]">{faq.question}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative size-10 shrink-0 rounded-full transition-colors duration-300",
                    expanded ? "bg-[var(--ld-ink)]" : "bg-[#dfe4f2]"
                  )}
                >
                  <span className={cn("absolute inset-x-[13px] top-[19px] h-0.5", expanded ? "bg-[var(--ld-paper)]" : "bg-[var(--ld-ink)]")} />
                  <span
                    className={cn(
                      "absolute inset-y-[13px] left-[19px] w-0.5 transition-transform duration-300",
                      expanded ? "scale-y-0 bg-[var(--ld-paper)]" : "bg-[var(--ld-ink)]"
                    )}
                  />
                </span>
              </button>
            </h3>
            <div
              id={`${id}-a-${index}`}
              role="region"
              aria-labelledby={`${id}-q-${index}`}
              className={cn(
                "grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] motion-reduce:transition-none",
                expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden" inert={!expanded}>
                <p className="pr-[58px] pb-[26px] pl-[34px] text-[17px] leading-relaxed text-[var(--ld-text-2)]">{faq.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { FaqList };
