import { cn } from "@/lib/utils";

function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card",
        className
      )}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden>
        <path
          d="M5 3v18l9.5-4.1c3.3-1.43 5-4 5-6.9s-1.7-5.47-5-6.9L5 3Z"
          className="fill-primary"
        />
      </svg>
    </span>
  );
}

export { BrandMark };
