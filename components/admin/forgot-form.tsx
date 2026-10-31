"use client";

import { useActionState } from "react";
import { LoaderCircleIcon, MailIcon } from "lucide-react";

import { requestPasswordReset, type ForgotState } from "@/app/admin/reset/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Asks for the address to send a reset link to. Once sent, the form gives way
 * to the same message whatever the address was, so it says nothing about
 * which addresses have accounts.
 */
function ForgotForm() {
  const [state, action, pending] = useActionState<ForgotState, FormData>(requestPasswordReset, undefined);

  if (state?.sent) {
    return (
      <div className="mt-8 space-y-4">
        <p role="status" className="rounded-lg border border-border bg-muted/40 px-3 py-3 text-sm leading-relaxed text-foreground">
          If <span className="font-medium">{state.email}</span> belongs to an admin account, a reset link is on its way. It works
          once, for one hour. Check your spam folder if it hasn&apos;t arrived in a few minutes.
        </p>
        <p className="text-sm text-muted-foreground">
          Not sure which address you used?{" "}
          {/* A full load rather than a client navigation, so the form comes back empty. */}
          <a href="/admin/forgot" className="text-foreground underline underline-offset-4">
            Try another one
          </a>
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={state?.email ?? ""}
          required
          autoFocus
          className="h-10"
        />
      </div>

      {state?.message ? (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="h-11 w-full text-sm">
        {pending ? (
          <>
            <LoaderCircleIcon className="animate-spin" />
            Sending
          </>
        ) : (
          <>
            <MailIcon />
            Email me a reset link
          </>
        )}
      </Button>
    </form>
  );
}

export { ForgotForm };
