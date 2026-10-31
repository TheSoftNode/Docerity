"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { timeAgo } from "@/components/admin/admin-content";

/**
 * Keeps a page current without a reload: it asks the server for fresh data
 * every `everyMs` while the tab is visible, and straight away when the tab
 * comes back into view. Nothing runs while the tab is hidden. The line it
 * shows says when the page last checked, so "live" is something you can see.
 */
function LiveRefresh({ everyMs = 30_000 }: { everyMs?: number }) {
  const router = useRouter();
  const [checked, setChecked] = useState(() => new Date());
  const [, tick] = useState(0);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      router.refresh();
      setChecked(new Date());
    };
    const timer = window.setInterval(refresh, everyMs);
    /* Re-render the "checked" line every 15s so its wording stays true. */
    const clock = window.setInterval(() => tick((value) => value + 1), 15_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      window.clearInterval(clock);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router, everyMs]);

  return (
    <span className="inline-flex items-center gap-2 text-sm text-muted-foreground" aria-live="off">
      <span aria-hidden className="relative flex size-2.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-teal opacity-50 motion-reduce:hidden" />
        <span className="relative inline-flex size-2.5 rounded-full bg-brand-teal" />
      </span>
      Live · checked {timeAgo(checked)}
    </span>
  );
}

export { LiveRefresh };
