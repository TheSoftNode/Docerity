import type { Metadata } from "next";

import { requireStaff } from "@/lib/auth/dal";
import { ClientProjectEditor } from "@/components/admin/client-project-editor";

export const metadata: Metadata = { title: "New client project" };

export default async function NewClientProjectPage() {
  await requireStaff("/admin/client-projects/new");
  return <ClientProjectEditor />;
}
