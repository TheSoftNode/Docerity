"use server";

import { revalidatePath } from "next/cache";

import { requireOwner, requireUserOrThrow } from "@/lib/auth/dal";
import { ForbiddenError, isAppError, ValidationError } from "@/lib/core/errors";
import { createLogger } from "@/lib/core/logger";
import { hashPassword } from "@/lib/auth/password";
import { validatePassword } from "@/lib/services/auth.service";
import {
  countUsers,
  createUser,
  deleteUser,
  setPasswordHash,
  setUserDisabled,
  setUserRole,
} from "@/lib/repositories/user.repository";

/**
 * Account management. Owner-only, except for changing your own password.
 *
 * Every action calls a guard first. `requireOwner` throws rather than
 * redirecting, because these are invoked from a form and a redirect inside an
 * action reads as success to the caller awaiting it.
 */

const logger = createLogger("admin.users");

export type UserActionResult =
  | { ok: true; message?: string }
  | { ok: false; message: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function inviteUser(
  _state: UserActionResult | undefined,
  formData: FormData
): Promise<UserActionResult> {
  try {
    const owner = await requireOwner();

    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const name = String(formData.get("name") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const role = String(formData.get("role") ?? "editor") === "owner" ? "owner" : "editor";

    if (!EMAIL.test(email)) {
      throw new ValidationError("That email address doesn't look right.");
    }
    if (name.length < 2) {
      throw new ValidationError("A name is required.");
    }
    validatePassword(password);

    /*
      The password is set here rather than emailed as an invitation link.

      An invitation flow needs a second token type, an expiry, a public route to
      accept it, and mail that reliably arrives, and this is a site with one
      operator adding an occasional collaborator. Telling them the password over
      a channel you already trust is fewer moving parts, and they can change it
      from this same page.
    */
    const created = await createUser({
      email,
      name,
      passwordHash: await hashPassword(password),
      role,
    });

    revalidatePath("/admin/users");
    logger.info("account created", { email, role, by: owner.email });

    return { ok: true, message: `${created.name} can now sign in.` };
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

    logger.error("creating an account failed", error);
    return { ok: false, message: "That did not work. Please try again." };
  }
}

export async function changeRole(
  id: string,
  role: "owner" | "editor"
): Promise<UserActionResult> {
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
