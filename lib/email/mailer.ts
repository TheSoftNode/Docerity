import { email as emailConfig } from "@/lib/config/env";
import { createLogger } from "@/lib/core/logger";
import { describeError } from "@/lib/core/errors";
import { getTransport, resetTransport } from "@/lib/email/transport";

const logger = createLogger("email");

export type Message = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: { filename: string; path: string }[];
};

export type SendOptions = {
  /**
   * Absolute epoch-ms after which no further attempt is started.
   *
   * Without a deadline the retry budget is unbounded in the wrong direction:
   * three attempts at a 15s socket timeout plus backoff is ~46s for one
   * message, and two messages can exceed the route's `maxDuration`. The
   * platform then kills the function mid-send, so the delivery outcome is
   * never recorded and the enquiry looks unsent when it may not be.
   */
  deadline?: number;
};

export type DeliveryResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string; attempts: number };

/*
  SMTP failures divide into "try again" and "never going to work". Retrying an
  authentication failure just delays the same answer while burning the route's
  time budget; retrying a dropped connection usually succeeds. Gmail's 4xx
  codes are transient by definition, 5xx are permanent.
*/
const PERMANENT = /(invalid login|username and password not accepted|authentication failed|no recipients|5\.7\.\d|5\.1\.1)/i;

function isRetryable(error: unknown): boolean {
  const message = describeError(error);
  if (PERMANENT.test(message)) return false;
  return /timeout|econnreset|econnrefused|etimedout|socket|closed|4\.\d\.\d|temporar/i.test(
    message
  );
}

const MAX_ATTEMPTS = 3;

function backoffMs(attempt: number) {
  /* 400ms, 1200ms — bounded so three attempts still fit inside maxDuration. */
  return 400 * 3 ** (attempt - 1);
}

/**
 * Sends one message, retrying transient failures.
 *
 * Never throws. Delivery is deliberately best-effort everywhere it is used:
 * the record is written to MongoDB first, so a Gmail outage costs a
 * notification that can be recovered from the stored enquiry, not the enquiry
 * itself. Callers decide what a failure means; most record it and move on.
 */
export async function sendMail(
  message: Message,
  options: SendOptions = {}
): Promise<DeliveryResult> {
  if (!emailConfig.isConfigured) {
    logger.warn("email is not configured — skipping send", { to: message.to });
    return { ok: false, error: "Email is not configured.", attempts: 0 };
  }

  if (!message.to.trim()) {
    return { ok: false, error: "No recipient address.", attempts: 0 };
  }

  let lastError = "Unknown error";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const info = await getTransport().sendMail({
        /*
          Gmail rewrites From to the authenticated account unless the address
          is a verified "Send mail as" alias, so this is a request rather than
          a guarantee until that alias exists.
        */
        from: emailConfig.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        /* A plaintext alternative is not decoration: messages without one score
           worse in spam filters, and some clients render nothing else. */
        text: message.text,
        ...(message.replyTo ? { replyTo: message.replyTo } : {}),
        ...(message.attachments?.length ? { attachments: message.attachments } : {}),
      });

      logger.info("message sent", {
        to: message.to,
        subject: message.subject,
        messageId: info.messageId,
        attempt,
      });

      return { ok: true, messageId: String(info.messageId ?? "") };
    } catch (error) {
      lastError = describeError(error);

      /* A broken socket stays broken; force a new connection next attempt. */
      resetTransport();

      if (attempt === MAX_ATTEMPTS || !isRetryable(error)) {
        logger.error("message failed", error, {
          to: message.to,
          subject: message.subject,
          attempts: attempt,
          retryable: isRetryable(error),
        });
        return { ok: false, error: lastError, attempts: attempt };
      }

      const delay = backoffMs(attempt);

      /* Stop if the next attempt could not finish inside the budget. Giving up
         with a recorded reason beats being killed mid-attempt with none. */
      if (options.deadline && Date.now() + delay >= options.deadline) {
        logger.warn("send deadline reached, not retrying", {
          attempt,
          reason: lastError,
        });
        return { ok: false, error: `${lastError} (deadline reached)`, attempts: attempt };
      }

      logger.warn("send failed, retrying", { attempt, delay, reason: lastError });
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return { ok: false, error: lastError, attempts: MAX_ATTEMPTS };
}

/**
 * Sends several messages without letting one failure hide another.
 *
 * `Promise.all` would reject on the first failure and discard the results of
 * the rest; every send here is independent and each result is reported.
 */
export async function sendAll(
  messages: Message[],
  options: SendOptions = {}
): Promise<DeliveryResult[]> {
  const results: DeliveryResult[] = [];
  /* Sequential on purpose: Gmail throttles concurrent connections from one
     account, and two messages is not worth the risk of tripping that. */
  for (const message of messages) {
    results.push(await sendMail(message, options));
  }
  return results;
}
