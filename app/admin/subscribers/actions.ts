"use server";

import { revalidatePath } from "next/cache";

import { requireStaffOrThrow } from "@/lib/auth/dal";
import { isAppError } from "@/lib/core/errors";
import { createLogger } from "@/lib/core/logger";
import {
  deleteSubscriber,
  setSubscriberStatus,
} from "@/lib/repositories/subscriber.repository";

/**
 * Managing the mailing list by hand.
 *
 * People normally take themselves off with the link in the email, so these are
 * for the times that route does not exist: somebody replying "take me off" to
 * a human, a typo that should not sit in the list, or a request to be erased.
 *
 * Staff only, and re-checked in each action: these are POST endpoints against
 * the page's URL, reachable whether or not the page was ever rendered.
 */

const logger = createLogger("admin.subscribers");

export type SubscriberResult = { ok: true } | { ok: false; message: string };

export async function setSubscription(
  email: string,
  status: "subscribed" | "unsubscribed"
): Promise<SubscriberResult> {
  try {
    const user = await requireStaffOrThrow();

    if (!email) return { ok: false, message: "No address was named." };

    const changed = await setSubscriberStatus(email, status);
    if (!changed) return { ok: false, message: "That address is not on the list." };

    revalidatePath("/admin/subscribers");
    logger.info("subscription changed", { status, by: user.email });
    return { ok: true };
  } catch (error) {
    if (isAppError(error)) return { ok: false, message: error.publicMessage };
    logger.error("changing a subscription failed", error);
    return { ok: false, message: "That did not work. Please try again." };
  }
}

/**
 * Erasing an address.
 *
 * Unsubscribing is the usual answer, because it keeps the address on file and
 * so guarantees it is never mailed again. This is for erasure requests and for
 * addresses that should never have been there, and it does not prevent the
 * same person subscribing again later.
 *
 * The address is not logged. An erased address surviving in the log defeats
 * the point of erasing it.
 */
export async function removeSubscriber(email: string): Promise<SubscriberResult> {
  try {
    const user = await requireStaffOrThrow();

    if (!email) return { ok: false, message: "No address was named." };

    const removed = await deleteSubscriber(email);
    if (!removed) return { ok: false, message: "That address is not on the list." };

    revalidatePath("/admin/subscribers");
    logger.info("subscriber erased", { by: user.email });
    return { ok: true };
  } catch (error) {
    if (isAppError(error)) return { ok: false, message: error.publicMessage };
    logger.error("erasing a subscriber failed", error);
    return { ok: false, message: "That could not be removed. Please try again." };
  }
}
