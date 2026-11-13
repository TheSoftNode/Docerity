import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDownIcon, ArrowUpIcon, ArrowUpRightIcon, CheckIcon, LockIcon, TrophyIcon, UsersIcon, ZapIcon } from "lucide-react";

import { getCurrentAccount } from "@/lib/account/session";
import { BATTLE_XP, PHASE_LABEL, VOTES_PER_BATTLE, battlePhase, phaseEndsAt, watLabel } from "@/lib/academy/battles";
import { getBattle } from "@/lib/academy/battle-store";
import { LessonNotes } from "@/lib/academy/markdown";
import { battleVotesUsed, findBattleEntry, listBattleEntries, type BattleEntryRow } from "@/lib/repositories/academy.repository";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Countdown } from "@/components/academy/countdown";
import { BattleEntryForm } from "@/components/academy/battle-entry-form";
import { BattleVote } from "@/components/academy/battle-vote";
import { cn } from "@/lib/utils";
import { AcademyHero, Avatar, BrowserFrame, coverFor } from "@/components/academy/kit";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const battle = await getBattle((await params).slug);
  if (!battle) return { title: "Battle not found" };
  return { title: `${battle.title} · Build battle`, description: battle.tagline || "A Docerity Academy build battle.", alternates: { canonical: `/academy/battles/${battle.slug}` } };
}

const ENDS: Record<string, string> = { upcoming: "Starts in", open: "Entries close in", voting: "Voting ends in" };
const PLACES = [
  { label: "1st", xp: BATTLE_XP.first, card: "bg-[var(--ld-accent)] text-[#08102e]", sub: "text-[#08102e]/70" },
  { label: "2nd", xp: BATTLE_XP.second, card: "bg-[var(--ld-deep)] text-white", sub: "text-[#c9d5ff]" },
  { label: "3rd", xp: BATTLE_XP.third, card: "ld-keep-dark bg-[#0b1433] text-[#f4f5fa]", sub: "text-[#9aa7cf]" },
] as const;

/**
 * One battle. The page follows the clock: before it starts, the brief and a
 * countdown; while it's open, the entry form (entries stay hidden so nobody
 * copies); in voting, every entry with a vote button; at the end, the podium.
 */
export default async function BattlePage({ params }: { params: Promise<{ slug: string }> }) {
  const battle = await getBattle((await params).slug);
  if (!battle) notFound();

  const account = await getCurrentAccount();
  const phase = battlePhase(battle);
  const ends = phaseEndsAt(battle, phase);
  const showEntries = phase === "voting" || phase === "judging" || phase === "finished";
  const [entries, mine, used] = await Promise.all([
    listBattleEntries(battle.slug).catch(() => [] as BattleEntryRow[]),
    account?.verified ? findBattleEntry(battle.slug, account.id).catch(() => null) : null,
    account?.verified && phase === "voting" ? battleVotesUsed(battle.slug, account.id).catch(() => 0) : 0,
  ]);
  const byId = new Map(entries.map((entry) => [String(entry._id), entry] as const));
  const podiumEntries = battle.results ? [battle.results.first, battle.results.second, battle.results.third].map((id) => byId.get(id)) : [];
  const onPodium = new Set(battle.results ? Object.values(battle.results) : []);
  const rest = battle.results ? entries.filter((entry) => !onPodium.has(String(entry._id))) : entries;
  const left = VOTES_PER_BATTLE - used;
  const signIn = `/account/login?next=${encodeURIComponent(`/academy/battles/${battle.slug}`)}`;

  const timeline = [
    { label: "Entries open", at: battle.startsAt, done: phase !== "upcoming" },
    { label: "Entries close", at: battle.submitBy, done: showEntries },
    { label: "Voting ends", at: battle.voteBy, done: phase === "judging" || phase === "finished" },
  ];

  return (
    <div className="ld-page flex flex-1 flex-col bg-[var(--ld-ink)] pt-3">
      <SiteHeader />
      <main className="flex-1">
        <AcademyHero
          back={{ href: "/academy/battles", label: "Build battles" }}
          size="lg"
          meta={
            <>
              {phase === "open" || phase === "voting" ? <span className="size-2 animate-pulse rounded-full bg-[var(--ld-accent)]" aria-hidden="true" /> : null}
              <span>{PHASE_LABEL[phase]}</span>
              <span aria-hidden="true">·</span>
              <span>{battle.level}</span>
            </>
          }
          title={battle.title}
          aside={
            <div>
              {battle.tagline ? <p className="text-[clamp(16.5px,1.35vw,19px)] leading-relaxed text-[var(--ld-muted)]">{battle.tagline}</p> : null}
              <ol className="mt-6 grid grid-cols-3 gap-3" aria-label="Battle timeline">
                {timeline.map((step) => (
                  <li key={step.label}>
                    <span className={cn("block h-1.5 rounded-full", step.done ? "bg-[var(--ld-accent)]" : "bg-[rgb(var(--ld-paper-rgb)/0.16)]")} />
                    <span className="mt-2 block text-[13px] font-semibold">{step.label}</span>
                    <span className="block text-[12.5px] text-[var(--ld-muted)]">{watLabel(step.at)}</span>
                  </li>
                ))}
              </ol>
            </div>
          }
        >
          {ends ? (
            <div className="ld-keep-dark flex flex-col gap-5 rounded-[28px] bg-[#0b1433] p-5 text-[#f4f5fa] shadow-[inset_0_0_0_1px_rgb(175_196_255/0.14)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="mb-2 text-[13px] text-[#9aa7cf]">{ENDS[phase]}</p>
                <Countdown to={ends} fallback={watLabel(ends)} variant="tiles" />
              </div>
              {phase === "open" || phase === "voting" ? (
                <a href={phase === "open" ? "#enter" : "#entries-title"} className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-[#ff7a59] px-6 text-[15px] font-semibold text-[#08102e] transition-transform hover:-translate-y-0.5">
                  {phase === "open" ? (mine ? "Update my entry" : "Enter the battle") : "Vote on the entries"} <ArrowDownIcon className="size-4" />
                </a>
              ) : null}
            </div>
          ) : null}
        </AcademyHero>

        <section className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
          <div className="doc-shell grid gap-10 py-[clamp(36px,5vw,72px)] lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0">
              {battle.results ? (
                <div className="mb-6">
                  <h2 className="ld-display flex items-center gap-3 text-[clamp(30px,3.6vw,48px)] leading-none font-extrabold tracking-[-0.04em]">
                    <TrophyIcon className="size-8 text-[var(--ld-accent)]" /> The podium.
                  </h2>
                  <ol className="mt-8 grid gap-3 sm:grid-cols-3 sm:items-end">
                    {podiumEntries.map((entry, index) =>
                      entry ? (
                        <li key={String(entry._id)} className={cn("flex min-h-[220px] flex-col rounded-[24px] p-6", PLACES[index].card, index === 0 && "sm:-translate-y-3")}>
                          <span className="ld-display text-[44px] leading-none font-extrabold tracking-[-0.04em]">{PLACES[index].label}</span>
                          <span className="ld-display mt-auto pt-4 text-[22px] leading-tight font-extrabold tracking-[-0.02em]">{entry.title}</span>
                          <span className={cn("mt-1 text-[14px]", PLACES[index].sub)}>
                            {entry.name} · {entry.votes} {entry.votes === 1 ? "vote" : "votes"}
                          </span>
                          <a href={entry.liveUrl} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex min-h-10 items-center gap-1 pt-3 text-[14px] font-bold">
                            See it live <ArrowUpRightIcon className="size-4" />
                          </a>
                        </li>
                      ) : null
                    )}
                  </ol>
                </div>
              ) : null}

              {battle.brief ? (
                <article className="rounded-[28px] bg-[var(--ld-card)] shadow-[0_1px_0_rgb(8_16_46/0.04),0_24px_48px_-32px_rgb(8_16_46/0.22)] ring-1 ring-[rgb(8_16_46/0.06)] p-6 sm:p-8">
                  <h2 className="ld-display text-[clamp(26px,2.6vw,34px)] leading-none font-extrabold tracking-[-0.035em]">The challenge</h2>
                  <div className="mt-3">
                    <LessonNotes source={battle.brief} />
                  </div>
                </article>
              ) : null}
              {battle.rules.length ? (
                <div className="mt-6 rounded-[28px] bg-[var(--ld-card)] shadow-[0_1px_0_rgb(8_16_46/0.04),0_24px_48px_-32px_rgb(8_16_46/0.22)] ring-1 ring-[rgb(8_16_46/0.06)] p-6 sm:p-8">
                  <h2 className="ld-display text-[clamp(26px,2.6vw,34px)] leading-none font-extrabold tracking-[-0.035em]">The rules</h2>
                  <ul className="mt-4 grid gap-3">
                    {battle.rules.map((rule) => (
                      <li key={rule} className="flex gap-3 text-[16px] leading-relaxed text-[var(--ld-text-2)]">
                        <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-md border-[1.5px] border-[var(--ld-deep)] text-[var(--ld-deep)]">
                          <CheckIcon className="size-3.5" />
                        </span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <aside id="enter" className="scroll-mt-24">
              <div className="grid gap-5 lg:sticky lg:top-24">
                <div className="rounded-[28px] bg-[var(--ld-card)] shadow-[0_1px_0_rgb(8_16_46/0.04),0_24px_48px_-32px_rgb(8_16_46/0.22)] ring-1 ring-[rgb(8_16_46/0.06)] p-6">
                  {phase === "upcoming" ? (
                    <>
                      <p className="ld-display text-[22px] font-bold tracking-[-0.02em]">Get ready</p>
                      <p className="mt-2 text-[15px] leading-relaxed text-[var(--ld-text-2)]">
                        Entries open {watLabel(battle.startsAt)}. Read the challenge now and plan your build.
                      </p>
                      {!account ? (
                        <Link href={signIn} className="mt-5 flex min-h-12 items-center justify-center rounded-full bg-[var(--ld-ink)] px-6 text-[15px] font-bold text-[var(--ld-paper)]">
                          Sign in to take part
                        </Link>
                      ) : null}
                    </>
                  ) : phase === "open" ? (
                    account?.verified ? (
                      <>
                        <p className="ld-display text-[22px] font-bold tracking-[-0.02em]">{mine ? "You're in" : "Enter the battle"}</p>
                        <p className="mt-1 mb-5 text-[14px] text-[var(--ld-text-muted)]">
                          {mine ? "Update your entry until entries close." : `+${BATTLE_XP.entry} XP just for entering.`}
                        </p>
                        <BattleEntryForm slug={battle.slug} entered={Boolean(mine)} initial={{ title: mine?.title ?? "", repoUrl: mine?.repoUrl ?? "", liveUrl: mine?.liveUrl ?? "", note: mine?.note ?? "" }} />
                      </>
                    ) : (
                      <>
                        <p className="ld-display text-[22px] font-bold tracking-[-0.02em]">Enter the battle</p>
                        <p className="mt-2 text-[15px] leading-relaxed text-[var(--ld-text-2)]">Sign in with your Docerity account to hand in an entry. It&apos;s free.</p>
                        <Link href={account ? "/account" : signIn} className="mt-5 flex min-h-12 items-center justify-center rounded-full bg-[var(--ld-ink)] px-6 text-[15px] font-bold text-[var(--ld-paper)]">
                          {account ? "Confirm your email first" : "Sign in to enter"}
                        </Link>
                      </>
                    )
                  ) : phase === "voting" ? (
                    <>
                      <p className="ld-display text-[22px] font-bold tracking-[-0.02em]">Voting is open</p>
                      {account?.verified ? (
                        <>
                          <p className="mt-2 text-[15px] leading-relaxed text-[var(--ld-text-2)]">Open each entry, then vote for the ones you rate. Change your mind any time before voting ends.</p>
                          <div className="mt-5 flex items-center gap-2" aria-label={`${left} of ${VOTES_PER_BATTLE} votes left`} data-votes-left={left}>
                            {Array.from({ length: VOTES_PER_BATTLE }, (_, index) => (
                              <span key={index} className={cn("grid size-10 place-items-center rounded-full border-[1.5px]", index < left ? "border-[var(--ld-accent)] bg-[var(--ld-accent)] text-[#08102e]" : "border-[var(--ld-line-2)] text-[var(--ld-text-muted)]")}>
                                <ArrowUpIcon className="size-4" />
                              </span>
                            ))}
                            <span className="ml-1 text-[15px] font-semibold">
                              {left} of {VOTES_PER_BATTLE} votes left
                            </span>
                          </div>
                        </>
                      ) : (
                        <Link href={account ? "/account" : signIn} className="mt-5 flex min-h-12 items-center justify-center rounded-full bg-[var(--ld-ink)] px-6 text-[15px] font-bold text-[var(--ld-paper)]">
                          {account ? "Confirm your email to vote" : "Sign in to vote"}
                        </Link>
                      )}
                    </>
                  ) : phase === "judging" ? (
                    <>
                      <p className="ld-display text-[22px] font-bold tracking-[-0.02em]">Voting has closed</p>
                      <p className="mt-2 text-[15px] leading-relaxed text-[var(--ld-text-2)]">We&apos;re checking the top entries now. The podium goes up here as soon as it&apos;s confirmed.</p>
                    </>
                  ) : (
                    <>
                      <p className="ld-display text-[22px] font-bold tracking-[-0.02em]">That&apos;s a wrap</p>
                      <p className="mt-2 text-[15px] leading-relaxed text-[var(--ld-text-2)]">
                        {entries.length} {entries.length === 1 ? "entry" : "entries"}. Thanks to everyone who built and voted.
                      </p>
                      <Link href="/academy/battles" className="mt-5 flex min-h-12 items-center justify-center rounded-full bg-[var(--ld-ink)] px-6 text-[15px] font-bold text-[var(--ld-paper)]">
                        See other battles
                      </Link>
                    </>
                  )}
                </div>

                <dl className="grid grid-cols-2 gap-3 rounded-[28px] bg-[var(--ld-card)] shadow-[0_1px_0_rgb(8_16_46/0.04),0_24px_48px_-32px_rgb(8_16_46/0.22)] ring-1 ring-[rgb(8_16_46/0.06)] p-5 text-[14px]">
                  <div>
                    <dt className="text-[var(--ld-text-muted)]">Entries</dt>
                    <dd className="mt-0.5 inline-flex items-center gap-1.5 text-[20px] font-bold">
                      <UsersIcon className="size-4 text-[var(--ld-deep)]" /> {entries.length}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--ld-text-muted)]">Winner takes</dt>
                    <dd className="mt-0.5 inline-flex items-center gap-1.5 text-[20px] font-bold">
                      <ZapIcon className="size-4 text-[var(--ld-accent)]" /> {BATTLE_XP.first} XP
                    </dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        </section>

        <section aria-labelledby="entries-title" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
          <div className="doc-shell pb-[clamp(56px,7vw,104px)]">
            <h2 id="entries-title" className="ld-display scroll-mt-24 text-[clamp(36px,5vw,72px)] leading-[0.95] font-extrabold tracking-[-0.045em]">
              {battle.results ? "Every other entry." : "The entries."}
            </h2>
            {!showEntries ? (
              <p className="mt-4 flex max-w-[560px] items-start gap-3 rounded-[28px] bg-[var(--ld-card)] shadow-[0_1px_0_rgb(8_16_46/0.04),0_24px_48px_-32px_rgb(8_16_46/0.22)] ring-1 ring-[rgb(8_16_46/0.06)] p-5 text-[15.5px] leading-relaxed text-[var(--ld-text-2)]">
                <LockIcon className="mt-1 size-4 shrink-0 text-[var(--ld-deep)]" />
                Entries stay sealed until voting opens, so nobody builds off anyone else&apos;s idea.
              </p>
            ) : rest.length === 0 ? (
              <p className="mt-4 text-[15.5px] text-[var(--ld-text-2)]">{battle.results ? "Only the podium this time." : "No entries this time."}</p>
            ) : (
              <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((entry) => {
                  const own = account?.id === String(entry.accountId);
                  const voted = account ? entry.voters.some((voter) => String(voter) === account.id) : false;
                  return (
                    <li key={String(entry._id)} className="flex flex-col rounded-[28px] bg-[var(--ld-card)] p-3 shadow-[0_1px_0_rgb(8_16_46/0.04),0_24px_48px_-32px_rgb(8_16_46/0.22)] ring-1 ring-[rgb(8_16_46/0.06)]" data-entry>
                      <a href={entry.liveUrl} target="_blank" rel="noopener noreferrer" className="group block" aria-label={`Open ${entry.title} by ${entry.name}`}>
                        <BrowserFrame url={entry.liveUrl}>
                          <div className={cn("relative flex h-36 items-end p-5", coverFor(String(entry._id)))}>
                            <span className="ld-display text-[24px] leading-[1] font-extrabold tracking-[-0.03em] text-white transition-transform group-hover:-translate-y-1">{entry.title}</span>
                            <ArrowUpRightIcon className="absolute top-4 right-4 size-5 text-white/70" />
                          </div>
                        </BrowserFrame>
                      </a>
                      <div className="flex flex-1 flex-col px-3 pt-4 pb-2">
                      <div className="flex items-center gap-3">
                        <Avatar name={entry.name} className="size-9 text-[13px]" />
                        <p className="min-w-0 truncate text-[15px] font-semibold">
                          {entry.name}
                          {own ? <span className="font-normal text-[var(--ld-text-muted)]"> · you</span> : null}
                        </p>
                      </div>
                      {entry.note ? <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-[var(--ld-text-2)]">{entry.note}</p> : null}
                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                        <a href={entry.repoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1.5 text-[14px] font-semibold text-[var(--ld-deep)]">
                          Read the code <ArrowUpRightIcon className="size-4" />
                        </a>
                        {phase === "voting" ? (
                          <BattleVote
                            slug={battle.slug}
                            entryId={String(entry._id)}
                            votes={entry.votes}
                            voted={voted}
                            disabled={!account?.verified || own}
                            hint={own ? "Your own entry" : "Sign in to vote"}
                          />
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[14px] font-bold text-[var(--ld-text-2)]">
                            <ArrowUpIcon className="size-4" /> {entry.votes}
                          </span>
                        )}
                      </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
