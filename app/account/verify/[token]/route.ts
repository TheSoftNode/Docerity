import { NextResponse, type NextRequest } from "next/server";

import { confirmEmail } from "@/app/account/actions";

/**
 * The link in the confirmation email. A route rather than a page, because it
 * changes something (confirms the address and signs in) and a page should not
 * do that just by being rendered or prefetched. Mail scanners that follow
 * links with HEAD do nothing here; a GET confirms once, then the link is spent.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const ok = await confirmEmail(token);
  return NextResponse.redirect(new URL(ok ? "/account?welcome=1" : "/account/login?expired=1", request.url));
}
