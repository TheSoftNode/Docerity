import nodemailer, { type Transporter } from "nodemailer";

import { email as emailConfig } from "@/lib/config/env";
import { ServiceUnavailableError } from "@/lib/core/errors";

/**
 * Gmail SMTP transport, tuned for a serverless runtime.
 *
 * Connection pooling is deliberately off. Pooling is the right default for a
 * long-running server, but a serverless instance is frozen between
 * invocations: a pooled socket is dead when the instance thaws, and nodemailer
 * discovers that only by timing out mid-send. A fresh connection per send
 * costs a handshake and is reliable.
 *
 * The timeouts matter more than they look. Gmail will hold a TCP connection
 * open without responding when the account is rate limited, and with
 * nodemailer's defaults that hangs until the platform kills the function —
 * turning a slow email into a failed request. These cap the total attempt well
 * inside the route's `maxDuration`.
 */

let cached: Transporter | null = null;

export function getTransport(): Transporter {
  if (!emailConfig.isConfigured) {
    throw new ServiceUnavailableError(
      "Email isn't available right now. Please try again shortly."
    );
  }

  if (cached) return cached;

  const { host, port, user, password } = emailConfig.credentials;

  cached = nodemailer.createTransport({
    host,
    port,
    /* Port 465 is implicit TLS; 587 upgrades via STARTTLS after connecting. */
    secure: port === 465,
    auth: {
      user,
      /*
        Must be a Google App Password, not the account password. Google
        disabled password auth for SMTP in May 2022, and the failure is an
        opaque "Username and Password not accepted" that looks like a typo.
      */
      pass: password,
    },
    pool: false,
    connectionTimeout: 10_000,
    greetingTimeout: 8_000,
    socketTimeout: 15_000,
    /* Refuse to continue if the server's certificate does not validate, rather
       than silently downgrading to an unauthenticated channel. */
    tls: { rejectUnauthorized: true, minVersion: "TLSv1.2" },
  });

  return cached;
}

/** Drops the cached transport so the next send reconnects. */
export function resetTransport() {
  cached?.close?.();
  cached = null;
}

/**
 * Proves the credentials work without sending anything.
 *
 * Worth having as an explicit check: an App Password that was revoked fails
 * identically to a wrong one, and discovering that from a silently
 * undelivered enquiry is expensive.
 */
export async function verifyTransport(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await getTransport().verify();
    return { ok: true };
  } catch (error) {
    resetTransport();
    return { ok: false, error: error instanceof Error ? error.message : "Unknown SMTP error" };
  }
}
