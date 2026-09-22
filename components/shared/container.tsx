import { cn } from "@/lib/utils";

/**
 * The page shell. Width, gutters and large-display growth all live in the
 * `doc-shell` utility (see `app/globals.css`) so the navbar, every section
 * and the footer share one edge.
 */
function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("doc-shell", className)} {...props} />;
}

export { Container };
