"use client";

import { motion, useReducedMotion } from "framer-motion";

import { StarDisplay } from "@/components/sections/reviews/star-rating";

/**
 * The rating, as a figure and a distribution.
 *
 * The distribution is the part that earns its place. An average on its own is
 * the least informative number a review page can show: 4.6 could be everyone
 * agreeing or half fives and half threes, and the bars answer that at a glance.
 * It is also real data rather than decoration, which is the difference between
 * a designed panel and a filled one.
 */
function RatingSummary({
  average,
  total,
  distribution,
}: {
  average: number;
  total: number;
  /** Count per rating, indexed 1 to 5. */
  distribution: Record<number, number>;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8 lg:flex-col lg:items-stretch lg:gap-5">
      <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-2">
        <div>
          <p className="font-heading text-[3.25rem] leading-none font-semibold tabular-nums text-foreground">
            {average.toFixed(1)}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <StarDisplay rating={Math.round(average)} />
            <span className="font-mono text-[0.6875rem] text-muted-foreground">
              {total} {total === 1 ? "review" : "reviews"}
            </span>
          </div>
        </div>
      </div>

      {/* A table, because that is what this is: a rating and how many gave it. */}
      <table className="w-full border-collapse lg:border-t lg:border-border/70 lg:pt-4">
        <caption className="sr-only">How the ratings are distributed</caption>
        <tbody>
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = distribution[rating] ?? 0;
            const share = total > 0 ? count / total : 0;

            return (
              <tr key={rating}>
                <th
                  scope="row"
                  className="py-[0.1875rem] pr-2 text-right font-mono text-[0.625rem] font-normal text-muted-foreground"
                >
                  {rating}
                </th>
                <td className="w-full py-[0.1875rem]">
                  <span className="block h-1.5 overflow-hidden rounded-full bg-foreground/[0.07]">
                    <motion.span
                      className="block h-full rounded-full bg-[linear-gradient(90deg,var(--brand-primary),var(--brand-violet))]"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: share }}
                      viewport={{ once: true }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.7,
                        delay: reduceMotion ? 0 : (5 - rating) * 0.07,
                        ease: "easeOut",
                      }}
                      /* Scaled from the left rather than animating width, so
                         the browser can do it on the compositor instead of
                         relaying out the row five times a frame. */
                      style={{ transformOrigin: "left" }}
                    />
                  </span>
                </td>
                <td className="py-[0.1875rem] pl-2 text-right font-mono text-[0.625rem] tabular-nums text-muted-foreground">
                  {count}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export { RatingSummary };
