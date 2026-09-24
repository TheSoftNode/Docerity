import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { requireUser } from "@/lib/auth/dal";
import {
  findEnquiryById,
  markEnquiryRead,
} from "@/lib/repositories/enquiry.repository";
import { budgets, projectTypes, roles, timelines } from "@/lib/contact/schema";
import { EnquiryDetail, type EnquiryView } from "@/components/admin/enquiry-detail";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Enquiry" };

function labelFor(options: readonly { value: string; label: string }[], value: string) {
  if (!value) return "";
  return options.find((option) => option.value === value)?.label ?? value;
}

export default async function EnquiryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser(`/admin/enquiries/${id}`);

  /* Mongoose throws a CastError on anything that is not a 24-character hex
     string, which would surface as a 500 rather than a 404. */
  if (!/^[0-9a-fA-F]{24}$/.test(id)) notFound();

  const enquiry = await findEnquiryById(id);
  if (!enquiry) notFound();

  /*
    Opening one marks it read, which is what "new" means here.

    Not awaited on the render path's critical work, but awaited nonetheless: it
    is a single indexed update, and firing it without waiting risks the
    serverless instance being frozen before it lands. The repository only
    promotes from "new", so revisiting an archived enquiry does not resurrect
    it into the inbox.
  */
  if (enquiry.status === "new") await markEnquiryRead(id);

  const view: EnquiryView = {
    id,
    reference: enquiry.reference,
    name: enquiry.name,
    email: enquiry.email,
    company: enquiry.company ?? "",
    role: labelFor(roles, enquiry.role ?? ""),
    projectType: labelFor(projectTypes, enquiry.projectType ?? ""),
    budget: labelFor(budgets, enquiry.budget ?? ""),
    timeline: labelFor(timelines, enquiry.timeline ?? ""),
    message: enquiry.message,
    /* "read" rather than the stored "new", since opening this page just changed
       it and the buttons should show where it actually is. */
    status: enquiry.status === "new" ? "read" : (enquiry.status as EnquiryView["status"]),
    receivedAt: enquiry.createdAt?.toISOString() ?? new Date().toISOString(),
    attachments: (enquiry.attachments ?? []).map((file) => ({
      publicId: file.publicId,
      name: file.originalName,
      bytes: file.bytes,
      verified: Boolean(file.verified),
    })),
    delivery: {
      notified: Boolean(enquiry.notification?.delivered),
      acknowledged: Boolean(enquiry.acknowledgement?.delivered),
      /* Only the notification's error is surfaced. A failed acknowledgement is
         usually the same cause, and two identical SMTP errors stacked on the
         page says nothing the first one did not. */
      error: enquiry.notification?.error ?? "",
    },
  };

  return (
    <>
      <div className="border-b border-border/80 pb-4">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/admin/enquiries" />}
        >
          <ArrowLeftIcon />
          All enquiries
        </Button>
      </div>

      <div className="mt-6 max-w-[48rem]">
        <EnquiryDetail enquiry={view} />
      </div>
    </>
  );
}
