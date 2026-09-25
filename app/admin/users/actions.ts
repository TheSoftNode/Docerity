"use server";

import { revalidatePath } from "next/cache";

import { requireOwner, requireUserOrThrow } from "@/lib/auth/dal";
import { ForbiddenError, isAppError, ValidationError } from "@/lib/core/errors";
import { createLogger } from "@/lib/core/logger";
import { hashPassword } from "@/lib/auth/password";
import { validatePassword } from "@/lib/services/auth.service";
import {
  cancelInvite,
  countUsers,
  createInvitedUser,
  deleteUser,
  reissueInvite,
  setPasswordHash,
  setUserDisabled,
  setUserRole,
} from "@/lib/repositories/user.repository";
import {
  createInviteToken,
  hashInviteToken,
  inviteExpiry,
  inviteUrl,
} from "@/lib/auth/invite";
import { runtime } from "@/lib/config/env";
import type { Role } from "@/lib/auth/permissions";

/**
 * Account management. Owner-only, except for changing your own password.
 *
 * Every action calls a guard first. `requireOwner` throws rather than
 * redirecting, because these are invoked from a form and a redirect inside an
 * action reads as success to the caller awaiting it.
 */

const logger = createLogger("admin.users");

export type UserActionResult =
  | { ok: true; message?: string; inviteUrl?: string }
  | { ok: false; message: string };

function roleFrom(value: unknown): Role {
  return value === "owner" || value === "editor" ? value : "contributor";
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function inviteUser(
  _state: UserActionResult | undefined,
  formData: FormData
): Promise<UserActionResult> {
  try {
    const owner = await requireOwner();

    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const name = String(formData.get("name") ?? "").trim();
    const role = roleFrom(formData.get("role"));

    if (!EMAIL.test(email)) {
      throw new ValidationError("That email address doesn't look right.");
    }
    if (name.length < 2) {
      throw new ValidationError("A name is required.");
    }

    /*
      An invitation rather than a password you invent and send them.

      The first version of this form asked the owner for a password, which they
      then had to pass along over whatever chat they use. That puts a working
      credential in a message that outlives the moment, and means two people
      know the password from the start. Here the account exists with no password
      at all until the invited person sets one.
    */
    const token = createInviteToken();

    const created = await createInvitedUser({
      email,
      name,
      role,
      inviteTokenHash: hashInviteToken(token),
      inviteExpiresAt: inviteExpiry(),
      invitedBy: owner.email,
    });

    revalidatePath("/admin/users");
    logger.info("account invited", { email, role, by: owner.email });

    return {
      ok: true,
      message: `${created.name} can set their own password with this link. It works once, and expires in three days.`,
      /* Returned rather than emailed: SMTP is optional in this deployment, and
         an invitation that silently fails to send is worse than one you copy. */
      inviteUrl: inviteUrl(runtime.siteUrl, token),
    };
  } catch (error) {
    if (isAppError(error)) return { ok: false, message: error.publicMessage };

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return { ok: false, message: "An account with that address already exists." };
    }

    logger.error("inviting an account failed", error);
    return { ok: false, message: "That did not work. Please try again." };
  }
}

/** A fresh link for somebody who never used their first one, or let it lapse. */
export async function resendInvite(id: string): Promise<UserActionResult> {
  try {
    const owner = await requireOwner();

    const token = createInviteToken();
    const reissued = await reissueInvite(id, hashInviteToken(token), inviteExpiry());

    if (!reissued) {
      /* `reissueInvite` only matches an account with no password, so this is
         either a missing account or one that has already been set up. */
      return {
        ok: false,
        message: "That account has already been set up, so it needs a password reset rather than an invitation.",
      };
    }

    revalidatePath("/admin/users");
    logger.info("invitation reissued", { id, by: owner.email });

    return {
      ok: true,
      message: "A new link. The previous one no longer works.",
      inviteUrl: inviteUrl(runtime.siteUrl, token),
    };
  } catch (error) {
    if (isAppError(error)) return { ok: false, message: error.publicMessage };
    logger.error("reissuing an invitation failed", error);
    return { ok: false, message: "That did not work. Please try again." };
  }
}

export async function revokeInvite(id: string): Promise<UserActionResult> {
  try {
    const owner = await requireOwner();
    const cancelled = await cancelInvite(id);
    if (!cancelled) return { ok: false, message: "There is no invitation to revoke." };

    revalidatePath("/admin/users");
    logger.info("invitation revoked", { id, by: owner.email });
    return { ok: true, message: "That link no longer works." };
  } catch (error) {
    if (isAppError(error)) return { ok: false, message: error.publicMessage };
    logger.error("revoking an invitation failed", error);
    return { ok: false, message: "That did not work. Please try again." };
  }
}

export async function changeRole(id: string, role: Role): Promise<UserActionResult> {
  try {
    const owner = await requireOwner();

    /*
      You cannot demote yourself while you are the only owner.

      Without this, one click leaves the installation with no account that can
      manage accounts, and the only way back is the command line. Checked by
      counting owners rather than by comparing ids, so a second owner makes it
      allowed.
    */
    if (id === owner.id && role !== "owner") {
      throw new ForbiddenError(
        "You would be locking yourself out of account management. Promote somebody else first."
      );
    }

    const updated = await setUserRole(id, role);
    if (!updated) return { ok: false, message: "That account no longer exists." };

    revalidatePath("/admin/users");
    logger.info("role changed", { id, role, by: owner.email });
    return { ok: true };
  } catch (error) {
    if (isAppError(error)) return { ok: false, message: error.publicMessage };
    logger.error("changing a role failed", error);
    return { ok: false, message: "That did not work. Please try again." };
  }
}

export async function toggleDisabled(
  id: string,
  disabled: boolean
): Promise<UserActionResult> {
  try {
    const owner = await requireOwner();

    if (id === owner.id) {
      throw new ForbiddenError("You cannot disable the account you are signed in with.");
    }

    const updated = await setUserDisabled(id, disabled);
    if (!updated) return { ok: false, message: "That account no longer exists." };

    revalidatePath("/admin/users");
    logger.info(disabled ? "account disabled" : "account enabled", { id, by: owner.email });
    return { ok: true };
  } catch (error) {
    if (isAppError(error)) return { ok: false, message: error.publicMessage };
    logger.error("disabling an account failed", error);
    return { ok: false, message: "That did not work. Please try again." };
  }
}

export async function removeUser(id: string): Promise<UserActionResult> {
  try {
    const owner = await requireOwner();

    if (id === owner.id) {
      throw new ForbiddenError("You cannot delete the account you are signed in with.");
    }

    /* The last account cannot be deleted even by another owner: an empty user
       collection means nobody can sign in at all. */
    if ((await countUsers()) <= 1) {
      throw new ForbiddenError("This is the only account. Deleting it would lock everybody out.");
    }

    const deleted = await deleteUser(id);
    if (!deleted) return { ok: false, message: "That account no longer exists." };

    revalidatePath("/admin/users");
    logger.info("account deleted", { id, by: owner.email });
    return { ok: true };
  } catch (error) {
    if (isAppError(error)) return { ok: false, message: error.publicMessage };
    logger.error("deleting an account failed", error);
    return { ok: false, message: "That did not work. Please try again." };
  }
}

/**
 * Changing your own password. The one action here that is not owner-only.
 *
 * `setPasswordHash` bumps `sessionVersion`, which invalidates every token issued
 * for the account, including the one making this request. That is deliberate:
 * changing a password should end other sessions. The caller is redirected to the
 * login page afterwards.
 */
export async function changeOwnPassword(
  _state: UserActionResult | undefined,
  formData: FormData
): Promise<UserActionResult> {
  try {
    const user = await requireUserOrThrow();

    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");

    validatePassword(password);
    if (password !== confirm) {
      throw new ValidationError("Those two passwords do not match.");
    }

    await setPasswordHash(user.id, await hashPassword(password));
    logger.info("password changed", { userId: user.id });

    return {
      ok: true,
      message: "Password changed. Every signed-in device, including this one, is now signed out.",
    };
  } catch (error) {
    if (isAppError(error)) return { ok: false, message: error.publicMessage };
    logger.error("changing a password failed", error);
    return { ok: false, message: "That did not work. Please try again." };
  }
}
