import { Resend } from "resend";

import { siteConfig } from "@/lib/config/site";

/*
  Resend replaces the portfolio's nodemailer + EJS pair. Two reasons beyond
  preference: SMTP credentials in env vars mean any code path can send mail as
  you, and nodemailer's SMTP connections are a poor fit for short-lived
  serverless invocations. Resend is an HTTPS call with a scoped API key.
*/

let client: Resend | null = null;

function getClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  client ??= new Resend(apiKey);
  return client;
}

/*
  The From address must be on a domain verified with Resend. Until docerity.com
  is verified, Resend's shared `onboarding@resend.dev` sender works for testing
  but can only deliver to your own account address.

  Replies must reach a mailbox you actually read, which is why `replyTo` is set
  separately from `from` throughout.
*/
const FROM = process.env.CONTACT_FROM_EMAIL ?? "Docerity <onboarding@resend.dev>";
const OWNER = process.env.CONTACT_TO_EMAIL ?? siteConfig.email;

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

type SendResult = { ok: true } | { ok: false; error: string };

async function sendEmail({ to, subject, html, replyTo }: SendArgs): Promise<SendResult> {
  const resend = getClient();

  /*
    No key configured is a deployment state, not a bug: local development and
    preview builds should not need one. The caller decides what to do about a
    failed send — for enquiries, the record is already saved, so the visitor
    still gets a success response and the lead is not lost.
  */
  if (!resend) {
    console.warn("[email] RESEND_API_KEY is not set — skipping send to", to);
    return { ok: false, error: "Email is not configured." };
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });

    if (error) {
      console.error("[email] Resend rejected the message:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (reason) {
    const error = reason instanceof Error ? reason.message : "Unknown email error";
    console.error("[email] send threw:", reason);
    return { ok: false, error };
  }
}

export { sendEmail, FROM, OWNER };
export type { SendResult };
