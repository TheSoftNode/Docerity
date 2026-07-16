import { NextResponse } from "next/server";

type ContactPayload = {
  name: string;
  email: string;
  projectType: string;
  message: string;
};

function isContactPayload(value: unknown): value is ContactPayload {
  if (typeof value !== "object" || value === null) return false;
  const payload = value as Record<string, unknown>;
  return (
    typeof payload.name === "string" &&
    payload.name.trim().length > 0 &&
    typeof payload.email === "string" &&
    payload.email.trim().length > 0 &&
    typeof payload.projectType === "string" &&
    typeof payload.message === "string" &&
    payload.message.trim().length > 0
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!isContactPayload(body)) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields." },
      { status: 400 }
    );
  }

  // Delivery is a placeholder: logs the lead server-side until a real
  // email/CRM integration (e.g. Resend) is wired in here.
  console.log("[contact]", {
    ...body,
    receivedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
