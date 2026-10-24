import { Request, Response, NextFunction } from 'express';
import { contactSchema } from '../validators/contact.validator';
import { EmailService } from '../services/email.service';
import { SmsService } from '../services/sms.service';
import { StoreService } from '../services/store.service';
import { getClientIp, recordContactAttempt } from '../middlewares/rate-limit.middleware';

export class ContactController {
  public static async submitContact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Honeypot anti-spam check
      const honeypot = (req.body?.website || '').toString().trim();
      if (honeypot !== '') {
        res.status(400).json({ error: 'Invalid submission' });
        return;
      }

      // 2. Validate input
      const validated = contactSchema.parse(req.body);
      const ip = getClientIp(req);

      // 3. Persist inquiry to disk immediately so no inquiry is ever lost
      StoreService.getInstance().saveInquiry(
        {
          name: validated.name,
          email: validated.email,
          phone: validated.phone,
          message: validated.message,
        },
        ip
      );

      // 4. Record rate limit attempt on successful submission
      recordContactAttempt(ip);

      // 5. Send notification email & SMS
      let emailSent = false;
      try {
        emailSent = await EmailService.getInstance().notifyContactMessage(validated);
      } catch (emailErr) {
        console.error('[ContactController] Email delivery failed:', emailErr);
        // Continue to respond if message was persisted, but inform user
      }

      SmsService.getInstance().notifyAdminNewInquiry(validated.name, validated.phone).catch((e) =>
        console.error('Contact SMS alert failed:', e)
      );

      res.json({
        success: true,
        message: "Thanks — your message has been received. We'll be in touch soon.",
        delivered: emailSent,
      });
    } catch (err) {
      next(err);
    }
  }
}
