import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "lucide-react";

import { requireStaff } from "@/lib/auth/dal";
import { database } from "@/lib/config/env";
import { createLogger } from "@/lib/core/logger";
import { listBlocks } from "@/lib/repositories/site-content.repository";
import { BLOCKS } from "@/lib/content/blocks/schema";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export const metadata: Metadata = { title: "Page content" };

const logger = createLogger("admin.content.index");

/**
 * Every page section that can be edited without a deploy.
 *
 * Each row says whether it is showing your version or the copy built into the
 * site, because that is the question somebody has when a change does not seem
 * to have taken: either it was never saved, or it was saved and the page is
 * cached.
 */
export default async function AdminContentPage() {
  await requireStaff("/admin/content");

  /* Which sections have been saved at least once. A failed read here degrades
     to "none of them", which is right: the site is rendering the built-in copy
     in that case too. */
  let edited = new Set<string>();
  if (database.isConfigured) {
    try {
      edited = new Set((await listBlocks()).map((block) => block.key));
    } catch (error) {
      logger.error("could not list saved content blocks", error);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Page content"
        description="The written parts of the site that are not projects, posts or reviews."
      />

      {!database.isConfigured ? (
        <p className="mt-4 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          There is no database configured, so these sections are showing the
          copy built into the site and cannot be edited. The pages themselves
          are unaffected.
        </p>
      ) : null}

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {BLOCKS.map((block) => (
          <li key={block.key}>
            <Link
              href={`/admin/content/${block.key}`}
              className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
                    {block.page}
                  </p>
                  <h2 className="mt-1.5 font-heading text-base font-medium text-foreground">
                    {block.title}
                  </h2>
                </div>
                <ArrowRightIcon className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>

              <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">
                {block.description}
              </p>

              <p className="mt-4 flex items-center gap-1.5 font-mono text-[0.625rem] uppercase tracking-[0.14em]">
                {edited.has(block.key) ? (
                  <>
                    <CheckIcon className="size-3 text-primary" />
                    <span className="text-primary">Your version</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">As it shipped</span>
                )}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
