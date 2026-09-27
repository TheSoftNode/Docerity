import { cn } from "@/lib/utils";

/**
 * One header for every admin page, so they do not each invent a heading size.
 *
 * The rule below is a gradient hairline rather than a flat grey border, which
 * is the one piece of the public site's language that costs nothing to carry
 * across: sapphire into violet, the same edge every card out there is framed
 * with. It is the full width of the content, so it reads as the page's own rule
 * rather than as decoration attached to the title.
 */
function AdminPageHeader({
  title,
  eyebrow,
  description,
  children,
  className,
}: {
  title: string;
  /** The small line above the title. Where it is, and what kind of thing it is. */
  eyebrow?: string;
  description?: string;
  /** Actions, aligned to the right of the title on wide screens. */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("pb-5", className)}>
      <div className="flex flex-col gap-4 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-2 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 max-w-[60ch] text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {children ? <div className="flex shrink-0 items-center gap-2">{children}</div> : null}
      </div>

      {/* The rule. Fades out to the right so it reads as an underline on the
          title rather than as a divider cutting the page in half. */}
      <span
        aria-hidden
        className="block h-px bg-[linear-gradient(to_right,var(--brand-primary),var(--brand-violet)_35%,var(--border)_75%,transparent)]"
      />
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
    <div className="rounded-xl border border-dashed border-border bg-card/30 px-6 py-12 text-center">
      <p className="font-heading text-sm font-semibold text-foreground">{title}</p>
      <p className="mx-auto mt-1.5 max-w-[46ch] text-sm text-muted-foreground">
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
    <div className="rounded-xl border border-dashed border-amber-500/40 bg-amber-500/[0.06] px-6 py-10 text-center">
      <p className="font-heading text-sm font-semibold text-foreground">
        No database connection
      </p>
      <p className="mx-auto mt-1.5 max-w-[52ch] text-sm text-muted-foreground">
        {what} are stored in MongoDB, and <code className="text-foreground">MONGODB_URI</code>{" "}
        is not set for this environment. Add it in the Vercel project settings,
        or in <code className="text-foreground">.env.local</code> for development.
      </p>
    </div>
  );
}

export { AdminPageHeader, AdminEmptyState, AdminNoDatabase };
