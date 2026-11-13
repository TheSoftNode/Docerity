import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon, ArrowUpRightIcon } from "lucide-react";

import { requireStaff } from "@/lib/auth/dal";
import { database } from "@/lib/config/env";
import { getBriefs } from "@/lib/academy/pool";
import { AdminNoDatabase, AdminPageHeader } from "@/components/admin/admin-page-header";
import { BriefsEditor } from "@/components/admin/academy-briefs-editor";

export const metadata: Metadata = { title: "Project pool" };
export const dynamic = "force-dynamic";

/** The briefs students choose from: add, edit, reorder or remove them. */
export default async function AdminBriefsPage() {
  await requireStaff("/admin/academy/briefs");
  if (!database.isConfigured) return <AdminNoDatabase what="The Academy" />;
  const briefs = await getBriefs();
  return (
    <>
      <Link href="/admin/academy" className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeftIcon className="size-4" /> Academy
      </Link>
      <AdminPageHeader eyebrow="Academy" title="Project pool" description={`${briefs.length} projects students can take, build and hand in.`}>
        <Link href="/academy/projects" target="_blank" className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-semibold text-foreground">
          View the pool <ArrowUpRightIcon className="size-4" />
        </Link>
      </AdminPageHeader>
      <BriefsEditor initial={briefs} />
    </>
  );
}
