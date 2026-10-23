import { SubscribeForm } from "@/components/sections/blog-page/subscribe-form";

/**
 * The blog's ending: the list, then into the footer.
 *
 * Set on the footer's own ink with one light source at the top, closing on
 * the same drawn seam as the mentorship and contact pages, so the section and
 * the footer read as one ending.
 */
function BlogSubscribe() {
  return (
    <section aria-labelledby="subscribe-title" className="relative overflow-hidden bg-[var(--ld-ink)] text-[var(--ld-paper)]">
      <span
        aria-hidden="true"
        className="absolute -top-[20%] left-1/2 aspect-[2.2/1] w-[min(110vw,1500px)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgb(64_110_230/0.34),transparent_62%)]"
      />
      <div className="doc-shell relative pt-[clamp(80px,10vw,136px)]">
        <div className="grid items-end gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-[18px] font-mono text-[13px] tracking-[0.1em] text-[var(--ld-tint)] uppercase">The list</p>
            <h2 id="subscribe-title" className="ld-display text-[clamp(42px,6.4vw,96px)] leading-[0.9] font-extrabold tracking-[-0.055em]">
              One explainer, now and <span className="ld-sheen">then</span>
              <span className="text-[var(--ld-accent)]">.</span>
            </h2>
          </div>
          <div>
            <p className="mb-[18px] max-w-[28rem] text-[17px] leading-relaxed text-[var(--ld-muted)]">
              When a new piece goes out, it comes to you. Nothing else, and one click to leave.
            </p>
            <SubscribeForm />
            <p className="mt-3.5 text-[13.5px] text-[var(--ld-muted-3)]">
              Or follow along by{" "}
              <a href="/blog/rss.xml" className="border-b border-[rgb(var(--ld-tint-rgb)/0.5)] text-[var(--ld-paper)]">
                RSS
              </a>
              .
            </p>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="relative mt-[clamp(80px,10vw,120px)] h-px bg-[linear-gradient(90deg,transparent,rgb(var(--ld-tint-rgb)/0.28)_50%,transparent)]"
        >
          <span className="absolute top-1/2 left-1/2 size-[7px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[var(--ld-accent)] shadow-[0_0_0_6px_var(--ld-ink)]" />
        </div>
      </div>
    </section>
  );
}

export { BlogSubscribe };
