"use client";

import { useActionState } from "react";
import { KeyRoundIcon, LoaderCircleIcon } from "lucide-react";

import { acceptInvite, type InviteState } from "@/app/admin/invite/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function InviteForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<InviteState, FormData>(
    acceptInvite,
    undefined
  );

  return (
    <form action={action} className="mt-8 space-y-5">
      {/* The token travels in the form rather than being read from the URL on
          the server, so the action has it without the page having to pass a
          closure over it. It is validated on every submit regardless. */}
      <input type="hidden" name="token" value={token} />

      <div className="space-y-2">
        <Label htmlFor="password">Choose a password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          autoFocus
          className="h-10"
        />
        <p className="text-xs text-muted-foreground">
          At least 12 characters. A passphrase is easier to remember and harder
          to guess than something with a symbol jammed in the middle.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm">Again</Label>
        <Input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={12}
          required
          className="h-10"
        />
      </div>

      {state?.message ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
        >
          {state.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="h-11 w-full text-sm">
        {pending ? (
          <>
            <LoaderCircleIcon className="animate-spin" />
            Setting it up
          </>
        ) : (
          <>
            <KeyRoundIcon />
            Set my password and sign in
          </>
        )}
      </Button>
    </form>
  );
}

export { InviteForm };
