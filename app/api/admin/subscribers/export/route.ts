import { getCurrentUser } from "@/lib/auth/dal";
import { isStaff } from "@/lib/auth/permissions";
import { withRoute } from "@/lib/http/handler";
import { failure } from "@/lib/http/responses";
import { database } from "@/lib/config/env";
import { listAllSubscribedEmails } from "@/lib/repositories/subscriber.repository";

/**
 * The subscriber list as a CSV download.
 *
 * A route handler rather than a Server Action, because an action returns a
 * serialised value and a download needs a response with its own content type
 * and `Content-Disposition`.
 *
 * `/api/admin/*` is outside the proxy's matcher on purpose, so this checks the
 * session itself. That is the right arrangement anyway: the proxy only sees
 * whether a cookie exists.
 */

export const runtime = "nodejs";

/**
 * Escapes one CSV field.
 *
 * The part that matters is the leading apostrophe on a field starting with `=`,
 * `+`, `-` or `@`. Excel and Sheets treat those as formulas, so an address like
 * `=cmd|'/c calc'!A1@example.com` becomes a command when the file is opened.
 * That is CSV injection, and an export of user-supplied strings is exactly where
 * it lands.
 */
function csvField(value: string): string {
  const risky = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${risky.replace(/"/g, '""')}"`;
}

export const GET = withRoute("api.admin.subscribers.export", async (request, { logger }) => {
  const user = await getCurrentUser();

  if (!user) {
    /* 401 rather than a redirect: the caller asked for a file. */
    return failure(401, "unauthorized", "Please sign in again.", {
      requestId: request.headers.get("x-request-id") ?? "unknown",
    });
  }

  /* This is a column of people's email addresses, which is nothing to do with
     writing a post. 403 rather than 401: they are signed in, just not allowed. */
  if (!isStaff(user.role)) {
    return failure(403, "forbidden", "That export is not open to contributors.", {
      requestId: request.headers.get("x-request-id") ?? "unknown",
    });
  }

  if (!database.isConfigured) {
    return failure(503, "service_unavailable", "There is no database connection.", {
      requestId: request.headers.get("x-request-id") ?? "unknown",
    });
  }

  const subscribers = await listAllSubscribedEmails();

  const rows = [
    ["email", "subscribed_at", "source"].join(","),
    ...subscribers.map((subscriber) =>
      [
        csvField(subscriber.email),
        csvField(subscriber.createdAt?.toISOString() ?? ""),
        csvField(subscriber.source ?? ""),
      ].join(",")
    ),
  ];

  logger.info("subscriber list exported", { count: subscribers.length, by: user.email });

  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(
    /*
      A UTF-8 BOM, because Excel on Windows otherwise reads the file as the
      system code page and mangles any non-ASCII character in an address.
    */
    `﻿${rows.join("\r\n")}\r\n`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="docerity-subscribers-${stamp}.csv"`,
        /* This is a list of people's email addresses. Nothing caches it. */
        "Cache-Control": "no-store",
      },
    }
  );
});
