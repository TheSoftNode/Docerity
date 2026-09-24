import { randomUUID } from "node:crypto";

import { createLogger, type Logger } from "@/lib/core/logger";
import { AppError, RateLimitError, isAppError } from "@/lib/core/errors";
import { failure } from "@/lib/http/responses";

/**
 * Wraps a route handler so error translation, logging and correlation happen
 * once rather than being re-implemented (and forgotten) per endpoint.
 *
 * The previous handlers each carried their own try/catch and their own
 * `console.log`, which meant an unhandled throw in one of them produced
 * Next's default 500 with no log line at all — the failure existed only as a
 * blank page.
 */

export type RouteContext = {
  requestId: string;
  logger: Logger;
  /** Best-effort client IP; see the note in `rate-limit.ts`. */
  ip: string;
};

type Handler = (request: Request, context: RouteContext) => Promise<Response>;

function clientIp(request: Request): string {
  /* `x-forwarded-for` is a chain and only the first entry is the client.
     On Vercel the platform sets it, so a caller cannot forge it; behind any
     other proxy it can be. */
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function withRoute(scope: string, handler: Handler) {
  return async function route(request: Request): Promise<Response> {
    /* Reuse the platform's id when there is one, so a log line here can be
       joined to the platform's own request record. */
    const requestId =
      request.headers.get("x-vercel-id") ??
      request.headers.get("x-request-id") ??
      randomUUID();

    const ip = clientIp(request);
    const logger = createLogger(scope, { requestId });
    const startedAt = Date.now();

    try {
      const response = await handler(request, { requestId, logger, ip });

      logger.info("request completed", {
        method: request.method,
        status: response.status,
        durationMs: Date.now() - startedAt,
      });

      /* Exposed on every response so the id is available even on success. */
      response.headers.set("x-request-id", requestId);
      return response;
    } catch (error) {
      const durationMs = Date.now() - startedAt;

      if (isAppError(error)) {
        return handleAppError(error, { requestId, logger, durationMs });
      }

      /*
        An unexpected throw. The message may contain a connection string, a
        query, or a stack, so it is logged in full and replaced with a fixed
        sentence in the response.
      */
      logger.error("unhandled error", error, {
        method: request.method,
        durationMs,
      });

      return failure(
        500,
        "internal_error",
        "Something went wrong on our side. Please try again.",
        { requestId, headers: { "x-request-id": requestId } }
      );
    }
  };
}

function handleAppError(
  error: AppError,
  { requestId, logger, durationMs }: { requestId: string; logger: Logger; durationMs: number }
) {
  const headers: Record<string, string> = { "x-request-id": requestId };

  if (error instanceof RateLimitError) {
    /* Standard header, so a well-behaved client backs off for the right
       interval instead of retrying immediately. */
    headers["retry-after"] = String(error.retryAfterSeconds);
  }

  /* 4xx is the caller's problem and routine; 5xx is ours and is not. */
  const log = error.status >= 500 ? logger.error : logger.warn;
  log.call(
    logger,
    `request failed: ${error.code}`,
    error.status >= 500 ? error : undefined,
    { status: error.status, durationMs, ...(error.context ?? {}) }
  );

  return failure(error.status, error.code, error.publicMessage, {
    fields: error.fields,
    requestId,
    headers,
  });
}
