import { connectDB } from "@/lib/db/connect";
import { ReviewModel } from "@/lib/db/models/review.model";

/**
 * Review persistence.
 *
 * The important rule lives here rather than in a caller: `listPublished` is
 * the only read path the public site uses, and it filters on an approved
 * status. The portfolio backend exposed `getAll` with no filter at all, so
 * anything submitted appeared live immediately.
 */

export type CreateReviewInput = {
  fullName: string;
  title: string;
  body: string;
  rating: number;
  photoPublicId: string;
  links: { title: string; url: string }[];
  contactEmail: string;
  submittedFromIp: string;
};

export async function createReview(input: CreateReviewInput) {
  await connectDB();
  /* `status` is not accepted from the caller: it defaults to "pending" in the
     schema and can only be changed through `setStatus` below, which the admin
     routes gate. Spreading caller input into `create` is how the portfolio
     backend ended up with an open write path. */
  return ReviewModel.create({ ...input, status: "pending" });
}

export async function listPublished(limit = 12) {
  await connectDB();
  return ReviewModel.find({ status: "approved" })
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 50))
    .select("fullName title body rating photoPublicId links createdAt")
    .lean();
}

export async function listForModeration(status: "pending" | "approved" | "rejected" = "pending") {
  await connectDB();
  return ReviewModel.find({ status }).sort({ createdAt: -1 }).limit(100).lean();
}

export async function setStatus(id: string, status: "approved" | "rejected") {
  await connectDB();
  const result = await ReviewModel.updateOne(
    { _id: id },
    { $set: { status, moderatedAt: new Date() } }
  );
  return result.matchedCount > 0;
}

export async function countRecentFromIp(ip: string, windowMinutes: number) {
  await connectDB();
  const since = new Date(Date.now() - windowMinutes * 60_000);
  return ReviewModel.countDocuments({ submittedFromIp: ip, createdAt: { $gte: since } });
}
