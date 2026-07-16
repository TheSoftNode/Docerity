import { NextResponse } from "next/server";

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || !isValidEmail(body.email)) {
    return NextResponse.json(
      { ok: false, error: "A valid email is required." },
      { status: 400 }
    );
  }

  // Delivery is a placeholder: logs the subscriber server-side until a real
  // mailing-list integration (e.g. Resend Audiences, Buttondown) is wired in.
  console.log("[subscribe]", {
    email: body.email,
    subscribedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
