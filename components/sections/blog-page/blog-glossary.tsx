"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { tagCounts, type BlogElement } from "@/components/sections/blog-page/blog-content";

type Kind = "all" | "explainer" | "article";

const KINDS: { value: Kind; label: string }[] = [
  { value: "all", label: "All" },
  { value: "explainer", label: "Explainers" },
  { value: "article", label: "Articles" },
];

/**
 * Every piece as an index row, newest first, narrowed by kind and by topic.
 *
 * The hero is for looking; this is for finding. A row is its element,
 * the term, "≈" and the everyday comparison (or the article's title), and its
 * read time and date; hovering one reveals its hook. Both filters are toggle
 * buttons, and the count of what is shown is announced.
 */
function BlogGlossary({ elements }: { elements: BlogElement[] }) {
  const [kind, setKind] = useState<Kind>("all");
  const [tag, setTag] = useState("");

  const tags = useMemo(() => tagCounts(elements), [elements]);
  const shown = useMemo(
    () =>
      [...elements]
        .reverse()
        .filter((element) => (kind === "all" || element.type === kind) && (!tag || element.tags.includes(tag))),
    [elements, kind, tag]
  );
  const count = (value: Kind) => (value === "all" ? elements.length : elements.filter((element) => element.type === value).length);

  return (
    <section id="glossary" aria-labelledby="glossary-title" className="scroll-mt-24 bg-[var(--ld-paper)] text-[var(--ld-ink)]">
      <div className="doc-shell py-[clamp(64px,8vw,112px)]">
        <div className="flex flex-wrap items-end justify-between gap-[22px]">
          <div>
            <p className="mb-3.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">Everything</p>
            <h2 id="glossary-title" className="ld-display text-[clamp(38px,5.2vw,72px)] leading-[0.95] font-extrabold tracking-[-0.045em]">
              The glossary<span className="text-[var(--ld-accent)]">.</span>
            </h2>
          </div>
          <div role="group" aria-label="Show" className="inline-flex rounded-full bg-[#e3e8f4] p-1">
            {KINDS.filter((option) => count(option.value) > 0).map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={kind === option.value}
                onClick={() => setKind(option.value)}
                className={cn(
                  "min-h-10 rounded-full px-4 text-sm font-semibold transition-colors",
                  kind === option.value ? "bg-[var(--ld-ink)] text-[var(--ld-paper)]" : "text-[var(--ld-text-2)] hover:text-[var(--ld-ink)]"
                )}
              >
                {option.label}
                <span aria-hidden="true" className="ml-1.5 font-mono text-[11px] opacity-65">
                  {count(option.value)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {tags.length > 1 ? (
          <div role="group" aria-label="Topics" className="mt-[26px] flex flex-wrap gap-2">
            {[{ tag: "", count: elements.length }, ...tags].map((option) => {
              const on = option.tag === tag;
              return (
                <button
                  key={option.tag || "every"}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setTag(option.tag)}
                  className={cn(
                    "min-h-9 rounded-full border px-3.5 text-[13.5px] font-medium transition-colors",
                    on
                      ? "border-[var(--ld-deep)] bg-[var(--ld-deep)] text-[var(--ld-paper)]"
                      : "border-[var(--ld-line-2)] text-[var(--ld-text-2)] hover:border-[var(--ld-ink)] hover:text-[var(--ld-ink)]"
                  )}
                >
                  {option.tag || "Every topic"}
                </button>
              );
            })}
          </div>
        ) : null}

        <p aria-live="polite" className="sr-only">
          {shown.length} {shown.length === 1 ? "piece" : "pieces"} shown
        </p>

        <ol className="mt-[30px] border-t-2 border-[var(--ld-ink)]">
          {shown.map((element) => {
            const explainer = element.type === "explainer";
            return (
              <li key={element.slug} className="ld-zoom border-b border-[var(--ld-line)]">
                <Link
                  href={`/blog/${element.slug}`}
                  className="group grid grid-cols-[52px_minmax(0,1fr)_36px] items-center gap-5 px-2.5 py-6 outline-none transition-colors hover:bg-[#eef1fa] focus-visible:bg-[#eef1fa] md:grid-cols-[56px_minmax(0,0.8fr)_minmax(0,1.2fr)_150px_36px]"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "ld-display relative grid size-[52px] place-items-center rounded-xl text-[19px] font-extrabold tracking-[-0.03em] transition-transform duration-300 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-105 group-hover:-rotate-6",
                      explainer ? "bg-[var(--ld-ink)] text-[var(--ld-paper)]" : "bg-[#dfe6fb] text-[var(--ld-deep)]"
                    )}
                  >
                    {element.symbol}
                  </span>
                  {/* An article has no analogy, so its title takes that column too. */}
                  <span className={cn("min-w-0", !explainer && "md:col-span-2")}>
                    <span className={cn("block font-mono text-[11px] tracking-[0.08em] uppercase", explainer ? "text-[var(--ld-deep)]" : "text-[var(--ld-text-muted)]")}>
                      {element.kind}
                    </span>
                    <span className="ld-display mt-1.5 block text-[clamp(22px,2.2vw,30px)] leading-[1.05] font-extrabold tracking-[-0.03em]">
                      {element.name}
                    </span>
                    {explainer ? null : (
                      <span className="hidden max-h-0 overflow-hidden text-[15px] leading-normal text-[var(--ld-text-muted)] opacity-0 transition-[max-height,opacity,margin] duration-500 group-hover:mt-1.5 group-hover:max-h-20 group-hover:opacity-100 group-focus-visible:mt-1.5 group-focus-visible:max-h-20 group-focus-visible:opacity-100 md:block">
                        {element.hook}
                      </span>
                    )}
                  </span>
                  <span className={cn("hidden min-w-0", explainer && "md:block")}>
                    <span className="ld-display block text-[clamp(18px,1.7vw,22px)] leading-tight font-semibold tracking-[-0.015em] text-[var(--ld-text-2)]">
                      ≈ {element.line}
                    </span>
                    <span className="block max-h-0 overflow-hidden text-[15px] leading-normal text-[var(--ld-text-muted)] opacity-0 transition-[max-height,opacity,margin] duration-500 group-hover:mt-1.5 group-hover:max-h-20 group-hover:opacity-100 group-focus-visible:mt-1.5 group-focus-visible:max-h-20 group-focus-visible:opacity-100">
                      {element.hook}
                    </span>
                  </span>
                  <span className="hidden text-right font-mono text-[11.5px] leading-relaxed text-[var(--ld-text-muted)] uppercase md:block">
                    {element.read} read
                    <br />
                    {element.date}
                  </span>
                  <span
                    aria-hidden="true"
                    className="grid size-9 place-items-center rounded-full border border-[var(--ld-line-2)] transition-[transform,background-color,color,border-color] duration-300 group-hover:translate-x-1 group-hover:border-[var(--ld-ink)] group-hover:bg-[var(--ld-ink)] group-hover:text-[var(--ld-paper)]"
                  >
                    <ArrowRightIcon className="size-4" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export { BlogGlossary };
