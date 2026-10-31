import { COLORS, escapeHtml, renderLayout } from "@/lib/email/templates/layout";

/*
  The emails the client portal sends: confirming an address, resetting a
  password, and telling a client their project has moved. Each has the link as
  a button and written out, since some mail clients strip buttons.
*/

function button(url: string, label: string) {
  return `<p style="margin:0 0 24px 0;"><a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 22px;border-radius:999px;background-color:${COLORS.sapphire};color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">${escapeHtml(label)}</a></p>
<p style="margin:0 0 8px 0;font-size:13px;line-height:1.6;color:${COLORS.steel};">Or paste this into your browser:</p>
<p style="margin:0 0 24px 0;font-size:13px;line-height:1.6;word-break:break-all;"><a href="${escapeHtml(url)}" style="color:${COLORS.sapphire};">${escapeHtml(url)}</a></p>`;
}

function para(text: string) {
  return `<p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:${COLORS.pearl};">${text}</p>`;
}

const first = (name: string) => name.split(" ")[0] || "there";

export function renderVerifyEmail(data: { name: string; url: string }) {
  const subject = "Confirm your email for Docerity";
  const body =
    para(`Hi ${escapeHtml(first(data.name))},`) +
    para("Confirm this is your address and your Docerity account is ready. Your projects and requests appear once it is confirmed. The link works for two days.") +
    button(data.url, "Confirm my email") +
    `<p style="margin:0;font-size:13px;line-height:1.6;color:${COLORS.steel};">If you didn't create an account, ignore this email and nothing will happen.</p>`;
  const text = `Hi ${first(data.name)},\n\nConfirm this is your address and your Docerity account is ready. The link works for two days:\n\n${data.url}\n\nIf you didn't create an account, ignore this email.`;
  return { subject, html: renderLayout({ title: subject, preheader: "One click and your account is ready.", body }), text };
}

export function renderAccountReset(data: { name: string; url: string }) {
  const subject = "Reset your Docerity password";
  const body =
    para(`Hi ${escapeHtml(first(data.name))},`) +
    para("Someone asked to reset the password for your Docerity account. If it was you, choose a new one here. The link works once, for the next hour.") +
    button(data.url, "Choose a new password") +
    `<p style="margin:0;font-size:13px;line-height:1.6;color:${COLORS.steel};">If you didn't ask for this, ignore this email. Your password stays as it is.</p>`;
  const text = `Hi ${first(data.name)},\n\nChoose a new password here. The link works once, for the next hour:\n\n${data.url}\n\nIf you didn't ask for this, ignore this email.`;
  return { subject, html: renderLayout({ title: subject, preheader: "Choose a new password.", body }), text };
}

export function renderProjectUpdate(data: { name: string; project: string; kind: string; title: string; body: string; url: string }) {
  const subject = `${data.project}: ${data.title}`;
  const excerpt = data.body.length > 600 ? `${data.body.slice(0, 600)}…` : data.body;
  const body =
    para(`Hi ${escapeHtml(first(data.name))},`) +
    para(`There's news on <strong>${escapeHtml(data.project)}</strong>.`) +
    `<p style="margin:0 0 6px 0;font-size:12px;color:${COLORS.steel};">${escapeHtml(data.kind)}</p>` +
    `<p style="margin:0 0 10px 0;font-size:17px;font-weight:600;color:${COLORS.pearl};">${escapeHtml(data.title)}</p>` +
    (excerpt ? `<p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:${COLORS.pearl};white-space:pre-line;">${escapeHtml(excerpt)}</p>` : "") +
    button(data.url, "See the project");
  const text = `Hi ${first(data.name)},\n\nThere's news on ${data.project}.\n\n${data.kind}: ${data.title}\n\n${excerpt}\n\nSee the project: ${data.url}`;
  return { subject, html: renderLayout({ title: data.title, preheader: `${data.kind} on ${data.project}`, body }), text };
}

/** To the team: a client replied under an update. */
export function renderClientReplyNotice(data: { client: string; project: string; update: string; body: string; url: string }) {
  const subject = `${data.client} replied on ${data.project}`;
  const body =
    para(`<strong>${escapeHtml(data.client)}</strong> replied to “${escapeHtml(data.update)}” on <strong>${escapeHtml(data.project)}</strong>:`) +
    `<p style="margin:0 0 24px 0;padding:14px 16px;border-left:3px solid ${COLORS.sapphire};font-size:15px;line-height:1.6;color:${COLORS.pearl};white-space:pre-line;">${escapeHtml(data.body)}</p>` +
    button(data.url, "Answer in the admin");
  const text = `${data.client} replied to "${data.update}" on ${data.project}:\n\n${data.body}\n\nAnswer in the admin: ${data.url}`;
  return { subject, html: renderLayout({ title: subject, preheader: data.body.slice(0, 90), body }), text };
}

/** To the client: the team answered their reply. */
export function renderTeamReply(data: { name: string; project: string; update: string; body: string; url: string }) {
  const subject = `Re: ${data.update}`;
  const body =
    para(`Hi ${escapeHtml(first(data.name))},`) +
    para(`We answered you on “${escapeHtml(data.update)}” in <strong>${escapeHtml(data.project)}</strong>:`) +
    `<p style="margin:0 0 24px 0;padding:14px 16px;border-left:3px solid ${COLORS.sapphire};font-size:15px;line-height:1.6;color:${COLORS.pearl};white-space:pre-line;">${escapeHtml(data.body)}</p>` +
    button(data.url, "See the conversation");
  const text = `Hi ${first(data.name)},\n\nWe answered you on "${data.update}" in ${data.project}:\n\n${data.body}\n\nSee the conversation: ${data.url}`;
  return { subject, html: renderLayout({ title: subject, preheader: data.body.slice(0, 90), body }), text };
}
