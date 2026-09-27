"use client";

import { useState, useTransition } from "react";
import { DownloadIcon, LoaderCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { importBuiltInProjects } from "@/app/admin/work/actions";

/**
 * Moves the projects in `work-data.ts` into the database.
 *
 * Offered while the collection is empty, and afterwards whenever the file has
 * projects the database does not: adding a batch to the file is how they
 * arrive, and with no way to pull them in they would render on the site and be
 * uneditable here.
 *
 * Safe to press twice. The import compares slugs and inserts only what is
 * missing, so it cannot overwrite a project edited here.
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
        Import the built-in projects
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
