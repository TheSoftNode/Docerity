import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { pad, symbolFor, titleParts, type BlogElement } from "@/components/sections/blog-page/blog-content";

/**
 * The latest piece, set large: its element beside the everyday thing it is
 * compared to (for an explainer), bridged by two moving dotted lines, then
 * the title, the hook and a way in. The whole card is one link.
 */
function BlogLatest({ element }: { element: BlogElement | undefined }) {
  if (!element) return null;

  const explainer = element.type === "explainer";
  const title = titleParts(element.line);

  return (
    <section aria-labelledby="latest-title" className="bg-[#e9edf8] text-[var(--ld-ink)]">
      <div className="doc-shell py-[clamp(64px,8vw,112px)]">
        <p className="mb-[22px] flex items-center gap-2.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">
          <span aria-hidden="true" className="size-[7px] rounded-[2px] bg-[var(--ld-accent)]" />
          Latest · {element.date}
        </p>
        <Link
          href={`/blog/${element.slug}`}
          className="group grid items-center gap-[clamp(28px,4vw,64px)] rounded-[32px] border border-[var(--ld-line)] bg-[var(--ld-card)] p-[clamp(20px,2.6vw,32px)] outline-none transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-1 hover:shadow-[0_40px_80px_-48px_rgb(var(--ld-ink-rgb)/0.45)] focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
        >
          <div aria-hidden="true" className="relative aspect-[5/4] overflow-hidden rounded-3xl bg-[linear-gradient(160deg,#0b1844,var(--ld-deep))]">
            <ElementTile
              className="left-[12%] border border-[rgb(var(--ld-tint-rgb)/0.3)] bg-[var(--ld-ink)] text-[var(--ld-paper)]"
              corner={pad(element.number)}
              symbol={element.symbol}
              label={explainer ? "Concept" : element.kind}
            />
            {explainer ? (
              <>
                <ElementTile
                  className="right-[12%] bg-[var(--ld-paper)] text-[var(--ld-deep)]"
                  corner="≈"
                  symbol={symbolFor(element.line)}
                  label="Everyday"
                />
                <svg viewBox="0 0 100 80" preserveAspectRatio="none" className="absolute inset-0 size-full">
                  <path className="ld-flow" d="M42 40 C 50 26, 50 26, 58 40" fill="none" stroke="rgb(175 196 255 / 0.7)" strokeWidth="0.5" strokeDasharray="1.2 1.6" />
                  <path className="ld-flow" d="M42 40 C 50 54, 50 54, 58 40" fill="none" stroke="rgb(255 122 89 / 0.8)" strokeWidth="0.5" strokeDasharray="1.2 1.6" />
                </svg>
                <span className="absolute bottom-[10%] left-[12%] max-w-[34%] truncate font-mono text-[11px] tracking-[0.08em] text-[var(--ld-muted)] uppercase">
                  {element.name}
                </span>
                <span className="absolute right-[12%] bottom-[10%] max-w-[34%] truncate text-right font-mono text-[11px] tracking-[0.08em] text-[var(--ld-muted)] uppercase">
                  {element.line}
                </span>
              </>
            ) : null}
          </div>
          <div>
            <p className="font-mono text-xs tracking-[0.1em] text-[var(--ld-deep)] uppercase">
              {element.kind}
              {explainer ? ` · ${element.name}` : ""}
            </p>
            <h2 id="latest-title" className="ld-display mt-4 text-[clamp(34px,4.4vw,64px)] leading-[0.95] font-extrabold tracking-[-0.045em] text-balance">
              {title.text}
              {title.stop}
            </h2>
            <p className="mt-5 max-w-[34rem] text-lg leading-relaxed text-[var(--ld-text-2)]">{element.hook}</p>
            <div className="mt-7 flex flex-wrap items-center gap-x-[22px] gap-y-3.5">
              <span className="inline-flex min-h-12 items-center gap-2.5 rounded-full bg-[var(--ld-ink)] pr-2.5 pl-[22px] text-[15px] font-semibold text-[var(--ld-paper)]">
                Read it
                <span className="grid size-[30px] place-items-center rounded-full bg-[var(--ld-paper)] text-[var(--ld-ink)] transition-transform group-hover:translate-x-1">
                  <ArrowRightIcon aria-hidden="true" className="size-3.5" />
                </span>
              </span>
              <span className="font-mono text-xs text-[var(--ld-text-muted)] uppercase">
                {element.read} read · {element.tags.join(" · ")}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

function ElementTile({ className, corner, symbol, label }: { className: string; corner: string; symbol: string; label: string }) {
  return (
    <div className={`absolute top-1/2 aspect-square w-[30%] -translate-y-1/2 rounded-[22px] ${className}`}>
      <span className="absolute top-[10%] left-[12%] font-mono text-[clamp(9px,0.9vw,12px)] opacity-60">{corner}</span>
      <span className="ld-display absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[54%] text-[clamp(34px,4.6vw,64px)] font-extrabold tracking-[-0.04em]">
        {symbol}
      </span>
      <span className="absolute inset-x-0 bottom-[11%] truncate px-2 text-center font-mono text-[clamp(8px,0.8vw,10.5px)] tracking-[0.06em] uppercase opacity-70">
        {label}
      </span>
    </div>
  );
}

export { BlogLatest };
