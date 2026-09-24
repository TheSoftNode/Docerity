import { randomBytes } from "node:crypto";

import { connectDB } from "@/lib/db/connect";
import { SubscriberModel } from "@/lib/db/models/subscriber.model";

export async function subscribe(email: string, source = "site") {
  await connectDB();

  /*
    An upsert rather than find-then-insert, so two submissions racing cannot
    both attempt an insert and have the unique index reject the second, which
    would surface as an error to somebody who simply double-clicked.

    `status` is in `$set` so re-subscribing after unsubscribing works;
    `unsubscribeToken` is in `$setOnInsert` so an existing subscriber's token
    is never rotated out from under a link they were already sent.
  */
  const result = await SubscriberModel.updateOne(
    { email },
    {
      $set: { status: "subscribed", unsubscribedAt: null },
      $setOnInsert: {
        email,
        unsubscribeToken: randomBytes(32).toString("base64url"),
        source,
      },
    },
    { upsert: true }
  );

  return { created: result.upsertedCount > 0 };
}

export async function unsubscribeByToken(token: string): Promise<boolean> {
  await connectDB();
  const result = await SubscriberModel.updateOne(
    { unsubscribeToken: token },
    { $set: { status: "unsubscribed", unsubscribedAt: new Date() } }
  );
  return result.matchedCount > 0;
}

export async function countSubscribers() {
  await connectDB();
  return SubscriberModel.countDocuments({ status: "subscribed" });
}

export async function listSubscribers(limit = 200) {
  await connectDB();
  return SubscriberModel.find()
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 1000))
    .select("email status source createdAt unsubscribedAt")
    .lean();
}

/** Every subscribed address, for the CSV export. No limit: it is the point. */
export async function listAllSubscribedEmails() {
  await connectDB();
  return SubscriberModel.find({ status: "subscribed" })
    .sort({ createdAt: 1 })
    .select("email createdAt source")
    .lean();
}

export async function countSubscribersByStatus() {
  await connectDB();
  const [subscribed, unsubscribed] = await Promise.all([
    SubscriberModel.countDocuments({ status: "subscribed" }),
    SubscriberModel.countDocuments({ status: "unsubscribed" }),
  ]);
  return { subscribed, unsubscribed, total: subscribed + unsubscribed };
}
