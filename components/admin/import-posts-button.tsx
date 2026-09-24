"use client";

import { useState, useTransition } from "react";
import { DownloadIcon, LoaderCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { importBuiltInPosts } from "@/app/admin/posts/actions";

/**
 * Moves the eight posts that ship in `blog-data.ts` into the database.
 *
 * Only offered while the collection is empty, which is the only time it is the
 * obvious thing to do. It is idempotent regardless, so pressing it twice is
 * harmless, but a permanent "Import" button next to real posts invites somebody
 * to wonder whether it would overwrite them.
 */
function ImportPostsButton() {
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
            const outcome = await importBuiltInPosts();
            setResult(
              outcome.ok
                ? outcome.imported === 0
                  ? "They are all in the database already."
                  : `Imported ${outcome.imported} ${outcome.imported === 1 ? "post" : "posts"}.`
                : outcome.message
            );
          })
        }
      >
        {pending ? <LoaderCircleIcon className="animate-spin" /> : <DownloadIcon />}
        Import the built-in posts
      </Button>

      {result ? (
        <p role="status" className="text-xs text-muted-foreground">
          {result}
        </p>
      ) : null}
    </div>
  );
}

export { ImportPostsButton };
