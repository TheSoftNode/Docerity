"use server";

import { redirect } from "next/navigation";

import { hashInviteToken } from "@/lib/auth/invite";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { redeemInvite } from "@/lib/repositories/user.repository";
import { validatePassword } from "@/lib/services/auth.service";
import { isAppError } from "@/lib/core/errors";
import { createLogger } from "@/lib/core/logger";
import { homeFor, type Role } from "@/lib/auth/permissions";

/**
 * Claiming an invitation: setting a password and signing in.
 *
 * The token is checked here rather than only on the page that renders the form.
 * A page check is a render-time gate, and this is a POST endpoint somebody can
 * call directly with any token they like.
 */

const logger = createLogger("auth.invite");

export type InviteState = { message?: string } | undefined;

export async function acceptInvite(
  _state: InviteState,
  formData: FormData
): Promise<InviteState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  let session;

  try {
    if (!token) return { message: "That invitation link is incomplete." };

    validatePassword(password);
    if (password !== confirm) {
      return { message: "Those two passwords do not match." };
    }

    /*
      One update does the lookup, the expiry check and the write, guarded on the
      token digest. Two tabs racing cannot both succeed, and a link that has
      already been used simply matches nothing.
    */
    const user = await redeemInvite(hashInviteToken(token), await hashPassword(password));

    if (!user) {
      return {
        message: "That invitation has already been used or has expired. Ask for a new link.",
      };
    }

    logger.info("invitation accepted", { userId: String(user._id) });

    session = {
      userId: String(user._id),
      role: user.role as Role,
      sessionVersion: user.sessionVersion ?? 1,
    };
  } catch (error) {
    if (isAppError(error)) return { message: error.publicMessage };
    logger.error("accepting an invitation failed", error);
    return { message: "That did not work. Please try again." };
  }

  /* Signed in immediately: they have just proved they hold the invitation and
     chosen a password, so a login form here would only ask for it again. */
  await createSession(session);

  /* Outside the try, because `redirect` works by throwing. */
  redirect(homeFor(session.role));
}
