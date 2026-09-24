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
