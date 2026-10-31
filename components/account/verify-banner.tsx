"use client";

import { useActionState } from "react";
import { MailIcon } from "lucide-react";

import { resendVerification, type ResendState } from "@/app/account/actions";
import { Button } from "@/components/ui/button";

/** Shown until the address is confirmed: what to do, and a way to get the link again. */
function VerifyBanner({ email }: { email: string }) {
  const [state, action, pending] = useActionState<ResendState>(resendVerification, undefined);
  return (
    <div className="rounded-[20px] border border-border bg-card p-6 sm:p-8">
      <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
        <MailIcon className="size-6" />
      </span>
      <h2 className="mt-5 font-heading text-2xl font-bold tracking-[-0.02em] text-foreground">Confirm your email</h2>
      <p className="mt-2 max-w-[56ch] text-[15px] leading-relaxed text-muted-foreground">
        We sent a link to <span className="font-medium text-foreground">{email}</span>. Click it and your projects and requests appear here. Your
        work is matched to you by this address, which is why we check it first.
      </p>
      <form action={action} className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="submit" variant="outline" disabled={pending || state?.sent}>
          {state?.sent ? "Sent. Check your inbox" : pending ? "Sending" : "Send the link again"}
        </Button>
      </form>
    </div>
  );
}

export { VerifyBanner };
