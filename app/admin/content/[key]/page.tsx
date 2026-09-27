import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { requireStaff } from "@/lib/auth/dal";
import { database, storage } from "@/lib/config/env";
import { createLogger } from "@/lib/core/logger";
import { findBlock } from "@/lib/repositories/site-content.repository";
import { cleanBlock } from "@/lib/content/blocks/clean";
import { DEFAULTS } from "@/lib/content/blocks/defaults";
import { blockFor, isBlockKey } from "@/lib/content/blocks/schema";
import { BlockEditor } from "@/components/admin/block-editor";
import { AdminNoDatabase, AdminPageHeader } from "@/components/admin/admin-page-header";

const logger = createLogger("admin.content.editor");

export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>;
}): Promise<Metadata> {
  const { key } = await params;
  return { title: isBlockKey(key) ? blockFor(key).title : "Page content" };
}

export default async function AdminContentBlockPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;

  if (!isBlockKey(key)) notFound();

  await requireStaff(`/admin/content/${key}`);

  const block = blockFor(key);

  if (!database.isConfigured) {
    return (
      <>
        <AdminPageHeader title={block.title} description={block.description} />
        <div className="mt-6">
          <AdminNoDatabase what="Page content" />
        </div>
      </>
    );
  }

  /*
    The stored version if there is one, the built-in copy otherwise, and the
    built-in copy again if the read fails. The editor opening on the real copy
    rather than on a blank form is what makes the first edit a small change
    instead of a retype.
  */
  let stored = null;
  try {
    stored = await findBlock(key);
  } catch (error) {
    logger.error("could not load a content block for editing", error, { key });
  }

  /* Cleaned on the way in as well as on the way out, so a document written
     before a field existed opens with that field present and empty rather than
     as an uncontrolled input. */
  const initial = cleanBlock(key, stored?.data ?? DEFAULTS[key]);

  const cloudName = storage.isConfigured ? storage.credentials.cloudName : "";

  return (
    <BlockEditor
      block={block}
      initial={initial}
      cloudName={cloudName}
      overridden={Boolean(stored)}
      updatedBy={stored?.updatedBy ?? ""}
      updatedAt={
        stored?.updatedAt
          ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(stored.updatedAt)
          : ""
      }
    />
  );
}
