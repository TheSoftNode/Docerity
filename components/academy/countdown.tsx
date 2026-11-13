"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { timeLeft } from "@/lib/academy/battles";

/**
 * Time left until `to`, ticking each second. Before the page has hydrated it
 * shows `fallback` (the deadline as a date), so the server and the browser
 * agree on the first paint. At zero it refreshes the page once, so the next
 * phase appears without a reload.
 */
export function Countdown({ to, fallback, className }: { to: string; fallback: string; className?: string }) {
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

  return (
    <span className={className} suppressHydrationWarning>
      {left === null ? fallback : timeLeft(left)}
    </span>
  );
}
