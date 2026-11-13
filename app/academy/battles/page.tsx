import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, TrophyIcon, UsersIcon } from "lucide-react";

import { BATTLE_XP, PHASE_LABEL, VOTES_PER_BATTLE, battlePhase, phaseEndsAt, watLabel, type Battle } from "@/lib/academy/battles";
import { getBattles } from "@/lib/academy/battle-store";
import { countBattleEntries, listBattleEntries } from "@/lib/repositories/academy.repository";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AcademyHero, SectionHead } from "@/components/academy/kit";
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
        <AcademyHero
          current="battles"
          title={
            <>
              Build <span className="text-[var(--ld-accent)]">battles.</span>
            </>
          }
          lede={`One brief, one deadline, everyone building at once. Hand in before entries close, then vote for your favourite ${VOTES_PER_BATTLE}. The top three take the podium.`}
        >
          {feature && phase && ends ? (
            <Link
              href={`/academy/battles/${feature.slug}`}
              className="ld-keep-dark group relative grid gap-6 overflow-hidden rounded-[28px] bg-[#0b1433] p-6 text-[#f4f5fa] shadow-[inset_0_0_0_1px_rgb(175_196_255/0.14),0_40px_80px_-40px_rgb(0_0_0/0.7)] transition-transform hover:-translate-y-1 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
              data-live-battle
            >
              <span aria-hidden="true" className="pointer-events-none absolute -top-32 -left-20 size-96 rounded-full bg-[radial-gradient(circle,rgb(255_122_89/0.22),transparent_65%)]" />
              <div className="relative min-w-0">
                <p className="flex items-center gap-2 text-[14px] font-semibold text-[#ff9a80]">
                  {phase === "upcoming" ? null : <span className="size-2 animate-pulse rounded-full bg-[#ff7a59]" aria-hidden="true" />}
                  {live ? "Live now" : "Next battle"} · {PHASE_LABEL[phase]}
                  {live ? (
                    <span className="inline-flex items-center gap-1.5 font-normal text-[#c4cbe3]">
                      · <UsersIcon className="size-4" /> {liveCount} {liveCount === 1 ? "entry" : "entries"}
                    </span>
                  ) : null}
                </p>
                <p className="ld-display mt-2 text-[clamp(30px,3.6vw,52px)] leading-[0.98] font-extrabold tracking-[-0.04em]">{feature.title}</p>
                {feature.tagline ? <p className="mt-3 max-w-[40rem] text-[16px] leading-relaxed text-[#c4cbe3]">{feature.tagline}</p> : null}
                <span className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-[#ff7a59] px-6 text-[15px] font-semibold text-[#08102e]">
                  {phase === "open" ? "Enter the battle" : phase === "voting" ? "Vote on the entries" : "Read the brief"} <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
              <div className="relative">
                <p className="mb-2 text-[13px] text-[#9aa7cf]">{ENDS[phase]}</p>
                <Countdown to={ends} fallback={watLabel(ends)} variant="tiles" />
              </div>
            </Link>
          ) : null}
        </AcademyHero>

        <section aria-labelledby="prizes-title" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
          <div className="doc-shell py-[clamp(48px,6vw,88px)]">
            <SectionHead id="prizes-title" title="What's on the line." lede="Points for the podium, and something for everyone who ships an entry." className="md:mb-10" />
            <dl className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "1st place", xp: BATTLE_XP.first, tone: "bg-[var(--ld-accent)] text-[#08102e]" },
                { label: "2nd place", xp: BATTLE_XP.second, tone: "bg-[var(--ld-deep)] text-white" },
                { label: "3rd place", xp: BATTLE_XP.third, tone: "bg-[var(--ld-ink)] text-[var(--ld-paper)] ld-keep-dark" },
                { label: "Every entry", xp: BATTLE_XP.entry, tone: "bg-[linear-gradient(160deg,#e4eafc,#cdd9fd)] text-[#08102e]" },
              ].map((prize) => (
                <div key={prize.label} className={`rounded-[24px] p-5 sm:p-6 ${prize.tone}`}>
                  <dt className="text-[14px] font-semibold opacity-80">{prize.label}</dt>
                  <dd className="ld-display mt-6 text-[clamp(30px,3.4vw,44px)] leading-none font-extrabold tracking-[-0.04em]">+{prize.xp}<span className="ml-1 text-[0.5em] tracking-normal">XP</span></dd>
                </div>
              ))}
            </dl>
            <ol className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                { title: "Build", body: "The brief goes live and the clock starts. Build it your way and hand in the code and the live site before entries close." },
                { title: "Vote", body: `Entries are revealed together. Every student gets ${VOTES_PER_BATTLE} votes for others' work, never their own.` },
                { title: "Podium", body: "When voting ends we check the top entries and confirm the results. A tie goes to whoever handed in first." },
              ].map((step, index) => (
                <li key={step.title} className="rounded-[24px] bg-[var(--ld-card)] p-6 shadow-[0_1px_0_rgb(8_16_46/0.04),0_24px_48px_-32px_rgb(8_16_46/0.22)] ring-1 ring-[rgb(8_16_46/0.06)]">
                  <p className="flex items-baseline gap-3">
                    <span className="font-mono text-[13px] text-[var(--ld-text-muted)]">{String(index + 1).padStart(2, "0")}</span>
                    <span className="ld-display text-[24px] font-extrabold tracking-[-0.03em]">{step.title}</span>
                  </p>
                  <p className="mt-2 text-[15.5px] leading-relaxed text-[var(--ld-text-2)]">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {upcoming.filter((battle) => battle !== feature).length > 0 || past.length > 0 || !feature ? (
          <section aria-label="More battles" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
            <div className="doc-shell pb-[clamp(56px,7vw,104px)]">
              {!feature ? (
                <div className="mb-10 grid max-w-[560px] gap-3 rounded-[28px] bg-[var(--ld-card)] shadow-[0_1px_0_rgb(8_16_46/0.04),0_24px_48px_-32px_rgb(8_16_46/0.22)] ring-1 ring-[rgb(8_16_46/0.06)] p-7">
                  <p className="ld-display text-[26px] leading-tight font-bold tracking-[-0.025em]">The next battle is being set.</p>
                  <p className="text-[16px] leading-relaxed text-[var(--ld-text-2)]">Sharpen up in the project pool while you wait; every build there makes you faster here.</p>
                  <Link href="/academy/projects" className="mt-2 inline-flex h-12 items-center gap-2 justify-self-start rounded-full bg-[var(--ld-ink)] px-5 text-[15px] font-bold text-[var(--ld-paper)]">
                    Open the project pool <ArrowRightIcon className="size-4" />
                  </Link>
                </div>
              ) : null}

              {upcoming.filter((battle) => battle !== feature).length > 0 ? (
                <>
                  <h2 className="ld-display text-[clamp(30px,3.6vw,48px)] leading-none font-extrabold tracking-[-0.04em]">Coming up.</h2>
                  <ul className="mt-6 grid gap-3 md:grid-cols-2">
                    {upcoming
                      .filter((battle) => battle !== feature)
                      .map((battle) => (
                        <li key={battle.slug}>
                          <Link href={`/academy/battles/${battle.slug}`} className="group flex items-center justify-between gap-4 rounded-[28px] bg-[var(--ld-card)] shadow-[0_1px_0_rgb(8_16_46/0.04),0_24px_48px_-32px_rgb(8_16_46/0.22)] ring-1 ring-[rgb(8_16_46/0.06)] p-5">
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
                  <h2 className="ld-display mt-14 text-[clamp(30px,3.6vw,48px)] leading-none font-extrabold tracking-[-0.04em] first:mt-0">Past battles.</h2>
                  <ul className="mt-6 grid gap-3 md:grid-cols-2">
                    {past.map((battle, index) => (
                      <li key={battle.slug}>
                        <Link href={`/academy/battles/${battle.slug}`} className="group flex items-center justify-between gap-4 rounded-[28px] bg-[var(--ld-card)] shadow-[0_1px_0_rgb(8_16_46/0.04),0_24px_48px_-32px_rgb(8_16_46/0.22)] ring-1 ring-[rgb(8_16_46/0.06)] p-5">
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
