import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon, PlusIcon } from "lucide-react";

import { requireStaff } from "@/lib/auth/dal";
import { database } from "@/lib/config/env";
import { projectProgress } from "@/lib/account/rules";
import { listClientProjects } from "@/lib/repositories/client-project.repository";
import { countAccounts } from "@/lib/repositories/client-account.repository";
import { AdminEmptyState, AdminNoDatabase, AdminPageHeader } from "@/components/admin/admin-page-header";
import { timeAgo } from "@/components/admin/admin-content";
import { ProgressBar, StatusPill } from "@/components/account/portal-ui";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Client projects" };

/**
 * The work clients follow in their accounts: each project with its client,
 * where it stands and when it last moved. Archived ones are a tab away.
 */
export default async function AdminClientProjectsPage({ searchParams }: { searchParams: Promise<{ archived?: string }> }) {
  await requireStaff("/admin/client-projects");
  const { archived } = await searchParams;
  const showArchived = archived === "1";

  const header = (
    <AdminPageHeader
      eyebrow="Clients"
      title="Client projects"
      description="What your clients see when they sign in: progress, milestones and every update you post."
    >
      {database.isConfigured ? (
        <Button nativeButton={false} render={<Link href="/admin/client-projects/new" />}>
          <PlusIcon />
          New project
        </Button>
      ) : null}
    </AdminPageHeader>
  );

  if (!database.isConfigured) {
    return (
      <>
        {header}
        <AdminNoDatabase what="Client projects" />
      </>
    );
  }

  const [projects, accounts] = await Promise.all([listClientProjects({ archived: showArchived }), countAccounts()]);

  return (
    <>
      {header}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Which projects" className="flex gap-2">
          {[
            { label: "Active", href: "/admin/client-projects", on: !showArchived },
            { label: "Archived", href: "/admin/client-projects?archived=1", on: showArchived },
          ].map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              aria-current={tab.on ? "page" : undefined}
              className={
                tab.on
                  ? "inline-flex h-9 items-center rounded-full border border-foreground bg-foreground px-4 text-sm font-medium text-background"
                  : "inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-sm font-medium text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              }
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <p className="text-sm text-muted-foreground">
          {accounts.verified} of {accounts.total} client {accounts.total === 1 ? "account" : "accounts"} confirmed
        </p>
      </div>

      {projects.length === 0 ? (
        <AdminEmptyState
          title={showArchived ? "Nothing archived" : "No client projects yet"}
          description={
            showArchived
              ? "Projects you archive move here, out of the client's view."
              : "Create one for a client's email address. It appears in their account as soon as they sign up and confirm that address."
          }
        >
          {!showArchived ? (
            <Button nativeButton={false} render={<Link href="/admin/client-projects/new" />}>
              <PlusIcon />
              New project
            </Button>
          ) : null}
        </AdminEmptyState>
      ) : (
        <ul className="grid gap-3">
          {projects.map((project) => {
            const progress = projectProgress(project.milestones, project.status);
            const latest = project.updates[0];
            return (
              <li key={String(project._id)}>
                <Link
                  href={`/admin/client-projects/${String(project._id)}`}
                  className="group grid gap-4 rounded-[20px] border border-border bg-card px-6 py-5 transition-[border-color,box-shadow] hover:border-foreground/20 hover:shadow-[0_14px_32px_-26px_rgb(8_16_46/0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] md:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="truncate font-heading text-xl font-bold tracking-[-0.02em] text-foreground">{project.title}</span>
                      <StatusPill status={project.status} />
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {project.clientName ? `${project.clientName} · ` : ""}
                      {project.clientEmail}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-semibold text-foreground">{progress}%</span>
                      <span className="text-muted-foreground">{latest ? `Updated ${timeAgo(latest.createdAt)}` : "No updates yet"}</span>
                    </div>
                    <div className="mt-2">
                      <ProgressBar value={progress} label={`${project.title}: ${progress}%`} />
                    </div>
                  </div>
                  <ArrowRightIcon className="hidden size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary md:block" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
