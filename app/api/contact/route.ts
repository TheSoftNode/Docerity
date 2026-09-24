import { NextResponse } from "next/server";

import {
  formatBytes,
  validateEnquiry,
  type EnquiryInput,
} from "@/lib/contact/schema";

/*
  Enquiries arrive as multipart/form-data so a PRD or spec can come with them.

  ── Delivery is not wired up yet ────────────────────────────────────────────
  Everything below validates the submission and then logs it. Nothing is
  emailed and no file is stored, so an enquiry sent in production reaches the
  function logs and nowhere else. Two integrations close that gap:

    1. Email — Resend (or similar) where `deliver()` is called below.
    2. Files — a route handler receives the whole body in memory and Vercel
       caps serverless request bodies at 4.5MB, which is why the limits in
       `lib/contact/schema.ts` sit under it. For larger documents the browser
       should upload straight to object storage (e.g. Vercel Blob's client
       upload) and post the resulting URLs here instead of the bytes.
  ────────────────────────────────────────────────────────────────────────────
*/

function field(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, errors: { form: "That submission couldn't be read." } },
      { status: 400 }
    );
  }

  // Bots fill in every field they find; people never see this one.
  if (field(form, "website").trim().length > 0) {
    // Answer as though it worked, so the bot has nothing to learn from.
    return NextResponse.json({ ok: true });
  }

  const input: EnquiryInput = {
    name: field(form, "name"),
    email: field(form, "email"),
    company: field(form, "company"),
    role: field(form, "role"),
    projectType: field(form, "projectType"),
    budget: field(form, "budget"),
    timeline: field(form, "timeline"),
    message: field(form, "message"),
  };

  const files = form
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  const errors = validateEnquiry(
    input,
    files.map((f) => ({ name: f.name, size: f.size, type: f.type }))
  );

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  const attachments = files.map((file) => ({
    name: file.name,
    type: file.type,
    size: formatBytes(file.size),
  }));

  console.log("[contact]", {
    ...input,
    attachments,
    attachmentCount: attachments.length,
    receivedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}

/*
  `export const config = { api: { bodyParser } }` is a Pages Router API and is
  ignored here, so the size ceiling is enforced in `validateEnquiry` instead —
  and by the platform, which rejects an oversized body before this code runs.
*/
export const runtime = "nodejs";
export const maxDuration = 15;
