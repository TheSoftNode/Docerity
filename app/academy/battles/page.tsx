import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, TrophyIcon, UsersIcon } from "lucide-react";

import { BATTLE_XP, PHASE_LABEL, VOTES_PER_BATTLE, battlePhase, phaseEndsAt, watLabel, type Battle } from "@/lib/academy/battles";
import { getBattles } from "@/lib/academy/battle-store";
import { countBattleEntries, listBattleEntries } from "@/lib/repositories/academy.repository";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AcademyNav } from "@/components/academy/academy-nav";
import { Countdown } from "@/components/academy/countdown";

export const metadata: Metadata = {
  title: "Build battles",
  description: "Timed build challenges for Docerity Academy students. One brief, one deadline, everyone building at once; the community votes the podium.",
  alternates: { canonical: "/academy/battles" },
};
export const dynamic = "force-dynamic";

const ENDS: Record<string, string> = { upcoming: "Starts in", open: "Entries close in", voting: "Voting ends in" };

/** The live battle up top with its clock, how battles work, then what's coming and what's done. */
export default async function BattlesPage() {
  const battles = await getBattles();
  const now = new Date();
  const live = battles.find((battle) => ["open", "voting"].includes(battlePhase(battle, now)));
  const upcoming = battles.filter((battle) => battle !== live && battlePhase(battle, now) === "upcoming");
  const past = battles.filter((battle) => ["judging", "finished"].includes(battlePhase(battle, now))).slice(0, 12);

  const [liveCount, winners] = await Promise.all([
    live ? countBattleEntries(live.slug).catch(() => 0) : 0,
    Promise.all(
      past.map(async (battle) => {
        if (!battle.results) return "";
        const entries = await listBattleEntries(battle.slug).catch(() => []);
        return entries.find((entry) => String(entry._id) === battle.results?.first)?.name ?? "";
      })
    ),
  ]);
  const next = !live ? upcoming[0] : undefined;
  const feature: Battle | undefined = live ?? next;
  const phase = feature ? battlePhase(feature, now) : null;
  const ends = feature && phase ? phaseEndsAt(feature, phase) : null;

  return (
    <div className="ld-page flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative -mt-[76px] overflow-hidden bg-[radial-gradient(900px_520px_at_88%_10%,rgb(255_122_89/0.16),transparent_62%),radial-gradient(700px_420px_at_0%_100%,rgb(28_58_140/0.55),transparent_60%),var(--ld-ink)] pt-[124px] pb-[clamp(48px,6vw,88px)] text-[var(--ld-paper)]">
          <div className="doc-shell">
            <AcademyNav current="battles" />
            <div className="mt-8 grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
              <div>
                <h1 className="ld-display ld-up max-w-[14ch] text-[clamp(42px,6vw,84px)] leading-[0.95] font-extrabold tracking-[-0.05em] text-balance">
                  Build <span className="text-[var(--ld-accent)]">battles.</span>
                </h1>
                <p className="ld-up ld-delay-2 mt-5 max-w-[36rem] text-[clamp(16px,1.3vw,18px)] leading-relaxed text-[var(--ld-muted)]">
                  One brief, one deadline, everyone building at once. Hand in before entries close, then vote for your favourite {VOTES_PER_BATTLE}. The top three take the podium.
                </p>
              </div>

              {feature && phase && ends ? (
                <Link
                  href={`/academy/battles/${feature.slug}`}
                  className="ld-keep-dark group block rounded-[26px] border border-[rgb(175_196_255/0.18)] bg-[#0b1433] p-6 text-[#f4f5fa] transition-transform hover:-translate-y-1 sm:p-7"
                  data-live-battle
                >
                  <p className="flex items-center gap-2 text-[13px] font-semibold text-[#ff9a80]">
                    {phase === "upcoming" ? null : <span className="size-2 animate-pulse rounded-full bg-[#ff7a59]" aria-hidden="true" />}
                    {live ? "Live now" : "Next battle"} · {PHASE_LABEL[phase]}
                  </p>
                  <p className="ld-display mt-2 text-[clamp(26px,2.6vw,34px)] leading-tight font-bold tracking-[-0.03em]">{feature.title}</p>
                  {feature.tagline ? <p className="mt-2 text-[15.5px] leading-relaxed text-[#c4cbe3]">{feature.tagline}</p> : null}
                  <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-[rgb(175_196_255/0.14)] pt-5">
                    <div>
                      <p className="text-[13px] text-[#9aa7cf]">{ENDS[phase]}</p>
                      <Countdown to={ends} fallback={watLabel(ends)} className="ld-display text-[30px] font-extrabold tabular-nums tracking-[-0.02em]" />
                    </div>
                    {live ? (
                      <p className="inline-flex items-center gap-1.5 text-[14px] text-[#c4cbe3]">
                        <UsersIcon className="size-4" /> {liveCount} {liveCount === 1 ? "entry" : "entries"}
                      </p>
                    ) : null}
                    <span className="inline-flex items-center gap-1.5 text-[15px] font-bold text-[#ff9a80]">
                      {phase === "open" ? "Enter" : phase === "voting" ? "Vote" : "See the brief"} <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <section aria-labelledby="prizes-title" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
          <div className="doc-shell py-[clamp(48px,6vw,88px)]">
            <h2 id="prizes-title" className="ld-display text-[clamp(30px,4vw,48px)] leading-none font-extrabold tracking-[-0.04em]">
              What&apos;s on the line
            </h2>
            <dl className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "1st place", xp: BATTLE_XP.first, tone: "bg-[var(--ld-accent)] text-[#08102e]" },
                { label: "2nd place", xp: BATTLE_XP.second, tone: "bg-[var(--ld-deep)] text-white" },
                { label: "3rd place", xp: BATTLE_XP.third, tone: "bg-[var(--ld-ink)] text-[var(--ld-paper)] ld-keep-dark" },
                { label: "Every entry", xp: BATTLE_XP.entry, tone: "border border-[var(--ld-line)] bg-[var(--ld-card)]" },
              ].map((prize) => (
                <div key={prize.label} className={`rounded-[22px] p-5 ${prize.tone}`}>
                  <dt className="text-[14px] font-semibold opacity-80">{prize.label}</dt>
                  <dd className="ld-display mt-1 text-[30px] font-extrabold tracking-[-0.03em]">+{prize.xp} XP</dd>
                </div>
              ))}
            </dl>
            <ol className="mt-8 grid gap-x-8 gap-y-4 text-[15.5px] leading-relaxed text-[var(--ld-text-2)] md:grid-cols-3">
              <li>
                <strong className="block text-[var(--ld-ink)]">1. Build</strong>
                The brief goes live and the clock starts. Build it your way and hand in the code and the live site before entries close.
              </li>
              <li>
                <strong className="block text-[var(--ld-ink)]">2. Vote</strong>
                Entries are revealed together. {`Every student gets ${VOTES_PER_BATTLE} votes for others' work`}, never their own.
              </li>
              <li>
                <strong className="block text-[var(--ld-ink)]">3. Podium</strong>
                When voting ends we check the top entries and confirm the results. A tie goes to whoever handed in first.
              </li>
            </ol>
          </div>
        </section>

        {upcoming.filter((battle) => battle !== feature).length > 0 || past.length > 0 || !feature ? (
          <section aria-label="More battles" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
            <div className="doc-shell pb-[clamp(56px,7vw,104px)]">
              {!feature ? (
                <div className="mb-10 grid max-w-[560px] gap-3 rounded-[24px] border border-[var(--ld-line)] bg-[var(--ld-card)] p-7">
                  <p className="ld-display text-[26px] leading-tight font-bold tracking-[-0.025em]">The next battle is being set.</p>
                  <p className="text-[16px] leading-relaxed text-[var(--ld-text-2)]">Sharpen up in the project pool while you wait; every build there makes you faster here.</p>
                  <Link href="/academy/projects" className="mt-2 inline-flex h-12 items-center gap-2 justify-self-start rounded-full bg-[var(--ld-ink)] px-5 text-[15px] font-bold text-[var(--ld-paper)]">
                    Open the project pool <ArrowRightIcon className="size-4" />
                  </Link>
                </div>
              ) : null}

              {upcoming.filter((battle) => battle !== feature).length > 0 ? (
                <>
                  <h2 className="ld-display text-[26px] font-bold tracking-[-0.025em]">Coming up</h2>
                  <ul className="mt-4 grid gap-3 md:grid-cols-2">
                    {upcoming
                      .filter((battle) => battle !== feature)
                      .map((battle) => (
                        <li key={battle.slug}>
                          <Link href={`/academy/battles/${battle.slug}`} className="group flex items-center justify-between gap-4 rounded-[22px] border border-[var(--ld-line)] bg-[var(--ld-card)] p-5">
                            <span className="min-w-0">
                              <span className="block text-[13px] text-[var(--ld-text-muted)]">Starts {watLabel(battle.startsAt)}</span>
                              <span className="block truncate text-[18px] font-bold">{battle.title}</span>
                            </span>
                            <ArrowRightIcon className="size-5 shrink-0 text-[var(--ld-deep)] transition-transform group-hover:translate-x-1" />
                          </Link>
                        </li>
                      ))}
                  </ul>
                </>
              ) : null}

              {past.length > 0 ? (
                <>
                  <h2 className="ld-display mt-10 text-[26px] font-bold tracking-[-0.025em] first:mt-0">Past battles</h2>
                  <ul className="mt-4 grid gap-3 md:grid-cols-2">
                    {past.map((battle, index) => (
                      <li key={battle.slug}>
                        <Link href={`/academy/battles/${battle.slug}`} className="group flex items-center justify-between gap-4 rounded-[22px] border border-[var(--ld-line)] bg-[var(--ld-card)] p-5">
                          <span className="min-w-0">
                            <span className="block text-[13px] text-[var(--ld-text-muted)]">{battle.results ? `Ended ${watLabel(battle.voteBy)}` : "Results coming"}</span>
                            <span className="block truncate text-[18px] font-bold">{battle.title}</span>
                            {winners[index] ? (
                              <span className="mt-1 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--ld-deep)]">
                                <TrophyIcon className="size-4 text-[var(--ld-accent)]" /> {winners[index]}
                              </span>
                            ) : null}
                          </span>
                          <ArrowRightIcon className="size-5 shrink-0 text-[var(--ld-deep)] transition-transform group-hover:translate-x-1" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
