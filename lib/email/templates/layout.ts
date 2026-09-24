import { siteConfig } from "@/lib/config/site";

/*
  EJS escaped interpolated values automatically via `<%= %>`. These templates
  are plain template literals, which do not, so every piece of submitted text
  must pass through `escapeHtml` on the way in. Skipping it would let a visitor
  put markup (or a `<style>` block, or a link wearing your name) into an
  email that appears to come from Docerity.
*/
function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* Docerity's palette, inlined. Email clients strip <style> blocks and have no
   CSS custom property support, so tokens cannot come from globals.css. */
const COLORS = {
  obsidian: "#0A1120",
  surface: "#0F172A",
  sapphire: "#5B6EF5",
  violet: "#8B72E8",
  pearl: "#F5F7FB",
  steel: "#98A4B8",
  border: "#1E293B",
} as const;

type LayoutArgs = {
  title: string;
  preheader: string;
  body: string;
};

function renderLayout({ title, preheader, body }: LayoutArgs): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.obsidian};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <!-- Preheader: the grey preview line in an inbox list. Hidden in the body. -->
  <div style="display:none;font-size:1px;color:${COLORS.obsidian};max-height:0;overflow:hidden;">${escapeHtml(preheader)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.obsidian};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:${COLORS.surface};border:1px solid ${COLORS.border};border-radius:14px;overflow:hidden;">
          <tr>
            <td style="height:3px;background:linear-gradient(90deg,${COLORS.sapphire},${COLORS.violet});"></td>
          </tr>
          <tr>
            <td style="padding:32px 32px 8px 32px;">
              <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${COLORS.sapphire};font-weight:600;">${escapeHtml(siteConfig.name)}</p>
              <h1 style="margin:12px 0 0 0;font-size:22px;line-height:1.3;color:${COLORS.pearl};font-weight:600;">${escapeHtml(title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 32px 32px;">${body}</td>
          </tr>
        </table>

        <p style="margin:20px 0 0 0;font-size:12px;color:${COLORS.steel};">
          ${escapeHtml(siteConfig.name)} ·
          <a href="${siteConfig.url}" style="color:${COLORS.steel};">${escapeHtml(siteConfig.url.replace("https://", ""))}</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* A label/value row used by both enquiry templates. Empty values are dropped
   by the caller rather than rendered as blank rows. */
function renderRow(label: string, value: string): string {
  return `<tr>
  <td style="padding:8px 0;border-bottom:1px solid ${COLORS.border};width:34%;vertical-align:top;font-size:13px;color:${COLORS.steel};">${escapeHtml(label)}</td>
  <td style="padding:8px 0;border-bottom:1px solid ${COLORS.border};font-size:14px;color:${COLORS.pearl};">${escapeHtml(value)}</td>
</tr>`;
}

function renderRows(rows: [string, string][]): string {
  const filled = rows.filter(([, value]) => value.trim().length > 0);
  if (filled.length === 0) return "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
${filled.map(([label, value]) => renderRow(label, value)).join("\n")}
</table>`;
}

/* `white-space:pre-wrap` keeps the paragraph breaks someone typed into the
   textarea, after escaping has removed any markup meaning. */
function renderParagraphBlock(text: string): string {
  return `<div style="margin:16px 0 0 0;padding:16px;background-color:${COLORS.obsidian};border:1px solid ${COLORS.border};border-radius:10px;font-size:14px;line-height:1.7;color:${COLORS.pearl};white-space:pre-wrap;">${escapeHtml(text)}</div>`;
}

export { escapeHtml, renderLayout, renderRows, renderParagraphBlock, COLORS };
