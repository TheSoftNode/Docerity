import { cn } from "@/lib/utils";
import { PROJECT_STATUS_LABELS, type ProjectStatus } from "@/lib/account/rules";

/*
  Small pieces the portal pages share, so a status or a progress bar looks the
  same on the overview and on a project.
*/

const STATUS_TONE: Record<ProjectStatus, string> = {
  planning: "bg-muted text-muted-foreground",
  "in-progress": "bg-primary/10 text-primary",
  review: "bg-[#ff7a59]/15 text-[#b4401f] dark:text-[#ff9a80]",
  paused: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  done: "bg-brand-teal/15 text-brand-teal",
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const key = (status in PROJECT_STATUS_LABELS ? status : "planning") as ProjectStatus;
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_TONE[key], className)}>{PROJECT_STATUS_LABELS[key]}</span>;
}

export function ProgressBar({ value, size = "md", label }: { value: number; size?: "md" | "lg"; label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className={cn("w-full overflow-hidden rounded-full bg-muted", size === "lg" ? "h-3" : "h-2")}
    >
      <div className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out" style={{ width: `${value}%` }} />
    </div>
  );
}

export function PortalCard({ title, children, className, action }: { title?: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <section aria-label={title} className={cn("rounded-[20px] border border-border bg-card p-6", className)}>
      {title ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-heading text-[22px] font-bold tracking-[-0.02em] text-foreground">{title}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Progress as a ring: the number large in the middle, a short line under it.
 * On the dark tiles it draws in tint, on light ones in the deep blue. The
 * ring is decoration; the number is the content and is read out as text.
 */
export function ProgressRing({
  value,
  size = 132,
  stroke = 10,
  tone = "dark",
  caption,
  numberClass,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: "dark" | "light";
  caption?: string;
  numberClass?: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, Math.max(0, value)) / 100);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg aria-hidden width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className={tone === "dark" ? "stroke-[rgb(175_196_255/0.16)]" : "stroke-muted"} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-[stroke-dashoffset] duration-1000 ease-out", tone === "dark" ? "stroke-[#afc4ff]" : "stroke-primary")}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center">
        <span className="text-center">
          <span className={cn("block font-heading leading-none font-extrabold tracking-[-0.045em]", numberClass ?? "text-[32px]")}>{value}%</span>
          {caption ? <span className={cn("mt-1.5 block text-xs", tone === "dark" ? "text-[#9aa7cf]" : "text-muted-foreground")}>{caption}</span> : null}
        </span>
      </span>
    </div>
  );
}

/** The status pill for a dark tile: the same words, in colours that read on navy. */
const DARK_TONE: Record<ProjectStatus, string> = {
  planning: "bg-[rgb(244_245_250/0.1)] text-[#c4cbe3]",
  "in-progress": "bg-[rgb(175_196_255/0.14)] text-[#afc4ff]",
  review: "bg-[#ff7a59]/20 text-[#ff9a80]",
  paused: "bg-amber-400/15 text-amber-300",
  done: "bg-[#4cc59a]/15 text-[#4cc59a]",
};

export function StatusPillOnDark({ status, className }: { status: string; className?: string }) {
  const key = (status in PROJECT_STATUS_LABELS ? status : "planning") as ProjectStatus;
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", DARK_TONE[key], className)}>{PROJECT_STATUS_LABELS[key]}</span>;
}

/** Where a request is on its way: three dots on a line, the current one in coral. */
export function RequestTrack({ step, label }: { step: number; label: string }) {
  return (
    <span className="inline-flex items-center">
      <span aria-hidden className="inline-flex items-center">
        {[0, 1, 2].map((index) => (
          <span key={index} className="inline-flex items-center">
            {index > 0 ? <span className={cn("h-0.5 w-6", index <= step ? "bg-primary" : "bg-border")} /> : null}
            <span
              className={cn(
                "size-2.5 rounded-full",
                index < step && "bg-primary",
                index === step && "bg-[#ff7a59] shadow-[0_0_0_4px_rgb(255_122_89/0.18)]",
                index > step && "bg-border"
              )}
            />
          </span>
        ))}
      </span>
      <span className="ml-3 text-[13px] font-semibold text-foreground">{label}</span>
    </span>
  );
}
