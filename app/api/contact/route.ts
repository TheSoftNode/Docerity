import { NextResponse } from "next/server";

import { validateEnquiry, type EnquiryInput } from "@/lib/contact/schema";
import { connectDB } from "@/lib/db/connect";
import { EnquiryModel } from "@/lib/db/models/enquiry";
import { OWNER, sendEmail } from "@/lib/email/client";
import {
  renderEnquiryAcknowledgement,
  renderEnquiryNotification,
} from "@/lib/email/templates/enquiry";
import { clientIp, tooManyRecently } from "@/lib/api/rate-limit";

/*
  Enquiries arrive as JSON. Attachments are uploaded by the browser straight to
  Blob storage first (see `./upload/route.ts`) and only their URLs are posted
  here, so the request body stays small no matter how large the files are.

  Order matters below: the enquiry is written to the database *before* any email
  is attempted. Notification is best-effort — a Resend outage or a bad API key
  costs you an inbox alert you can recover from the admin list, whereas the
  reverse order would lose the lead entirely.
*/

export const runtime = "nodejs";
export const maxDuration = 20;

type Attachment = { name: string; url: string; contentType: string; size: number };

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/* Attachment metadata is client-supplied, so it is re-validated rather than
   trusted. A URL that is not on Blob's domain is dropped: without this check a
   caller could store a link to anywhere and have it rendered, as a Docerity
   email, to you. */
function parseAttachments(value: unknown): Attachment[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): Attachment[] => {
    if (typeof entry !== "object" || entry === null) return [];
    const record = entry as Record<string, unknown>;
    const url = text(record.url);
    const name = text(record.name);
    const size = typeof record.size === "number" ? record.size : 0;

    let host: string;
    try {
      host = new URL(url).hostname;
    } catch {
      return [];
    }
    if (!host.endsWith(".blob.vercel-storage.com")) return [];
    if (!name) return [];

    return [{ name, url, contentType: text(record.contentType), size }];
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!body) {
    return NextResponse.json(
      { ok: false, errors: { form: "That submission couldn't be read." } },
      { status: 400 }
    );
  }

  // Bots fill in every field they find; people never see this one.
  if (text(body.website).trim().length > 0) {
    // Answer as though it worked, so the bot has nothing to learn from.
    return NextResponse.json({ ok: true });
  }

  const input: EnquiryInput = {
    name: text(body.name),
    email: text(body.email),
    company: text(body.company),
    role: text(body.role),
    projectType: text(body.projectType),
    budget: text(body.budget),
    timeline: text(body.timeline),
    message: text(body.message),
  };

  const attachments = parseAttachments(body.attachments);

  const errors = validateEnquiry(
    input,
    attachments.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.contentType,
    }))
  );

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const ip = clientIp(request);

  try {
    await connectDB();
  } catch (reason) {
    console.error("[contact] database unavailable:", reason);
    return NextResponse.json(
      {
        ok: false,
        errors: {
          form: "Something went wrong saving your enquiry. Please try again, or email me directly.",
        },
      },
      { status: 503 }
    );
  }

  /* The honeypot stops naive bots; this stops someone holding the submit button
     down. Counted in the database rather than in memory because each serverless
     instance has its own memory and would each allow the full quota. */
  if (await tooManyRecently(EnquiryModel, ip, 5, 60)) {
    return NextResponse.json(
      {
        ok: false,
        errors: { form: "That's several enquiries in a row — please give it an hour." },
      },
      { status: 429 }
    );
  }

  const enquiry = await EnquiryModel.create({
    ...input,
    attachments,
    userAgent: request.headers.get("user-agent")?.slice(0, 400) ?? "",
    submittedFromIp: ip,
  });

  /* Both sends run together; neither blocks the response on the other. */
  const emailData = { ...input, attachments };

  const [notification] = await Promise.all([
    sendEmail({
      to: OWNER,
      subject: `New enquiry — ${input.name}${input.company ? ` (${input.company})` : ""}`,
      html: renderEnquiryNotification(emailData),
      /* So replying in your mail client answers the sender directly. */
      replyTo: input.email,
    }),
    sendEmail({
      to: input.email,
      subject: "Thanks — your enquiry reached Docerity",
      html: renderEnquiryAcknowledgement(emailData),
      replyTo: OWNER,
    }),
  ]);

  /* Recorded so a silently undelivered notification is visible in the admin
     list rather than looking like an enquiry you simply missed. */
  if (!notification.ok) {
    await EnquiryModel.updateOne(
      { _id: enquiry._id },
      { delivered: false, deliveryError: notification.error }
    );
  } else {
    await EnquiryModel.updateOne({ _id: enquiry._id }, { delivered: true });
  }

  return NextResponse.json({ ok: true });
}
