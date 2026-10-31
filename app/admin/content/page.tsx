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
        eyebrow="Editable copy"
        title="Page content"
        description="The written parts of the site that are not projects, posts or reviews."
      />

      {!database.isConfigured ? (
        <p className="mt-4 rounded-[20px] border border-border bg-card p-4 text-sm text-muted-foreground">
          There is no database configured, so these sections are showing the
          copy built into the site and cannot be edited. The pages themselves
          are unaffected.
        </p>
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {BLOCKS.map((block) => (
          <li key={block.key}>
            <Link
              href={`/admin/content/${block.key}`}
              className="group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-border bg-card p-6 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[0_18px_40px_-28px_rgb(8_16_46/0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              {/* Edited sections carry a coral edge, so the ones you have changed can be found at a glance. */}
              {edited.has(block.key) ? (
                <span
                  aria-hidden
                  className="absolute inset-y-5 left-0 w-[3px] rounded-r-full bg-[#ff7a59]"
                />
              ) : null}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[13px] font-semibold text-primary">
                    {block.page}
                  </p>
                  <h2 className="mt-1 font-heading text-[22px] leading-tight font-bold tracking-[-0.02em] text-foreground">
                    {block.title}
                  </h2>
                </div>
                <ArrowRightIcon className="mt-1 size-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>

              <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                {block.description}
              </p>

              {edited.has(block.key) ? (
                <p className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-teal/10 px-2.5 py-1 text-xs font-semibold text-brand-teal">
                  <CheckIcon className="size-3" />
                  Your version
                </p>
              ) : null}
              {edited.has(block.key) ? (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Not taking copy from the code. Reset it to pick up changes
                  shipped in a release.
                </p>
              ) : (
                <p className="mt-5 inline-flex w-fit items-center rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                  As it shipped
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
