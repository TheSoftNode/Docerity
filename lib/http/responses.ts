import { NextResponse } from "next/server";

import { type FieldMap } from "@/lib/core/errors";

/**
 * One response envelope for every endpoint.
 *
 * Without this, each handler invents its own shape and the client ends up with
 * a branch per endpoint — this one returns `{error}`, that one `{errors}`,
 * another a bare string. The contact form already had to special-case that.
 */

export type ApiSuccess<T> = { ok: true; data: T };

export type ApiFailure = {
  ok: false;
  error: { code: string; message: string; fields?: FieldMap };
  requestId: string;
};

export function success<T>(
  data: T,
  init?: { status?: number; headers?: HeadersInit }
) {
  return NextResponse.json<ApiSuccess<T>>(
    { ok: true, data },
    { status: init?.status ?? 200, headers: init?.headers }
  );
}

export function failure(
  status: number,
  code: string,
  message: string,
  options?: { fields?: FieldMap; requestId: string; headers?: HeadersInit }
) {
  return NextResponse.json<ApiFailure>(
    {
      ok: false,
      error: { code, message, ...(options?.fields ? { fields: options.fields } : {}) },
      /* Echoed so a person reporting "it failed" can quote an id that appears
         verbatim in the logs, instead of describing the symptom. */
      requestId: options?.requestId ?? "unknown",
    },
    { status, headers: options?.headers }
  );
}
