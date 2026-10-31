"use client";

import { useActionState } from "react";
import { MailIcon } from "lucide-react";

import { resendVerification, type ResendState } from "@/app/account/actions";

/** Shown until the address is confirmed: what to do, and a way to get the link again. */
function VerifyBanner({ email }: { email: string }) {
  const [state, action, pending] = useActionState<ResendState>(resendVerification, undefined);
  return (
    <div className="rounded-[26px] bg-[#08102e] p-7 text-[#f4f5fa] sm:p-9">
      <span className="grid size-12 place-items-center rounded-full bg-[#afc4ff] text-[#08102e]">
        <MailIcon className="size-6" />
      </span>
      <h2 className="mt-5 font-heading text-[34px] leading-none font-extrabold tracking-[-0.035em]">Confirm your email</h2>
      <p className="mt-3 max-w-[56ch] text-[15px] leading-relaxed text-[#c4cbe3]">
        We sent a link to <span className="font-medium text-[#f4f5fa]">{email}</span>. Click it and your projects and requests appear here. Your
        work is matched to you by this address, which is why we check it first.
      </p>
      <form action={action} className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending || state?.sent}
          className="inline-flex h-11 items-center rounded-full bg-[#afc4ff] px-5 text-[15px] font-bold text-[#08102e] transition-transform hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {state?.sent ? "Sent. Check your inbox" : pending ? "Sending" : "Send the link again"}
        </button>
      </form>
    </div>
  );
}

export { VerifyBanner };
