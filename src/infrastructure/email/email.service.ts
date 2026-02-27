import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.EMAIL_FROM ?? "Toutopia <noreply@toutopia.id>";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set, skipping email to:", to);
    return;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("[email] Failed to send email:", error);
  }
}

export function sendEmailAsync(params: SendEmailParams): void {
  sendEmail(params).catch((error) => {
    console.error("[email] Async send failed:", error);
  });
}
