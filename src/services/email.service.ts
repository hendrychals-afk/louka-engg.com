import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config';
import { StoredReview, ContactSubmission } from '../types';

export class EmailService {
  private static instance: EmailService;
  private transporter: Transporter | null = null;

  private constructor() {
    this.initTransporter();
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private initTransporter(): void {
    if (config.smtpHost) {
      const transportOptions: Record<string, unknown> = {
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecure,
      };

      // Only add auth if credentials are provided (e.g., GoDaddy relay-hosting.secureserver.net does not require auth)
      if (config.smtpUser) {
        transportOptions.auth = {
          user: config.smtpUser,
          pass: config.smtpPass,
        };
      }

      this.transporter = nodemailer.createTransport(transportOptions as any);
    } else {
      if (config.nodeEnv === 'production') {
        console.warn(
          '[EmailService WARNING] SMTP settings (SMTP_HOST) are not configured. Emails will fail in production!'
        );
      }
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  public async notifyNewReview(review: StoredReview): Promise<boolean> {
    if (!config.notifyEmail) {
      return false;
    }

    const adminUrl = `${config.siteUrl}/admin`;
    const subject = 'New review published — Louka Engineering';
    const body = `A new review was submitted and published on the website.

Name: ${review.name}
Role: ${review.role}
Company: ${review.company || 'N/A'}
Service: ${review.service || 'Other'}
Rating: ${review.rating}/5
Review: ${review.text}

Approve or reject: ${adminUrl}
`;

    try {
      if (!this.transporter) this.initTransporter();
      await this.transporter!.sendMail({
        from: `"Louka Engineering" <${config.fromEmail}>`,
        to: config.notifyEmail,
        replyTo: review.email || config.notifyEmail,
        subject,
        text: body,
      });
      return true;
    } catch (err) {
      console.error('Failed to send review notification email:', err);
      if (config.nodeEnv === 'production') {
        throw err;
      }
      return false;
    }
  }

  public async notifyContactMessage(contact: ContactSubmission): Promise<boolean> {
    if (!config.notifyEmail) {
      return false;
    }

    if (config.nodeEnv === 'production' && !config.smtpHost) {
      throw new Error('SMTP email service is not configured on the server. Please contact us directly by phone or WhatsApp.');
    }

    const subject = `New Website Inquiry from ${contact.name} — Louka Engineering`;
    const body = `You received a new inquiry from the website contact form:

Name: ${contact.name}
Email: ${contact.email}
Phone: ${contact.phone}

Message:
${contact.message}
`;

    try {
      if (!this.transporter) this.initTransporter();
      await this.transporter!.sendMail({
        from: `"Louka Engineering Contact" <${config.fromEmail}>`,
        to: config.notifyEmail,
        replyTo: contact.email,
        subject,
        text: body,
      });
      return true;
    } catch (err) {
      console.error('Failed to send contact notification email:', err);
      throw err;
    }
  }
}
