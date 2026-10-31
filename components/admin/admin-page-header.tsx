import { cn } from "@/lib/utils";

/**
 * One header for every admin page, so they do not each invent a heading size:
 * the title large, in the site's display face, a plain line under it, and the
 * page's actions to the right on a wide screen.
 */
function AdminPageHeader({
  title,
  eyebrow,
  description,
  children,
  className,
}: {
  title: string;
  /** A short line above the title: where it is, or what kind of thing it is. */
  eyebrow?: string;
  description?: string;
  /** Actions, aligned to the right of the title on wide screens. */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("pb-7", className)}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? <p className="mb-2 text-sm font-medium text-primary">{eyebrow}</p> : null}
          <h1 className="font-heading text-[clamp(30px,3.4vw,44px)] leading-[1.02] font-extrabold tracking-[-0.04em] text-foreground">
            {title}
          </h1>
          {description ? <p className="mt-2.5 max-w-[62ch] text-base leading-relaxed text-muted-foreground">{description}</p> : null}
        </div>
        {children ? <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div> : null}
      </div>
    </header>
  );
}

/**
 * The empty state, used wherever a list has nothing in it.
 *
 * Every list here starts empty on a new deployment, and "no rows" with no
 * explanation reads as a bug rather than as a fact.
 */
function AdminEmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    /*
      A plain card with a real heading rather than a dashed box. Every list here
      starts empty, so this is the first thing somebody sees in half the tool,
      and it should read as a calm fact, not a component that failed to load.
    */
    <div className="rounded-[20px] border border-border bg-card px-6 py-14 text-center">
      <p className="font-heading text-xl font-bold tracking-[-0.02em] text-foreground">{title}</p>
      <p className="mx-auto mt-2 max-w-[46ch] text-[15px] leading-relaxed text-muted-foreground">
        {description}
      </p>
      {children ? <div className="mt-5 flex justify-center gap-2">{children}</div> : null}
    </div>
  );
}

/**
 * Shown instead of a list when MONGODB_URI is unset.
 *
 * Distinguished from "nothing here yet" on purpose. The two look identical
 * otherwise, and confusing them costs an hour of wondering why a submitted
 * review never arrived.
 */
function AdminNoDatabase({ what }: { what: string }) {
  return (
    <div className="rounded-[20px] border border-amber-500/40 bg-amber-500/[0.06] px-6 py-12 text-center">
      <p className="font-heading text-xl font-bold tracking-[-0.02em] text-foreground">
        No database connection
      </p>
      <p className="mx-auto mt-2 max-w-[52ch] text-[15px] leading-relaxed text-muted-foreground">
        {what} are stored in MongoDB, and <code className="text-foreground">MONGODB_URI</code>{" "}
        is not set for this environment. Add it in the Vercel project settings,
        or in <code className="text-foreground">.env.local</code> for development.
      </p>
    </div>
  );
}

export { AdminPageHeader, AdminEmptyState, AdminNoDatabase };
