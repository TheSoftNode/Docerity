"use client";

import { useActionState } from "react";
import { LoaderCircleIcon, LockIcon } from "lucide-react";

import { signIn, type LoginState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * `useActionState` rather than an onSubmit handler, so the form posts and
 * reports errors with JavaScript disabled or still loading. The action is the
 * form's `action`, which means the browser's own submission carries the
 * credentials if React has not hydrated yet.
 */
function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, undefined);

  return (
    <form action={action} className="mt-8 space-y-5">
      <input type="hidden" name="next" value={next} />

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          defaultValue={state?.email}
          /* Focused on load: this page has one job and nobody arrives here to
             read it. */
          autoFocus
          className="h-10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-10"
        />
      </div>

      {state?.message ? (
        /*
          `role="alert"` so a screen reader announces the failure. Without it
          the message appears silently and someone not looking at that part of
          the page has no idea the attempt failed.
        */
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
            Signing in
          </>
        ) : (
          <>
            <LockIcon />
            Sign in
          </>
        )}
      </Button>
    </form>
  );
}

export { LoginForm };
