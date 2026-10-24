import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { pad, type BlogElement } from "@/components/sections/blog-page/blog-content";

function Tile({ element, size }: { element: BlogElement; size: "large" | "small" }) {
  const explainer = element.type === "explainer";
  return (
    <span
      aria-hidden="true"
      className={cn(
        "ld-display relative grid shrink-0 place-items-center font-extrabold tracking-[-0.04em] transition-transform duration-500 ease-[cubic-bezier(.2,.7,.2,1)]",
        size === "large"
          ? "aspect-square w-[clamp(76px,9vw,120px)] rounded-[22px] bg-[var(--ld-paper)] text-[clamp(30px,3.6vw,46px)] text-[var(--ld-ink)] group-hover:scale-105 group-hover:-rotate-[8deg]"
          : cn("size-11 rounded-xl text-[17px]", explainer ? "bg-[var(--ld-ink)] text-[var(--ld-paper)]" : "bg-[#dfe6fb] text-[var(--ld-deep)]")
      )}
    >
      {element.symbol}
      {size === "large" ? (
        <span className="absolute top-[7px] left-[9px] font-mono text-[10px] font-normal text-[var(--ld-text-muted)]">{pad(element.number)}</span>
      ) : null}
    </span>
  );
}

/**
 * What to read next: the next piece of the same kind, large, then up to three
 * related ones, those sharing a topic first.
 */
function PostNext({ next, related, relatedLabel }: { next?: BlogElement; related: BlogElement[]; relatedLabel: string }) {
  if (!next && related.length === 0) return null;

  return (
    <section aria-label="Keep reading" className="bg-[#eef1fa] text-[var(--ld-ink)]">
      <div className="doc-shell py-[clamp(56px,7vw,96px)]">
        {next ? (
          <Link
            href={`/blog/${next.slug}`}
            className="group relative grid items-center gap-[clamp(20px,3vw,40px)] overflow-hidden rounded-[30px] bg-[var(--ld-ink)] p-[clamp(24px,3.4vw,44px)] text-[var(--ld-paper)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)] sm:grid-cols-[auto_minmax(0,1fr)_auto]"
          >
            <span aria-hidden="true" className="absolute -right-15 -bottom-20 size-[260px] rounded-full border border-[rgb(var(--ld-tint-rgb)/0.18)]" />
            <Tile element={next} size="large" />
            <span className="relative min-w-0">
              <span className="block font-mono text-xs tracking-[0.1em] text-[var(--ld-tint)] uppercase">
                Next · {next.kind}
                {next.type === "explainer" ? ` · ${next.name}` : ""}
              </span>
              <span className="ld-display mt-2.5 block text-[clamp(26px,3.4vw,46px)] leading-none font-extrabold tracking-[-0.04em]">
                {next.line}
              </span>
              <span className="mt-2.5 block text-base text-[var(--ld-muted)]">{next.hook}</span>
            </span>
            <span
              aria-hidden="true"
              className="relative hidden size-[60px] place-items-center rounded-full border border-[rgb(var(--ld-paper-rgb)/0.25)] transition-[transform,background-color,color] duration-300 group-hover:translate-x-2 group-hover:bg-[var(--ld-paper)] group-hover:text-[var(--ld-ink)] sm:grid"
            >
              <ArrowRightIcon className="size-5" />
            </span>
          </Link>
        ) : null}

        {related.length > 0 ? (
          <>
            <p className="mt-[clamp(44px,5vw,64px)] mb-[18px] font-mono text-xs tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">{relatedLabel}</p>
            <ul className="grid gap-3.5 md:grid-cols-3">
              {related.map((element) => (
                <li key={element.slug}>
                  <Link
                    href={`/blog/${element.slug}`}
                    className="group flex h-full flex-col gap-[18px] rounded-[22px] border border-[var(--ld-line)] bg-[var(--ld-card)] p-[22px] outline-none transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-1 hover:shadow-[0_30px_60px_-40px_rgb(var(--ld-ink-rgb)/0.4)] focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)]"
                  >
                    <span className="flex items-center justify-between">
                      <Tile element={element} size="small" />
                      <span className="font-mono text-[11px] text-[var(--ld-text-muted)] uppercase">{element.read}</span>
                    </span>
                    <span>
                      <span className="block font-mono text-[11px] tracking-[0.08em] text-[var(--ld-deep)] uppercase">
                        {element.kind}
                        {element.type === "explainer" ? ` · ${element.name}` : ""}
                      </span>
                      <span className="ld-display mt-2 block text-[21px] leading-tight font-bold tracking-[-0.02em]">{element.line}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </section>
  );
}

export { PostNext };
