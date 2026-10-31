"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LoaderCircleIcon } from "lucide-react";

import {
  requestAccountReset,
  resetAccountPassword,
  signInAccount,
  signUp,
  type ForgotState,
  type ResetState,
  type SignInState,
  type SignUpState,
} from "@/app/account/actions";
import { ACCOUNT_PASSWORD_MIN } from "@/lib/account/rules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/*
  The client portal's forms. Server Actions behind each, so they work without
  JavaScript and no password is ever in a URL; errors are announced to screen
  readers where they appear.
*/

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {children}
    </p>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  aside,
  ...input
}: React.ComponentProps<typeof Input> & { id: string; label: string; error?: string; hint?: string; aside?: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={id}>{label}</Label>
        {aside}
      </div>
      <Input id={id} name={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} className="h-11" {...input} />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function Submit({ pending, children, busy }: { pending: boolean; children: React.ReactNode; busy: string }) {
  return (
    <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
      {pending ? (
        <>
          <LoaderCircleIcon className="animate-spin" />
          {busy}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

/** Shown in place of a form once an email has gone out. */
function Sent({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div role="status" className="mt-8 rounded-[20px] border border-border bg-card p-6">
      <p className="font-heading text-xl font-bold tracking-[-0.02em] text-foreground">{title}</p>
      <div className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

export function AccountSignInForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(signInAccount, undefined);
  return (
    <form action={action} className="mt-8 space-y-5">
      <input type="hidden" name="next" value={next} />
      <Field id="email" label="Email" type="email" autoComplete="email" required autoFocus defaultValue={state?.email ?? ""} />
      <Field
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        aside={
          <Link href="/account/forgot" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            Forgot it?
          </Link>
        }
      />
      {state?.message ? <Alert>{state.message}</Alert> : null}
      <Submit pending={pending} busy="Signing in">
        Sign in
      </Submit>
    </form>
  );
}

export function AccountSignUpForm() {
  const [state, action, pending] = useActionState<SignUpState, FormData>(signUp, undefined);

  if (state?.sent) {
    return (
      <Sent title="Check your inbox">
        We&apos;ve sent a link to <span className="font-medium text-foreground">{state.sent}</span>. Click it to confirm your address and
        your account is ready. It can take a minute; check spam if it hasn&apos;t arrived.
      </Sent>
    );
  }

  const values = state?.values;
  return (
    <form action={action} className="mt-8 space-y-5" noValidate>
      {/* Hidden from people; a bot that fills every field fills this one too. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <Field id="name" label="Your name" autoComplete="name" required autoFocus defaultValue={values?.name ?? ""} error={state?.errors?.name} />
      <Field id="email" label="Email" type="email" autoComplete="email" required defaultValue={values?.email ?? ""} error={state?.errors?.email} hint="Use the address you contacted us from, so your projects find you." />
      <Field id="company" label="Company" autoComplete="organization" defaultValue={values?.company ?? ""} hint="Optional." />
      <Field
        id="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        required
        minLength={ACCOUNT_PASSWORD_MIN}
        error={state?.errors?.password}
        hint={`At least ${ACCOUNT_PASSWORD_MIN} characters. A short phrase is easiest to remember.`}
      />
      {state?.message ? <Alert>{state.message}</Alert> : null}
      <Submit pending={pending} busy="Creating your account">
        Create account
      </Submit>
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2">
          terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          privacy policy
        </Link>
        .
      </p>
    </form>
  );
}

export function AccountForgotForm() {
  const [state, action, pending] = useActionState<ForgotState, FormData>(requestAccountReset, undefined);
  if (state?.sent) {
    return (
      <Sent title="Check your inbox">
        If <span className="font-medium text-foreground">{state.email}</span> has an account, a reset link is on its way. It works once, for an
        hour.{" "}
        <a href="/account/forgot" className="font-medium text-primary underline-offset-4 hover:underline">
          Try another address
        </a>
      </Sent>
    );
  }
  return (
    <form action={action} className="mt-8 space-y-5">
      <Field id="email" label="Email" type="email" autoComplete="email" required autoFocus defaultValue={state?.email ?? ""} />
      {state?.message ? <Alert>{state.message}</Alert> : null}
      <Submit pending={pending} busy="Sending">
        Email me a reset link
      </Submit>
    </form>
  );
}

export function AccountResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ResetState, FormData>(resetAccountPassword, undefined);
  return (
    <form action={action} className="mt-8 space-y-5">
      <input type="hidden" name="token" value={token} />
      <Field id="password" label="New password" type="password" autoComplete="new-password" required autoFocus minLength={ACCOUNT_PASSWORD_MIN} hint={`At least ${ACCOUNT_PASSWORD_MIN} characters.`} />
      <Field id="confirm" label="Again" type="password" autoComplete="new-password" required minLength={ACCOUNT_PASSWORD_MIN} />
      {state?.message ? <Alert>{state.message}</Alert> : null}
      <Submit pending={pending} busy="Saving">
        Save and sign in
      </Submit>
    </form>
  );
}
