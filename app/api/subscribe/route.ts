import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db/connect";
import { SubscriberModel } from "@/lib/db/models/subscriber";

export const runtime = "nodejs";

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || !isValidEmail(body.email)) {
    return NextResponse.json(
      { ok: false, error: "A valid email is required." },
      { status: 400 }
    );
  }

  const email = body.email.trim().toLowerCase();

  try {
    await connectDB();
  } catch (reason) {
    console.error("[subscribe] database unavailable:", reason);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again shortly." },
      { status: 503 }
    );
  }

  /*
    An upsert rather than find-then-insert, so two submissions racing cannot
    create two rows — the unique index on `email` would reject the second and
    surface as an error to someone who simply double-clicked.

    Re-subscribing after unsubscribing sets the status back, which is why
    `status` is in `$set` rather than `$setOnInsert`.
  */
  await SubscriberModel.updateOne(
    { email },
    {
      $set: { status: "subscribed", unsubscribedAt: null },
      $setOnInsert: {
        email,
        /* 32 bytes of randomness, so the unsubscribe link is unguessable and
           needs no login to honour. */
        unsubscribeToken: randomBytes(32).toString("base64url"),
        source: "site",
      },
    },
    { upsert: true }
  );

  /*
    The same response whether this is a new subscriber or an existing one.
    Saying "you're already subscribed" would turn this endpoint into a way to
    test whether a given address is on your list.
  */
  return NextResponse.json({ ok: true });
}
