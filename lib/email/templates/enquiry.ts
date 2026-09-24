import { budgets, projectTypes, roles, timelines, formatBytes } from "@/lib/contact/schema";
import {
  COLORS,
  escapeHtml,
  renderLayout,
  renderParagraphBlock,
  renderRows,
} from "@/lib/email/templates/layout";

export type EnquiryAttachmentView = {
  name: string;
  /** A time-limited Cloudinary URL, or empty when one could not be signed. */
  url: string;
  bytes: number;
};

export type EnquiryEmailData = {
  reference: string;
  name: string;
  email: string;
  company: string;
  role: string;
  projectType: string;
  budget: string;
  timeline: string;
  message: string;
  attachments: EnquiryAttachmentView[];
};

/** Stored values are machine-readable ("10-25k"); email should read as the form did. */
function labelFor(options: readonly { value: string; label: string }[], value: string) {
  if (!value) return "";
  return options.find((option) => option.value === value)?.label ?? value;
}

function rowsFor(data: EnquiryEmailData): [string, string][] {
  return [
    ["Name", data.name],
    ["Email", data.email],
    ["Company", data.company],
    ["Role", labelFor(roles, data.role)],
    ["About", labelFor(projectTypes, data.projectType)],
    ["Budget", labelFor(budgets, data.budget)],
    ["Timeline", labelFor(timelines, data.timeline)],
    ["Reference", data.reference],
  ];
}

function renderAttachments(attachments: EnquiryAttachmentView[]): string {
  if (attachments.length === 0) return "";

  const items = attachments
    .map((file) => {
      const label = `${escapeHtml(file.name)} <span style="color:${COLORS.steel};font-size:12px;">— ${escapeHtml(formatBytes(file.bytes))}</span>`;
      return file.url
        ? `<li style="margin:0 0 8px 0;font-size:14px;"><a href="${escapeHtml(file.url)}" style="color:${COLORS.sapphire};text-decoration:none;font-weight:500;">${label}</a></li>`
        : `<li style="margin:0 0 8px 0;font-size:14px;color:${COLORS.pearl};">${label}</li>`;
    })
    .join("\n");

  return `<p style="margin:24px 0 8px 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${COLORS.steel};font-weight:600;">Attachments (${attachments.length})</p>
<ul style="margin:0;padding:0 0 0 18px;color:${COLORS.pearl};">
${items}
</ul>
<p style="margin:10px 0 0 0;font-size:12px;color:${COLORS.steel};">
  These links are signed and expire in 7 days. The files stay in Cloudinary and can be re-linked from the admin area after that.
</p>`;
}

/** Sent to you. Reply-To is the sender, so replying answers them directly. */
export function renderEnquiryNotification(data: EnquiryEmailData) {
  const html = renderLayout({
    title: "New project enquiry",
    preheader: `${data.name}${data.company ? ` · ${data.company}` : ""} — ${labelFor(projectTypes, data.projectType)}`,
    body: `${renderRows(rowsFor(data))}
<p style="margin:24px 0 0 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${COLORS.steel};font-weight:600;">Message</p>
${renderParagraphBlock(data.message)}
${renderAttachments(data.attachments)}`,
  });

  const text = [
    "NEW PROJECT ENQUIRY",
    "",
    ...rowsFor(data)
      .filter(([, value]) => value.trim())
      .map(([label, value]) => `${label}: ${value}`),
    "",
    "Message:",
    data.message,
    ...(data.attachments.length
      ? [
          "",
          `Attachments (${data.attachments.length}):`,
          ...data.attachments.map(
            (file) => `- ${file.name} (${formatBytes(file.bytes)})${file.url ? `\n  ${file.url}` : ""}`
          ),
          "",
          "Attachment links are signed and expire in 7 days.",
        ]
      : []),
  ].join("\n");

  return { html, text };
}

/** Sent to whoever submitted the form, so they know it arrived. */
export function renderEnquiryAcknowledgement(data: EnquiryEmailData) {
  const firstName = data.name.trim().split(/\s+/)[0] || data.name;

  const html = renderLayout({
    title: `Thanks, ${firstName} — your enquiry arrived`,
    preheader: "I've got your project details and will reply within two working days.",
    body: `<p style="margin:0;font-size:15px;line-height:1.7;color:${COLORS.pearl};">
  Thanks for getting in touch about your project. This is an automatic confirmation that it
  reached me &mdash; I read every enquiry myself and will reply within two working days.
</p>
<p style="margin:16px 0 0 0;font-size:15px;line-height:1.7;color:${COLORS.pearl};">
  For your reference, here&rsquo;s what you sent:
</p>
${renderParagraphBlock(data.message)}
${
  data.attachments.length > 0
    ? `<p style="margin:16px 0 0 0;font-size:13px;color:${COLORS.steel};">Received ${data.attachments.length} attachment${data.attachments.length === 1 ? "" : "s"}: ${escapeHtml(data.attachments.map((f) => f.name).join(", "))}.</p>`
    : ""
}
<p style="margin:20px 0 0 0;font-size:13px;color:${COLORS.steel};">
  Reference: <span style="color:${COLORS.pearl};font-family:ui-monospace,Menlo,Consolas,monospace;">${escapeHtml(data.reference)}</span>
</p>
<p style="margin:20px 0 0 0;font-size:13px;line-height:1.7;color:${COLORS.steel};">
  If you want to add anything, just reply to this email and it will reach me directly.
</p>`,
  });

  const text = [
    `Thanks, ${firstName} — your enquiry arrived.`,
    "",
    "This is an automatic confirmation that your enquiry reached me. I read every one myself",
    "and will reply within two working days.",
    "",
    "What you sent:",
    data.message,
    ...(data.attachments.length
      ? ["", `Attachments received: ${data.attachments.map((f) => f.name).join(", ")}`]
      : []),
    "",
    `Reference: ${data.reference}`,
    "",
    "If you want to add anything, just reply to this email.",
  ].join("\n");

  return { html, text };
}
