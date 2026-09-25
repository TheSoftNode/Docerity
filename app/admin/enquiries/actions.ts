"use server";

import { revalidatePath } from "next/cache";

import { requireStaffOrThrow } from "@/lib/auth/dal";
import { isAppError } from "@/lib/core/errors";
import { createLogger } from "@/lib/core/logger";
import { storage } from "@/lib/config/env";
import { signedUrlFor, type ResourceType } from "@/lib/storage/cloudinary";
import {
  findEnquiryById,
  setEnquiryStatus,
} from "@/lib/repositories/enquiry.repository";

const logger = createLogger("admin.enquiries");

export type EnquiryStatus = "new" | "read" | "replied" | "archived" | "spam";

export type SimpleResult = { ok: true } | { ok: false; message: string };

export async function updateEnquiryStatus(
  id: string,
  status: EnquiryStatus
): Promise<SimpleResult> {
  try {
    const user = await requireStaffOrThrow();
    const updated = await setEnquiryStatus(id, status);
    if (!updated) return { ok: false, message: "That enquiry no longer exists." };

    revalidatePath("/admin/enquiries");
    revalidatePath(`/admin/enquiries/${id}`);
    logger.info("enquiry status changed", { id, status, by: user.email });
    return { ok: true };
  } catch (error) {
    if (isAppError(error)) return { ok: false, message: error.publicMessage };
    logger.error("changing enquiry status failed", error);
    return { ok: false, message: "That did not work. Please try again." };
  }
}

/**
 * Mints a fresh download URL for one attachment.
 *
 * Attachments are stored with `authenticated` delivery, so there is no permanent
 * URL to render into the page: a link has to be signed with an expiry. Signing
 * on demand rather than during the render means a URL is only created when
 * somebody actually asks for the file, and the short expiry limits what a link
 * copied out of the page is worth later.
 *
 * Fifteen minutes, because the only use is clicking it now.
 */
export async function getAttachmentUrl(
  enquiryId: string,
  publicId: string
): Promise<{ ok: true; url: string } | { ok: false; message: string }> {
  try {
    const user = await requireStaffOrThrow();

    if (!storage.isConfigured) {
      return { ok: false, message: "Cloudinary is not configured for this environment." };
    }

    /*
      The attachment is looked up on the enquiry rather than signed from the
      public_id the client sent. Otherwise this action would sign any
      public_id in the account for anyone who could call it, which is a
      read-anything endpoint behind a login rather than an attachment link.
    */
    const enquiry = await findEnquiryById(enquiryId);
    const attachment = enquiry?.attachments?.find((file) => file.publicId === publicId);

    if (!attachment) {
      return { ok: false, message: "That file is not attached to this enquiry." };
    }

    const url = signedUrlFor({
      publicId: attachment.publicId,
      resourceType: attachment.resourceType as ResourceType,
      expiresInSeconds: 15 * 60,
    });

    logger.info("attachment url signed", { enquiryId, publicId, by: user.email });
    return { ok: true, url };
  } catch (error) {
    if (isAppError(error)) return { ok: false, message: error.publicMessage };
    logger.error("signing an attachment url failed", error);
    return { ok: false, message: "Could not prepare that download." };
  }
}
