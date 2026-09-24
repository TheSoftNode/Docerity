import {
  COLORS,
  escapeHtml,
  renderLayout,
  renderParagraphBlock,
  renderRows,
} from "@/lib/email/templates/layout";

export type ReviewEmailData = {
  id: string;
  fullName: string;
  title: string;
  body: string;
  rating: number;
  contactEmail: string;
  links: { title: string; url: string }[];
  /** Absolute, because a relative path in email resolves against nothing. */
  moderationUrl: string;
};

/* Filled and empty stars as text rather than an image. An <img> in email is
   blocked by default in most clients, so a star graphic would read as a broken
   icon; these render everywhere. */
function stars(rating: number): string {
  return "★".repeat(rating) + "☆".repeat(Math.max(0, 5 - rating));
}

function renderLinks(links: { title: string; url: string }[]): string {
  if (links.length === 0) return "";

  const items = links
    .map(
      (link) =>
        `<li style="margin:0 0 6px 0;font-size:14px;"><a href="${escapeHtml(link.url)}" style="color:${COLORS.sapphire};text-decoration:none;">${escapeHtml(link.title)}</a></li>`
    )
    .join("\n");

  return `<p style="margin:20px 0 6px 0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${COLORS.steel};">Links they added</p>
<ul style="margin:0;padding-left:18px;">${items}</ul>`;
}

/**
 * The owner's notification for a review awaiting approval.
 *
 * There is no counterpart to the enquiry's acknowledgement: the submitter has
 * already been told on the page that it will be read before it appears, and
 * emailing them again before it is approved would promise a decision that has
 * not been made.
 */
export function renderReviewNotification(data: ReviewEmailData): {
  html: string;
  text: string;
} {
  const rows = renderRows([
    ["Name", data.fullName],
    ["Title", data.title],
    ["Rating", `${stars(data.rating)}  ${data.rating}/5`],
    ["Email", data.contactEmail],
  ]);

  const body = `
    <p style="margin:0 0 4px 0;font-size:15px;line-height:1.65;color:${COLORS.pearl};">
      Nothing is public yet. It sits in the queue until you approve it.
    </p>
    ${rows}
    ${renderParagraphBlock(data.body)}
    ${renderLinks(data.links)}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 0 0;">
      <tr>
        <td style="background:linear-gradient(90deg,${COLORS.sapphire},${COLORS.violet});border-radius:8px;">
          <a href="${escapeHtml(data.moderationUrl)}" style="display:inline-block;padding:11px 20px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">Review and approve</a>
        </td>
      </tr>
    </table>
    <p style="margin:16px 0 0 0;font-size:12px;color:${COLORS.steel};">
      Reply to this email to reach ${escapeHtml(data.fullName)} directly, which is
      the quickest way to check a testimonial is genuine.
    </p>`;

  const text = [
    `New review awaiting approval`,
    ``,
    `Name:   ${data.fullName}`,
    `Title:  ${data.title}`,
    `Rating: ${data.rating}/5`,
    `Email:  ${data.contactEmail}`,
    ``,
    data.body,
    ``,
    ...(data.links.length > 0
      ? ["Links:", ...data.links.map((link) => `  ${link.title}: ${link.url}`), ""]
      : []),
    `Approve or reject: ${data.moderationUrl}`,
    ``,
    `Nothing is public until you approve it.`,
  ].join("\n");

  return {
    html: renderLayout({
      title: `New review from ${data.fullName}`,
      preheader: `${data.rating}/5 · ${data.title}`,
      body,
    }),
    text,
  };
}
