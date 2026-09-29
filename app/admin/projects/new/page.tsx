import type { Metadata } from "next";

import { requireStaff } from "@/lib/auth/dal";
import { database, storage } from "@/lib/config/env";
import { emptyProject } from "@/lib/content/project-schema";
import { ProjectEditor } from "@/components/admin/project-editor";
import { AdminNoDatabase, AdminPageHeader } from "@/components/admin/admin-page-header";

export const metadata: Metadata = { title: "New project" };

export default async function NewProjectPage() {
  await requireStaff("/admin/projects/new");

  if (!database.isConfigured) {
    return (
      <>
        <AdminPageHeader title="New project" />
        <div className="mt-6">
          <AdminNoDatabase what="Projects" />
        </div>
      </>
    );
  }

  /* The cloud name lets the editor preview an upload before the project has
     been saved. It is public: it appears in every delivery URL on the site. */
  const cloudName = storage.isConfigured ? storage.credentials.cloudName : "";

  return <ProjectEditor initial={emptyProject()} cloudName={cloudName} />;
}
