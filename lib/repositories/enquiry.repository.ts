import { randomBytes } from "node:crypto";

import { connectDB } from "@/lib/db/connect";
import {
  EnquiryModel,
  type EnquiryAttachment,
  type EnquiryDocument,
} from "@/lib/db/models/enquiry.model";

/**
 * All enquiry persistence, and nothing else.
 *
 * The point of the split is that this layer knows about documents and queries
 * but nothing about HTTP, and the service above knows about the workflow but
 * never writes a query. Previously the route handler did both, which is why it
 * was impossible to test the rules without standing up a web server.
 */

/* Crockford-style alphabet: no I, L, O or U, so a reference read aloud or
   copied by hand cannot be confused between 1/I/L or 0/O. */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function generateReference(): string {
  const bytes = randomBytes(6);
  let out = "";
  for (const byte of bytes) out += ALPHABET[byte % ALPHABET.length];
  return `DOC-${out.slice(0, 3)}-${out.slice(3)}`;
}

export type CreateEnquiryInput = {
  name: string;
  email: string;
  company: string;
  role: string;
  projectType: string;
  budget: string;
  timeline: string;
  message: string;
  attachments: EnquiryAttachment[];
  submittedFromIp: string;
  userAgent: string;
};

export async function createEnquiry(input: CreateEnquiryInput) {
  await connectDB();

  /*
    A unique index backs `reference`, so a collision is a failed insert rather
    than a duplicate. Retrying covers the birthday-problem case; six random
    characters from a 32-symbol alphabet is ~10^9 combinations, so this
    effectively never runs more than once.
  */
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await EnquiryModel.create({
        ...input,
        reference: generateReference(),
      });
    } catch (error) {
      const isDuplicate =
        typeof error === "object" && error !== null && "code" in error && error.code === 11000;
      if (!isDuplicate || attempt === 2) throw error;
    }
  }

  throw new Error("Could not allocate a unique enquiry reference.");
}

export async function countRecentFromIp(ip: string, windowMinutes: number): Promise<number> {
  await connectDB();
  const since = new Date(Date.now() - windowMinutes * 60_000);
  return EnquiryModel.countDocuments({ submittedFromIp: ip, createdAt: { $gte: since } });
}

export async function recordNotification(
  id: unknown,
  result: { delivered: boolean; messageId?: string; error?: string; attempts: number }
) {
  await connectDB();
  await EnquiryModel.updateOne(
    { _id: id },
    {
      $set: {
        "notification.delivered": result.delivered,
        "notification.messageId": result.messageId ?? "",
        "notification.error": result.error ?? "",
        "notification.attempts": result.attempts,
        "notification.lastAttemptAt": new Date(),
      },
    }
  );
}

export async function recordAcknowledgement(
  id: unknown,
  result: { delivered: boolean; messageId?: string; error?: string }
) {
  await connectDB();
  await EnquiryModel.updateOne(
    { _id: id },
    {
      $set: {
        "acknowledgement.delivered": result.delivered,
        "acknowledgement.messageId": result.messageId ?? "",
        "acknowledgement.error": result.error ?? "",
      },
    }
  );
}

export async function markAttachmentsVerified(
  id: unknown,
  attachments: EnquiryAttachment[]
) {
  await connectDB();
  await EnquiryModel.updateOne({ _id: id }, { $set: { attachments } });
}

export type EnquiryListFilter = {
  status?: EnquiryDocument["status"];
  limit?: number;
  skip?: number;
};

/** Newest first, matching the only index that serves this query. */
export async function listEnquiries(filter: EnquiryListFilter = {}) {
  await connectDB();
  const query = filter.status ? { status: filter.status } : {};

  const [items, total] = await Promise.all([
    EnquiryModel.find(query)
      .sort({ createdAt: -1 })
      .skip(filter.skip ?? 0)
      .limit(Math.min(filter.limit ?? 25, 100))
      .lean(),
    EnquiryModel.countDocuments(query),
  ]);

  return { items, total };
}

export async function findEnquiryByReference(reference: string) {
  await connectDB();
  return EnquiryModel.findOne({ reference: reference.toUpperCase() }).lean();
}
