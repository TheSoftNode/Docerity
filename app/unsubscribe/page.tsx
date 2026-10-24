import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { database } from "@/lib/config/env";
import { createLogger } from "@/lib/core/logger";
import { unsubscribeByToken } from "@/lib/repositories/subscriber.repository";
import { getGroup } from "@/lib/content/blocks/source";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

/* Reads a token from the query string and writes to the database, so it can be
   neither prerendered nor cached. */
export const dynamic = "force-dynamic";

const logger = createLogger("unsubscribe");

/**
 * One-click unsubscribe.
 *
 * The token is unguessable and identifies the row on its own, so this needs no
 * login and reveals nothing about anybody else. CAN-SPAM and GDPR both expect an
 * exit that does not require an account, and the `unsubscribeToken` field has
 * existed on the model since it was written with nothing reading it.
 *
 * Done in the page rather than a route handler because the outcome is something
 * a person reads. A GET that mutates is not ideal, but a mail client cannot POST
 * from a link, and the alternative is a page with a button that half of people
 * never press.
 */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  /* The words are edited in the admin (Small pages). */
  const copy = await getGroup<{
    doneTitle: string;
    doneBody: string;
    failedTitle: string;
    failedBody: string;
    blogLabel: string;
    contactLabel: string;
    listName: string;
    listTagline: string;
  }>("pages", "unsubscribe");

  let removed = false;

  if (token && database.isConfigured) {
    try {
      removed = await unsubscribeByToken(token);
      logger.info("unsubscribe processed", { matched: removed });
    } catch (error) {
      logger.error("unsubscribe failed", error);
    }
  }

  /* What happened, as the list card shows it. The failure is deliberately
     vague: "that address is not on the list" would tell anyone who tried the
     URL whether a given address is subscribed. */
  const rows = removed
    ? [
        { mark: "✓", text: "Taken off the list", when: "just now", tone: "text-[#2f9e6b]", struck: false },
        { mark: "✕", text: "The next explainer", when: "not coming", tone: "text-[var(--ld-muted-3)]", struck: true },
        { mark: "↺", text: "Subscribe again from any post", when: "any time", tone: "text-[var(--ld-deep)]", struck: false },
      ]
    : [
        { mark: "?", text: "This link did not match anyone", when: "no change", tone: "text-[#c2492b]", struck: false },
        { mark: "✉", text: "Email us and a person removes you", when: "same day", tone: "text-[var(--ld-deep)]", struck: false },
      ];

  return (
    <div className="flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative -mt-[76px] bg-[var(--ld-paper)] pt-[128px] pb-[clamp(64px,8vw,112px)] text-[var(--ld-ink)]">
          <div className="doc-shell">
            <div className="grid items-center gap-[clamp(28px,4vw,64px)] rounded-[32px] bg-[var(--ld-ink)] p-[clamp(24px,4vw,56px)] text-[var(--ld-paper)] lg:grid-cols-2">
              <div>
                <p className="mb-4 font-mono text-xs tracking-[0.1em] text-[var(--ld-tint)] uppercase">Unsubscribe</p>
                <h1 className="ld-display max-w-[12ch] text-[clamp(38px,4.6vw,66px)] leading-[0.94] font-extrabold tracking-[-0.045em] text-balance">
                  {removed ? copy.doneTitle : copy.failedTitle}
                  <span className="text-[var(--ld-accent)]">.</span>
                </h1>
                <p className="mt-[18px] max-w-[28rem] text-[17px] leading-relaxed text-[var(--ld-muted)]">{removed ? copy.doneBody : copy.failedBody}</p>
                <div className="mt-[26px] flex flex-wrap gap-2.5">
                  <Link
                    href="/blog"
                    className="inline-flex min-h-12 items-center rounded-full bg-[var(--ld-paper)] px-5 text-[15px] font-semibold text-[var(--ld-ink)] outline-none transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ld-ink)]"
                  >
                    {copy.blogLabel}
                  </Link>
                  {!removed ? (
                    <Link
                      href="/contact?type=other"
                      className="inline-flex min-h-12 items-center rounded-full border border-[rgb(var(--ld-paper-rgb)/0.22)] px-5 text-[15px] font-semibold outline-none transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-[rgb(var(--ld-paper-rgb)/0.5)] focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)]"
                    >
                      {copy.contactLabel}
                    </Link>
                  ) : null}
                </div>
              </div>

              <div className="rounded-3xl bg-[var(--ld-paper)] p-[22px] text-[var(--ld-ink)] shadow-[0_40px_80px_-40px_rgb(0_0_0/0.8)]">
                <div className="flex items-center justify-between gap-3.5">
                  <span className="flex items-center gap-3">
                    <span aria-hidden="true" className="grid size-11 place-items-center rounded-xl bg-[var(--ld-ink)] text-lg text-[var(--ld-paper)]">
                      ✉
                    </span>
                    <span>
                      <span className="block text-base font-bold">{copy.listName}</span>
                      {copy.listTagline ? <span className="block font-mono text-xs text-[var(--ld-text-muted)]">{copy.listTagline}</span> : null}
                    </span>
                  </span>
                  {/* A picture of the setting, not a control: the link already did the work. */}
                  <span
                    role="img"
                    aria-label={removed ? "Subscription off" : "Subscription unchanged"}
                    className={`relative h-[34px] w-[60px] flex-none rounded-full ${removed ? "bg-[#c9cdd9]" : "bg-[var(--ld-deep)]"}`}
                  >
                    <span className={`absolute top-1 size-[26px] rounded-full bg-white shadow-[0_2px_6px_rgb(8_16_46/0.3)] ${removed ? "left-1" : "left-[30px]"}`} />
                  </span>
                </div>
                <ul className="mt-[18px] grid gap-2.5 border-t border-dashed border-[var(--ld-line)] pt-4">
                  {rows.map((row) => (
                    <li key={row.text} className="grid grid-cols-[22px_minmax(0,1fr)_auto] items-center gap-2.5 text-[14.5px]">
                      <span aria-hidden="true" className={`font-mono ${row.tone}`}>
                        {row.mark}
                      </span>
                      <span className={row.struck ? "text-[var(--ld-muted-3)] line-through" : ""}>{row.text}</span>
                      <span className="font-mono text-[11.5px] text-[var(--ld-text-muted)]">{row.when}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 font-mono text-[11.5px] text-[var(--ld-text-muted)] uppercase">
                  {removed ? "The switch is off · nothing else about you changed" : "Nothing was changed"}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
