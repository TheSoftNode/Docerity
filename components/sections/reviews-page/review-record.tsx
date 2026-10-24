"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import {
  KIND_FILTERS,
  averageRating,
  distribution,
  filterByKind,
  initialsOf,
  kindCounts,
  kindTag,
  monthOf,
  type KindFilter,
  type ShownReview,
} from "@/components/sections/reviews-page/reviews-content";

/**
 * The record: every approved review as a card, filtered by how the person
 * knows us, beside the average and how the ratings fall. The summary follows
 * the filter, so "mentees" shows the mentees' own average.
 */
function ReviewRecord({ reviews, eyebrow, title }: { reviews: ShownReview[]; eyebrow: string; title: string }) {
  const [filter, setFilter] = useState<KindFilter>("all");
  const counts = kindCounts(reviews);
  const shown = filterByKind(reviews, filter);
  const average = averageRating(shown);

  return (
    <section aria-labelledby="record-title" className="bg-[var(--ld-paper)] text-[var(--ld-ink)]">
      <div className="doc-shell py-[clamp(64px,8vw,112px)]">
        <div className="grid items-end gap-[clamp(28px,4vw,64px)] lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div>
            <p className="mb-3.5 flex flex-wrap items-center gap-2.5 font-mono text-[13px] tracking-[0.1em] text-[var(--ld-text-muted)] uppercase">
              <span className="rounded-full bg-[#dfe6fb] px-2.5 py-1 text-[var(--ld-deep)]">The record</span>
              {eyebrow}
            </p>
            <h2 id="record-title" className="ld-display max-w-[15ch] text-[clamp(36px,4.8vw,66px)] leading-[0.95] font-extrabold tracking-[-0.045em] text-balance">
              {title}
            </h2>
            {reviews.length > 0 ? (
              <div role="group" aria-label="Show reviews from" className="mt-[26px] flex flex-wrap gap-1.5">
                {KIND_FILTERS.map((option) => {
                  const on = option.value === filter;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={on}
                      disabled={option.value !== "all" && counts[option.value] === 0}
                      onClick={() => setFilter(option.value)}
                      className={cn(
                        "min-h-10 rounded-xl border px-3.5 text-sm font-semibold outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)] disabled:cursor-not-allowed disabled:opacity-40",
                        on ? "border-[var(--ld-ink)] bg-[var(--ld-ink)] text-[var(--ld-paper)]" : "border-[var(--ld-line)] bg-white hover:border-[var(--ld-ink)]"
                      )}
                    >
                      {option.label} <span className="font-mono text-xs opacity-55">{counts[option.value]}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="rounded-[22px] border border-[var(--ld-line)] bg-white px-[22px] py-5">
            <p className="flex items-baseline gap-3">
              <span className="ld-display text-[56px] leading-[0.9] font-extrabold tracking-[-0.05em]">{average ?? "—"}</span>
              <span className="text-sm text-[var(--ld-text-muted)]">
                {average ? `out of 5 · ${shown.length} ${shown.length === 1 ? "review" : "reviews"}` : "No entries yet"}
              </span>
            </p>
            <table className="mt-3.5 w-full font-mono text-xs text-[var(--ld-text-muted)]">
              <caption className="sr-only">How the ratings are distributed</caption>
              <tbody>
                {distribution(shown).map((row) => (
                  <tr key={row.stars}>
                    <th scope="row" className="w-[30px] py-[3px] text-left font-normal">
                      {row.stars}★
                    </th>
                    <td className="py-[3px]">
                      <span className="block h-2 overflow-hidden rounded bg-[#eef1f8]">
                        <span className="block h-full rounded bg-[var(--ld-deep)] transition-[width] duration-700" style={{ width: `${row.share * 100}%` }} />
                      </span>
                    </td>
                    <td className="w-[30px] py-[3px] text-right">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {shown.length > 0 ? (
          <ul className="mt-[clamp(36px,4vw,56px)] gap-4 [column-width:300px] sm:columns-2 lg:columns-3">
            {shown.map((review) => (
              <li key={review.id} className="mb-4 break-inside-avoid">
                <article className="ld-pop rounded-[22px] border border-[var(--ld-line)] bg-white p-[22px]">
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="flex gap-[3px]" role="img" aria-label={`${review.rating} out of 5`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={cn("size-2 rounded-full", star <= review.rating ? "bg-[var(--ld-deep)]" : "bg-[#e4e7f0]")} />
                      ))}
                    </span>
                    <span className="font-mono text-[11px] text-[var(--ld-text-muted)] uppercase">
                      {kindTag(review.kind)}
                      {monthOf(review.publishedAt) ? ` · ${monthOf(review.publishedAt)}` : ""}
                    </span>
                  </div>
                  <p className="mt-4 text-[16.5px] leading-[1.6] whitespace-pre-line text-[var(--ld-text-2)]">{review.body}</p>
                  <footer className="mt-[18px] flex items-center gap-3 border-t border-[#eef1f8] pt-4">
                    {review.photoUrl ? (
                      <Image src={review.photoUrl} alt="" width={38} height={38} className="size-[38px] rounded-full object-cover" />
                    ) : (
                      <span aria-hidden="true" className="grid size-[38px] place-items-center rounded-full bg-[#dfe6fb] text-[13px] font-bold text-[var(--ld-deep)]">
                        {initialsOf(review.fullName)}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-semibold">{review.fullName}</span>
                      <span className="block text-[13.5px] text-[var(--ld-text-muted)]">{review.title}</span>
                    </span>
                    {review.links[0] ? (
                      <a
                        href={review.links[0].url}
                        target="_blank"
                        rel="noopener noreferrer nofollow ugc"
                        className="shrink-0 rounded-md text-[13px] font-semibold text-[var(--ld-deep)] underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--ld-accent)]"
                      >
                        {review.links[0].title} <span aria-hidden="true">↗</span>
                      </a>
                    ) : null}
                  </footer>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-10 rounded-3xl border border-dashed border-[var(--ld-line-2)] p-10 text-center text-[var(--ld-text-muted)]">
            The record starts with the first review. It appears here once it has been read.
          </p>
        )}
      </div>
    </section>
  );
}

export { ReviewRecord };
