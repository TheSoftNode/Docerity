import { withRoute } from "@/lib/http/handler";
import { success } from "@/lib/http/responses";
import { ValidationError } from "@/lib/core/errors";
import { subscribe } from "@/lib/repositories/subscriber.repository";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const POST = withRoute("api.subscribe", async (request, { logger }) => {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!EMAIL.test(email)) {
    throw new ValidationError("A valid email address is required.", {
      fields: { email: "That email address doesn't look right." },
    });
  }

  const { created } = await subscribe(email);
  logger.info("subscription recorded", { created });

  /*
    The same response whether this address was new or already present. Saying
    "you're already subscribed" would turn this endpoint into a way to test
    whether a given person is on the list.
  */
  return success({ subscribed: true });
});
