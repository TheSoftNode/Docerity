"use client";

import { useActionState } from "react";

import { saveProfile, type ProfileState } from "@/app/account/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Name and company, saved in place. */
function ProfileForm({ name, company }: { name: string; company: string }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(saveProfile, undefined);
  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Your name</Label>
        <Input id="name" name="name" defaultValue={name} required minLength={2} maxLength={120} autoComplete="name" className="h-11" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input id="company" name="company" defaultValue={company} maxLength={160} autoComplete="organization" className="h-11" />
      </div>
      {state?.message ? (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      ) : null}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving" : "Save"}
        </Button>
        {state?.saved ? (
          <span role="status" className="text-sm font-medium text-brand-teal">
            Saved
          </span>
        ) : null}
      </div>
    </form>
  );
}

export { ProfileForm };
