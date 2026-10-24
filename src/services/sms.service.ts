import { config } from '../config';

export interface SmsMessage {
  to: string;
  message: string;
}

export class SmsService {
  private static instance: SmsService;

  public static getInstance(): SmsService {
    if (!SmsService.instance) {
      SmsService.instance = new SmsService();
    }
    return SmsService.instance;
  }

  public async sendSms(payload: SmsMessage): Promise<boolean> {
    const { to, message } = payload;
    if (!to || !message) {
      return false;
    }

    try {
      if (config.smsProvider === 'twilio' && config.twilioAccountSid && config.twilioAuthToken) {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${config.twilioAccountSid}/Messages.json`;
        const auth = Buffer.from(`${config.twilioAccountSid}:${config.twilioAuthToken}`).toString('base64');
        const body = new URLSearchParams({
          To: to.startsWith('+') ? to : `+${to}`,
          From: config.twilioFromNumber,
          Body: message,
        });

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error('[SmsService: Twilio Error]', errText);
          return false;
        }
        return true;
      } else if (config.smsProvider === 'fast2sms' && config.fast2smsApiKey) {
        // Fast2SMS API (common in India)
        const cleanNumber = to.replace(/\D/g, '').slice(-10);
        const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            authorization: config.fast2smsApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'q',
            message,
            language: 'english',
            flash: 0,
            numbers: cleanNumber,
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error('[SmsService: Fast2SMS Error]', errText);
          return false;
        }
        return true;
      } else {
        // Dev / Console mode
        if (config.nodeEnv !== 'test') {
          console.log(`[SmsService: Log Mode] SMS dispatched to ${to}: "${message}"`);
        }
        return true;
      }
    } catch (err) {
      console.error('Failed to dispatch SMS:', err);
      return false;
    }
  }

  public async notifyAdminNewInquiry(name: string, phone: string): Promise<boolean> {
    if (!config.whatsappNumber) return false;
    const msg = `Louka Engineering: New inquiry received from ${name} (${phone}). Check your email or admin portal.`;
    return this.sendSms({ to: config.whatsappNumber, message: msg });
  }
}
