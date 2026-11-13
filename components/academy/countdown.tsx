"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { timeLeft } from "@/lib/academy/battles";
import { cn } from "@/lib/utils";

/**
 * Time left until `to`, ticking each second. Before the page has hydrated it
 * shows `fallback` (the deadline as a date), so the server and the browser
 * agree on the first paint. At zero it refreshes the page once, so the next
 * phase appears without a reload.
 */
export function Countdown({ to, fallback, className, variant = "text" }: { to: string; fallback: string; className?: string; variant?: "text" | "tiles" }) {
  const router = useRouter();
  const [left, setLeft] = useState<number | null>(null);
  const refreshed = useRef(false);

  useEffect(() => {
    const target = Date.parse(to);
    const tick = () => {
      const ms = target - Date.now();
      setLeft(ms);
      if (ms <= 0 && !refreshed.current) {
        refreshed.current = true;
        router.refresh();
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [to, router]);

  if (variant === "tiles") {
    const ms = Math.max(0, left ?? 0);
    const parts = [
      { label: "days", value: Math.floor(ms / 86_400_000) },
      { label: "hours", value: Math.floor((ms % 86_400_000) / 3_600_000) },
      { label: "min", value: Math.floor((ms % 3_600_000) / 60_000) },
      { label: "sec", value: Math.floor((ms % 60_000) / 1000) },
    ];
    return (
      <span className={cn("flex gap-2", className)} role="timer" aria-label={left === null ? fallback : `${timeLeft(left)} left`}>
        {parts.map((part) => (
          <span key={part.label} className="grid min-w-[64px] justify-items-center rounded-[16px] bg-[rgb(175_196_255/0.08)] px-2 py-2.5 ring-1 ring-[rgb(175_196_255/0.14)] sm:min-w-[76px]">
            <span className="ld-display text-[clamp(26px,3vw,38px)] leading-none font-extrabold tabular-nums" suppressHydrationWarning>
              {left === null ? "--" : String(part.value).padStart(2, "0")}
            </span>
            <span className="mt-1 text-[11.5px] text-[#9aa7cf]">{part.label}</span>
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className={className} suppressHydrationWarning>
      {left === null ? fallback : timeLeft(left)}
    </span>
  );
}
