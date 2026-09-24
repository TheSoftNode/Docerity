import { describeError } from "@/lib/core/errors";
import { runtime } from "@/lib/config/env";

/**
 * Structured logging.
 *
 * `console.log("[contact]", { ...input })` was fine when the handler only
 * logged. Once a request touches a database, a mail transport and a storage
 * API, the useful question becomes "what happened to *this* request", and that
 * needs a correlation id on every line plus a shape a log platform can query.
 *
 * Output is JSON in production, where something is parsing it, and a readable
 * single line in development, where a person is.
 */

type Level = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

/* Debug lines are noise in a deployment but the whole point locally. */
const MIN_LEVEL: Level = runtime.isProduction ? "info" : "debug";

/*
  Anything matching these is replaced before it reaches a log sink. Logs get
  shipped, retained and read by more people than a database does, so a
  submitted email address or an SMTP password must not travel in one.
*/
const REDACTED_KEYS =
  /^(password|pass|secret|token|apiKey|api_key|authorization|cookie|signature|smtpPassword)$/i;

function redact(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[truncated]";
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => redact(v, depth + 1));

  const out: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    out[key] = REDACTED_KEYS.test(key) ? "[redacted]" : redact(entry, depth + 1);
  }
  return out;
}

export type LogContext = Record<string, unknown>;

function emit(level: Level, scope: string, message: string, context?: LogContext) {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[MIN_LEVEL]) return;

  const payload = {
    level,
    scope,
    message,
    time: new Date().toISOString(),
    ...(context ? (redact(context) as LogContext) : {}),
  };

  const line = runtime.isProduction
    ? JSON.stringify(payload)
    : `${level.toUpperCase().padEnd(5)} [${scope}] ${message}` +
      (context ? ` ${JSON.stringify(redact(context))}` : "");

  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export type Logger = {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, error?: unknown, context?: LogContext): void;
  /** A child logger that carries extra fields on every line. */
  child(bindings: LogContext): Logger;
};

export function createLogger(scope: string, bindings: LogContext = {}): Logger {
  const merge = (context?: LogContext) => ({ ...bindings, ...context });

  return {
    debug: (message, context) => emit("debug", scope, message, merge(context)),
    info: (message, context) => emit("info", scope, message, merge(context)),
    warn: (message, context) => emit("warn", scope, message, merge(context)),
    error: (message, error, context) =>
      emit("error", scope, message, {
        ...merge(context),
        ...(error === undefined
          ? {}
          : {
              error: describeError(error),
              /* The stack is the only reason to keep the raw error, and it is
                 useless in production where sources are minified anyway. */
              ...(runtime.isProduction || !(error instanceof Error)
                ? {}
                : { stack: error.stack }),
            }),
      }),
    child: (extra) => createLogger(scope, merge(extra)),
  };
}
