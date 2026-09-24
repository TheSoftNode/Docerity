import { budgets, projectTypes, roles, timelines, formatBytes } from "@/lib/contact/schema";
import {
  COLORS,
  escapeHtml,
  renderLayout,
  renderParagraphBlock,
  renderRows,
} from "@/lib/email/templates/layout";

type Attachment = { name: string; url: string; size: number };

type EnquiryEmailData = {
  name: string;
  email: string;
  company: string;
  role: string;
  projectType: string;
  budget: string;
  timeline: string;
  message: string;
  attachments: Attachment[];
};

/* Stored values are machine-readable ("10-25k"); the email should read the way
   the form did ("$10k – $25k"). */
function labelFor(
  options: readonly { value: string; label: string }[],
  value: string
): string {
  if (!value) return "";
  return options.find((option) => option.value === value)?.label ?? value;
}

function renderAttachments(attachments: Attachment[]): string {
  if (attachments.length === 0) return "";

  const items = attachments
    .map(
      (file) =>
        `<li style="margin:0 0 8px 0;font-size:14px;">
  <a href="${escapeHtml(file.url)}" style="color:${COLORS.sapphire};text-decoration:none;font-weight:500;">${escapeHtml(file.name)}</a>
  <span style="color:${COLORS.steel};font-size:12px;"> — ${escapeHtml(formatBytes(file.size))}</span>
</li>`
    )
    .join("\n");

  return `<p style="margin:24px 0 8px 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${COLORS.steel};font-weight:600;">Attachments (${attachments.length})</p>
<ul style="margin:0;padding:0 0 0 18px;color:${COLORS.pearl};">
${items}
</ul>`;
}

/** Sent to you. Reply-To is the sender, so hitting reply answers them. */
function renderEnquiryNotification(data: EnquiryEmailData): string {
  const rows: [string, string][] = [
    ["Name", data.name],
    ["Email", data.email],
    ["Company", data.company],
    ["Role", labelFor(roles, data.role)],
    ["About", labelFor(projectTypes, data.projectType)],
    ["Budget", labelFor(budgets, data.budget)],
    ["Timeline", labelFor(timelines, data.timeline)],
  ];

  return renderLayout({
    title: "New project enquiry",
    preheader: `${data.name}${data.company ? ` · ${data.company}` : ""} — ${labelFor(projectTypes, data.projectType)}`,
    body: `${renderRows(rows)}
<p style="margin:24px 0 0 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${COLORS.steel};font-weight:600;">Message</p>
${renderParagraphBlock(data.message)}
${renderAttachments(data.attachments)}`,
  });
}

/** Sent to whoever submitted the form, so they know it arrived. */
function renderEnquiryAcknowledgement(data: EnquiryEmailData): string {
  const firstName = data.name.trim().split(/\s+/)[0] ?? data.name;

  return renderLayout({
    title: `Thanks, ${firstName} — your enquiry arrived`,
    preheader: "I've got your project details and will reply within two working days.",
    body: `<p style="margin:0;font-size:15px;line-height:1.7;color:${COLORS.pearl};">
  Thanks for getting in touch about your project. This is an automatic confirmation that it reached me —
  I read every enquiry myself and will reply within two working days.
</p>
<p style="margin:16px 0 0 0;font-size:15px;line-height:1.7;color:${COLORS.pearl};">
  For reference, here's what you sent:
</p>
${renderParagraphBlock(data.message)}
${
  data.attachments.length > 0
    ? `<p style="margin:16px 0 0 0;font-size:13px;color:${COLORS.steel};">Received ${data.attachments.length} attachment${data.attachments.length === 1 ? "" : "s"}: ${escapeHtml(data.attachments.map((f) => f.name).join(", "))}.</p>`
    : ""
}
<p style="margin:24px 0 0 0;font-size:13px;line-height:1.7;color:${COLORS.steel};">
  No need to reply to this message. If you want to add anything, just reply to this email and it will reach me directly.
</p>`,
  });
}

export { renderEnquiryNotification, renderEnquiryAcknowledgement };
export type { EnquiryEmailData };
