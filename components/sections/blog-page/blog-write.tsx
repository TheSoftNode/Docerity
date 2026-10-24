import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

/**
 * The invitation to write: engineers and mentees publish here under their
 * own names. Beside it, a byline as it would appear on their piece, which is
 * most of what makes contributing worth somebody's time.
 */
function BlogWrite() {
  return (
    <section
      aria-labelledby="write-title"
      className="relative overflow-hidden bg-[linear-gradient(150deg,#13296b_0%,var(--ld-deep)_100%)] text-[var(--ld-paper)]"
    >
      <span
        aria-hidden="true"
        className="ld-spin absolute -top-[40%] -right-[8%] aspect-square w-[min(56vw,760px)] rounded-full border border-dashed border-[rgb(var(--ld-tint-rgb)/0.25)]"
      />
      <div className="doc-shell relative grid items-center gap-[clamp(32px,5vw,80px)] py-[clamp(64px,8vw,104px)] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div>
          <p className="mb-3.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-tint)] uppercase">Write for Docerity</p>
          <h2 id="write-title" className="ld-display max-w-[15ch] text-[clamp(38px,5vw,68px)] leading-[0.95] font-extrabold tracking-[-0.045em]">
            Explain something you understand.
          </h2>
          <p className="mt-5 max-w-[32rem] text-lg leading-relaxed text-[var(--ld-muted)]">
            Engineers and mentees write here too. You send a draft, we edit it with you, and it goes out under your name.
          </p>
          <Link
            href="/contribute"
            className="mt-[30px] inline-flex min-h-[50px] items-center gap-2 rounded-full bg-[var(--ld-paper)] px-6 text-[15px] font-semibold text-[var(--ld-ink)] transition-transform hover:-translate-y-0.5"
          >
            Pitch a piece
            <ArrowUpRightIcon aria-hidden="true" className="size-4" />
          </Link>
        </div>

        <div aria-hidden="true" className="rounded-3xl border border-[rgb(var(--ld-tint-rgb)/0.2)] bg-[rgb(var(--ld-ink-rgb)/0.45)] p-[26px] backdrop-blur-[8px]">
          <p className="font-mono text-[11px] tracking-[0.1em] text-[var(--ld-muted-3)] uppercase">Your byline, on your piece</p>
          <div className="mt-[18px] flex items-center gap-3.5">
            <span className="grid size-[52px] place-items-center rounded-full bg-[var(--ld-tint)] font-mono text-[15px] text-[var(--ld-ink)]">YN</span>
            <span>
              <span className="block text-lg font-bold">Your name</span>
              <span className="text-sm text-[var(--ld-muted)]">Your title · a link to your work</span>
            </span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-[rgb(var(--ld-tint-rgb)/0.12)] px-3 py-1.5 text-[13px]">
              <span className="size-1.5 rounded-full bg-[var(--ld-accent)]" />
              Docerity mentee
            </span>
            <span className="rounded-full bg-[rgb(var(--ld-tint-rgb)/0.12)] px-3 py-1.5 text-[13px]">Edited with you</span>
            <span className="rounded-full bg-[rgb(var(--ld-tint-rgb)/0.12)] px-3 py-1.5 text-[13px]">Credited in search</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export { BlogWrite };
