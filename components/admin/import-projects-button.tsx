"use client";

import { useState, useTransition } from "react";
import { DownloadIcon, LoaderCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { importBuiltInProjects } from "@/app/admin/work/actions";

/**
 * Moves the twenty-five projects in `work-data.ts` into the database.
 *
 * Only offered while the collection is empty, which is the one time it is the
 * obvious thing to do. It is idempotent regardless, but a permanent Import
 * button beside real rows invites somebody to wonder whether it overwrites
 * them.
 */
function ImportProjectsButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const outcome = await importBuiltInProjects();
            setResult(
              outcome.ok
                ? outcome.imported === 0
                  ? "They are all in the database already."
                  : `Imported ${outcome.imported} ${outcome.imported === 1 ? "project" : "projects"}.`
                : outcome.message
            );
          })
        }
      >
        {pending ? <LoaderCircleIcon className="animate-spin" /> : <DownloadIcon />}
        Import the 25 existing projects
      </Button>

      {result ? (
        <p role="status" className="text-xs text-muted-foreground">
          {result}
        </p>
      ) : null}
    </div>
  );
}

export { ImportProjectsButton };
