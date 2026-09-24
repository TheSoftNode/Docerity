/**
 * A typed error hierarchy, so a route handler can decide what to return from
 * the error's shape rather than from string matching on its message.
 *
 * The distinction that matters is `isOperational`: an expected condition
 * (invalid input, rate limit, a service being down) versus a bug. Operational
 * errors carry a message written for the person who triggered them.
 * Non-operational ones must never have their message shown — it can contain a
 * connection string, a stack, or an internal identifier.
 */

export type FieldMap = Record<string, string>;

export abstract class AppError extends Error {
  abstract readonly status: number;
  abstract readonly code: string;
  readonly isOperational = true;

  /** Safe to show the caller. */
  readonly publicMessage: string;
  /** Per-field messages, where the failure maps to specific inputs. */
  readonly fields?: FieldMap;
  /** Extra detail for the log only — never serialised into a response. */
  readonly context?: Record<string, unknown>;

  constructor(
    publicMessage: string,
    options?: { fields?: FieldMap; context?: Record<string, unknown>; cause?: unknown }
  ) {
    super(publicMessage, { cause: options?.cause });
    this.name = new.target.name;
    this.publicMessage = publicMessage;
    this.fields = options?.fields;
    this.context = options?.context;
    Error.captureStackTrace?.(this, new.target);
  }
}

/** Input the caller can correct. */
export class ValidationError extends AppError {
  readonly status = 400;
  readonly code = "validation_failed";
}

/** Authentication is missing or invalid. */
export class UnauthorizedError extends AppError {
  readonly status = 401;
  readonly code = "unauthorized";

  constructor(publicMessage = "You need to sign in to do that.") {
    super(publicMessage);
  }
}

/** Authenticated, but not allowed. */
export class ForbiddenError extends AppError {
  readonly status = 403;
  readonly code = "forbidden";

  constructor(publicMessage = "You don't have access to that.") {
    super(publicMessage);
  }
}

export class NotFoundError extends AppError {
  readonly status = 404;
  readonly code = "not_found";

  constructor(publicMessage = "That doesn't exist.") {
    super(publicMessage);
  }
}

/** Too many requests from one origin. */
export class RateLimitError extends AppError {
  readonly status = 429;
  readonly code = "rate_limited";

  constructor(
    publicMessage: string,
    readonly retryAfterSeconds: number,
    options?: { fields?: FieldMap; context?: Record<string, unknown> }
  ) {
    super(publicMessage, options);
  }
}

/**
 * A dependency this request needed is unavailable — the database, the mail
 * transport, the storage API. 503 rather than 500 because the request may well
 * succeed on a retry, and because it tells a monitor the fault is downstream.
 */
export class ServiceUnavailableError extends AppError {
  readonly status = 503;
  readonly code = "service_unavailable";
}

/** Narrowing helper for `catch (error: unknown)`. */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/** Best-effort message extraction for logging an unknown throw. */
export function describeError(error: unknown): string {
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unserialisable error value";
  }
}
