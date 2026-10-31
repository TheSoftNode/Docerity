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
