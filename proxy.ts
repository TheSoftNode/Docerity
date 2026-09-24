import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth/token";

/**
 * An optimistic gate on /admin, and nothing more.
 *
 * What it does: sends a request with no session cookie to the login page
 * before the admin route renders, so the common case costs one redirect
 * instead of a render that ends in a redirect.
 *
 * What it deliberately does not do: verify the cookie's signature, or look the
 * account up. Next 16's proxy is documented as being deployed to the CDN and
 * told not to rely on shared modules, and it runs on every matched request
 * including prefetches, so a database query here would run constantly. More
 * to the point, a signature check here would be security theatre: the real
 * check has to happen next to the data, because a Server Action is a POST
 * endpoint that a caller can hit without ever loading a page this file sees.
 *
 * So the rule is: presence of a cookie is treated as "probably signed in", and
 * `lib/auth/dal.ts` decides whether that is true. A forged cookie gets past
 * this file and no further.
 */

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  const isLoginPage = pathname === "/admin/login";

  /*
    This file only ever redirects *to* the login page, never away from it.

    An earlier version also bounced a request carrying a cookie off the login
    page towards /admin, which looked harmless and was an infinite redirect: an
    expired or forged cookie is enough to get past the check here, the Data
    Access Layer then rejects it and redirects back to the login page, and this
    file bounced it to /admin again. The browser gave up with
    ERR_TOO_MANY_REDIRECTS, which is what anybody whose session had expired
    would have seen instead of a login form.

    Sending an already-authenticated visitor from the login page to the
    dashboard is still worth doing, but it has to be decided by something that
    can verify the session. The login page does it, with the same DAL call as
    everything else.
  */
  if (!isLoginPage && !hasSessionCookie) {
    const login = new URL("/admin/login", request.url);
    /* Carried so signing in returns to the page that was asked for. The action
       validates it before redirecting; see `safeReturnPath`. */
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  /*
    Scoped to /admin rather than running on everything.

    The auth guide suggests matching all routes, which is right when a session
    determines what a visitor sees anywhere on the site. Here the public pages
    are identical for everyone, so matching them would add a function
    invocation to every page view and every prefetch to answer a question
    nothing asks.

    `/api/admin` is excluded on purpose: those handlers return JSON, and a 302
    to an HTML login page is useless to a fetch. They check the session
    themselves and answer 401.
  */
  matcher: ["/admin", "/admin/:path*"],
};
