import { COLORS, escapeHtml, renderLayout } from "@/lib/email/templates/layout";

/**
 * The password reset email: who it is for, one button, and what to do if it
 * was not them. The link is also written out in full, because some mail
 * clients strip buttons and a person should never be stuck.
 */
export function renderPasswordReset(data: { name: string; url: string; minutes: number }): {
  subject: string;
  html: string;
  text: string;
} {
  const first = data.name.split(" ")[0] || "there";
  const subject = "Reset your Docerity admin password";

  const body = `<p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:${COLORS.pearl};">Hi ${escapeHtml(first)},</p>
<p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:${COLORS.pearl};">Someone asked to reset the password for your Docerity admin account. If it was you, choose a new one here. The link works once, for the next ${data.minutes} minutes.</p>
<p style="margin:0 0 24px 0;"><a href="${escapeHtml(data.url)}" style="display:inline-block;padding:12px 22px;border-radius:999px;background-color:${COLORS.sapphire};color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">Choose a new password</a></p>
<p style="margin:0 0 8px 0;font-size:13px;line-height:1.6;color:${COLORS.steel};">Or paste this into your browser:</p>
<p style="margin:0 0 24px 0;font-size:13px;line-height:1.6;word-break:break-all;"><a href="${escapeHtml(data.url)}" style="color:${COLORS.sapphire};">${escapeHtml(data.url)}</a></p>
<p style="margin:0;font-size:13px;line-height:1.6;color:${COLORS.steel};">If you didn't ask for this, ignore this email. Your password stays as it is.</p>`;

  const text = [
    `Hi ${first},`,
    "",
    `Someone asked to reset the password for your Docerity admin account. If it was you, choose a new one here. The link works once, for the next ${data.minutes} minutes:`,
    "",
    data.url,
    "",
    "If you didn't ask for this, ignore this email. Your password stays as it is.",
  ].join("\n");

  return { subject, html: renderLayout({ title: subject, preheader: "Choose a new password. The link works for one hour.", body }), text };
}
