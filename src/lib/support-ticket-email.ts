import nodemailer from "nodemailer";

interface SupportTicketReplyEmailInput {
  to: string;
  recipientName: string;
  ticketId: number;
  originalMessage: string;
  replyMessage: string;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT ?? "0");
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM?.trim() || user;
  const replyTo = process.env.SMTP_REPLY_TO?.trim() || from;

  if (!host || !port || !from) {
    throw new Error("Missing SMTP configuration");
  }

  if ((user && !pass) || (!user && pass)) {
    throw new Error("Incomplete SMTP auth configuration");
  }

  const secureEnv = (process.env.SMTP_SECURE ?? "").toLowerCase();
  const secure = secureEnv ? secureEnv === "true" : port === 465;

  return {
    host,
    port,
    secure,
    from,
    replyTo,
    auth: user && pass ? { user, pass } : undefined,
  };
}

export async function sendSupportTicketReplyEmail(input: SupportTicketReplyEmailInput) {
  const smtp = getSmtpConfig();

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.auth,
  });

  const safeRecipient = escapeHtml(input.recipientName || "Customer");
  const safeReply = escapeHtml(input.replyMessage).replace(/\n/g, "<br/>");
  const safeOriginal = escapeHtml(input.originalMessage).replace(/\n/g, "<br/>");

  const subject = `Reply to your support ticket #${input.ticketId}`;

  const text = [
    `Hi ${input.recipientName || "Customer"},`,
    "",
    `We have replied to your support ticket (#${input.ticketId}).`,
    "",
    "Our reply:",
    input.replyMessage,
    "",
    "Your original message:",
    input.originalMessage,
    "",
    "Regards,",
    "Support Team",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <p>Hi ${safeRecipient},</p>
      <p>We have replied to your support ticket <strong>#${input.ticketId}</strong>.</p>
      <div style="padding: 12px; border-radius: 8px; background: #f3f4f6; border: 1px solid #e5e7eb; margin: 16px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Our reply</strong></p>
        <p style="margin: 0;">${safeReply}</p>
      </div>
      <div style="padding: 12px; border-radius: 8px; background: #ffffff; border: 1px solid #e5e7eb; margin: 16px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Your original message</strong></p>
        <p style="margin: 0;">${safeOriginal}</p>
      </div>
      <p style="margin-top: 16px;">Regards,<br/>Support Team</p>
    </div>
  `;

  await transporter.sendMail({
    from: smtp.from,
    to: input.to,
    replyTo: smtp.replyTo,
    subject,
    text,
    html,
  });
}