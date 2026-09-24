import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/dal";
import { database } from "@/lib/config/env";
import { listUsers } from "@/lib/repositories/user.repository";
import { AdminNoDatabase, AdminPageHeader } from "@/components/admin/admin-page-header";
import { UserAdmin, type AccountRow } from "@/components/admin/user-admin";

export const metadata: Metadata = { title: "Accounts" };

export default async function AdminUsersPage() {
  const user = await requireUser("/admin/users");

  if (!database.isConfigured) {
    return (
      <>
        <AdminPageHeader title="Accounts" description="Who can sign in here." />
        <div className="mt-6">
          <AdminNoDatabase what="Accounts" />
        </div>
      </>
    );
  }

  /*
    An editor sees their own account and nothing else.

    The rail hides this page for them, but hiding a link is not access control:
    the URL is typeable. The actions enforce the same rule independently with
    `requireOwner`, so this filter is about what is rendered rather than what is
    permitted.
  */
  const all = await listUsers();
  const visible = user.role === "owner" ? all : all.filter((row) => row.id === user.id);

  const accounts: AccountRow[] = visible.map((row) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    disabled: Boolean(row.disabledAt),
    lastLoginAt: row.lastLoginAt ? row.lastLoginAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  }));

  return (
    <>
      <AdminPageHeader
        title="Accounts"
        description={
          user.role === "owner"
            ? "Who can sign in. Owners manage accounts; editors write and moderate."
            : "Your account. Only an owner can add or change accounts."
        }
      />

      <UserAdmin
        accounts={accounts}
        currentUserId={user.id}
        isOwner={user.role === "owner"}
      />
    </>
  );
}
