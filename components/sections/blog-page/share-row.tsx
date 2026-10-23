"use client";

import { useState } from "react";
import { CheckIcon, LinkIcon } from "lucide-react";

/**
 * Copy the link, or share it to LinkedIn or X through their own share pages.
 * No third-party scripts: the share links are plain URLs.
 */
function ShareRow({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const encoded = encodeURIComponent(url);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      /* Clipboard refused (an insecure context, or a denied permission): the
         address bar still has it, so this fails quietly. */
    }
  }

  const circle =
    "grid size-[38px] place-items-center rounded-full border border-[var(--ld-line-2)] text-[13px] font-bold transition-colors hover:border-[var(--ld-ink)] hover:bg-[var(--ld-ink)] hover:text-[var(--ld-paper)]";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={copy}
        className="inline-flex min-h-[38px] items-center gap-2 rounded-full border border-[var(--ld-line-2)] px-3.5 text-[13px] font-semibold transition-colors hover:border-[var(--ld-ink)]"
      >
        {copied ? <CheckIcon aria-hidden="true" className="size-3.5" /> : <LinkIcon aria-hidden="true" className="size-3.5" />}
        {copied ? "Copied" : "Copy link"}
      </button>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className={circle}
      >
        in
      </a>
      <a
        href={`https://x.com/intent/post?url=${encoded}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className={circle}
      >
        𝕏
      </a>
      <span aria-live="polite" className="sr-only">
        {copied ? "Link copied" : ""}
      </span>
    </div>
  );
}

export { ShareRow };
