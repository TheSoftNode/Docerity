import { CheckIcon, PlayIcon, ZapIcon } from "lucide-react";

import { StreakFlame } from "@/components/academy/standing-panel";
import { cn } from "@/lib/utils";

/*
  Small drawn scenes of learning here, in the same spirit as the
  mentorship page's: decoration that shows the thing at work. Every one is
  aria-hidden; the text beside it says what it is.
*/

/** The hero's console: a lesson playing, the module list ticking off, XP landing. */
export function LearningConsole({ modules, lesson }: { modules: { title: string; lessons: number }[]; lesson: string }) {
  return (
    <div aria-hidden="true" className="ld-keep-dark overflow-hidden rounded-[28px] bg-[#0b1433] shadow-[inset_0_0_0_1px_rgb(175_196_255/0.14),0_40px_80px_-40px_rgb(0_0_0/0.7)]">
      <div className="flex items-center gap-2 border-b border-[rgb(175_196_255/0.1)] px-5 py-3">
        <span className="size-2.5 rounded-full bg-[#ff7a59]" />
        <span className="size-2.5 rounded-full bg-[#afc4ff]/50" />
        <span className="size-2.5 rounded-full bg-[#afc4ff]/25" />
        <span className="ml-3 font-mono text-[12px] text-[#7d8ec0]">docerity.com/academy/web-development</span>
      </div>
      <div className="grid md:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
        <div className="p-5 sm:p-6">
          <div className="relative grid aspect-[16/8] place-items-center overflow-hidden rounded-[18px] bg-[radial-gradient(90%_120%_at_20%_0%,#2e4b9a,transparent_60%),linear-gradient(160deg,#13296b,#08102e)]">
            <span className="ld-pulse grid size-16 place-items-center rounded-full bg-[#ff7a59] text-[#08102e] shadow-[0_0_0_10px_rgb(255_122_89/0.15)]">
              <PlayIcon className="ml-1 size-7" />
            </span>
            <span className="absolute bottom-4 left-5 max-w-[70%] text-left text-[15px] font-semibold text-white">{lesson}</span>
            <span className="absolute right-4 bottom-4 font-mono text-[12px] text-[#c9d5ff]">04:12 / 09:30</span>
            <span className="absolute inset-x-0 bottom-0 h-1 bg-[rgb(175_196_255/0.15)]">
              <span className="block h-full w-[44%] bg-[linear-gradient(90deg,#afc4ff,#ff7a59)]" />
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <span className="ld-pop inline-flex items-center gap-1.5 rounded-full bg-[#ff7a59] px-3 py-1.5 text-[13px] font-bold text-[#08102e]">
              <ZapIcon className="size-3.5" /> +10 XP
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(175_196_255/0.2)] px-3 py-1.5 text-[13px] font-semibold text-[#f4f5fa]">
              <StreakFlame lit className="size-4" /> 4-day streak
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgb(175_196_255/0.2)] px-3 py-1.5 text-[13px] text-[#c4cbe3]">Level 3</span>
          </div>
        </div>
        <ol className="hidden border-l border-[rgb(175_196_255/0.1)] p-5 md:block">
          {modules.slice(0, 6).map((module, index) => (
            <li key={module.title} className="flex items-center gap-3 border-b border-[rgb(175_196_255/0.08)] py-2.5 last:border-b-0">
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold",
                  index < 2 ? "bg-[#4cc59a] text-[#08102e]" : index === 2 ? "bg-[#ff7a59] text-[#08102e]" : "bg-[rgb(175_196_255/0.1)] text-[#7d8ec0]"
                )}
              >
                {index < 2 ? <CheckIcon className="size-3.5" /> : index + 1}
              </span>
              <span className={cn("min-w-0 flex-1 truncate text-[14px]", index <= 2 ? "text-[#f4f5fa]" : "text-[#7d8ec0]")}>{module.title}</span>
              <span className="font-mono text-[11px] text-[#7d8ec0]">{module.lessons}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/** A lesson playing, notes under it. */
export function WatchPicture() {
  return (
    <div aria-hidden="true" className="flex h-52 flex-col gap-3 bg-[radial-gradient(circle_at_70%_0%,rgb(64_110_230/0.5),transparent_60%)] p-5">
      <div className="relative grid flex-1 place-items-center rounded-2xl bg-[#13296b]">
        <span className="grid size-11 place-items-center rounded-full bg-[#ff7a59] text-[#08102e]">
          <PlayIcon className="ml-0.5 size-5" />
        </span>
        <span className="absolute inset-x-3 bottom-3 h-1 rounded-full bg-[rgb(175_196_255/0.2)]">
          <span className="ld-progress block h-full w-full origin-left rounded-full bg-[#afc4ff] [animation-duration:6s] [animation-iteration-count:infinite]" />
        </span>
      </div>
      <div className="grid gap-1.5">
        <span className="h-2 w-[85%] rounded-full bg-[rgb(175_196_255/0.22)]" />
        <span className="h-2 w-[60%] rounded-full bg-[rgb(175_196_255/0.14)]" />
      </div>
    </div>
  );
}

/** Quiz options, the right one ticking green. */
export function CheckPicture() {
  return (
    <div aria-hidden="true" className="flex h-52 flex-col justify-center gap-2.5 bg-[linear-gradient(160deg,#dfe6fb,#c7d5fd)] px-5 text-[#08102e]">
      {["Prints 2", "TypeError: assignment to constant", "Prints undefined"].map((option, index) => (
        <span
          key={option}
          className={cn(
            "flex items-center gap-3 rounded-xl border bg-[rgb(251_251_253/0.9)] px-3 py-2.5 text-[13.5px] font-medium",
            index === 1 ? "border-[#4cc59a] shadow-[0_0_0_3px_rgb(76_197_154/0.18)]" : "border-[rgb(8_16_46/0.08)]"
          )}
        >
          <span className={cn("grid size-6 place-items-center rounded-lg text-[11px] font-bold", index === 1 ? "bg-[#4cc59a] text-white" : "bg-[#e8eaf0] text-[#4f556b]")}>
            {index === 1 ? <CheckIcon className="size-3.5" /> : "ABC"[index]}
          </span>
          {option}
        </span>
      ))}
    </div>
  );
}

/** A deploy log ending in a live link. */
export function ShipPicture() {
  return (
    <div aria-hidden="true" className="flex h-52 flex-col justify-center bg-[#112358] px-5 font-mono text-[12.5px] leading-[2] text-[#adb0bd]">
      <span className="ld-log-line">
        <span className="text-[#7d8ec0]">$</span> git push origin main
      </span>
      <span className="ld-log-line [animation-delay:0.6s]">
        <span className="text-[#8de3b6]">✓</span> Build finished in 24s
      </span>
      <span className="ld-log-line [animation-delay:1.2s]">
        <span className="text-[#8de3b6]">✓</span> Deployed to production
      </span>
      <span className="ld-log-line mt-1 inline-flex w-fit items-center gap-2 rounded-full bg-[#ff7a59] px-3 font-sans text-[12.5px] font-bold text-[#08102e] [animation-delay:1.8s]">
        ada-portfolio.vercel.app ↗
      </span>
    </div>
  );
}
