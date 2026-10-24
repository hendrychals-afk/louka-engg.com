import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Robust app root resolution: works in both src/ and dist/ environments
export const appRootDir = path.resolve(__dirname, '../../');

// Load .env explicitly from app root first, then fallback to current working directory
const envPath = path.resolve(appRootDir, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}
dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const adminPassword = process.env.ADMIN_PASSWORD || '';
const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || '';

// Fail-fast in production: Never allow empty or hardcoded default admin credentials
if (nodeEnv === 'production' && !adminPassword && !adminPasswordHash) {
  const errMsg =
    'FATAL SECURITY ERROR: ADMIN_PASSWORD or ADMIN_PASSWORD_HASH must be set in production environment variables or .env file.';
  console.error(`[CRITICAL CONFIGURATION ERROR] ${errMsg}`);
  throw new Error(errMsg);
}

// Support Phusion Passenger 'passenger' socket string or standard port number
const rawPort = process.env.PORT || '3000';
const parsedPort = rawPort === 'passenger' ? 'passenger' : (parseInt(rawPort, 10) || 3000);

export const config = {
  appRootDir,
  port: parsedPort,
  nodeEnv,
  siteUrl: (process.env.SITE_URL || 'https://www.loukaengg.com').replace(/\/$/, ''),

  // Authentication & Security
  adminPassword: adminPassword || (nodeEnv !== 'production' ? 'louka-dev-admin-2026' : ''),
  adminPasswordHash,
  adminSessionLifetimeSeconds: parseInt(process.env.ADMIN_SESSION_LIFETIME || '1500', 10), // 25 minutes
  sessionSecret: process.env.SESSION_SECRET || 'louka-session-secret-change-in-production-2026',
  ipHashSalt: process.env.IP_HASH_SALT || 'louka-ip-salt-2026',

  // Notifications & Contacts
  notifyEmail: process.env.NOTIFY_EMAIL || 'edward@loukaengg.com',
  reviewsPerPage: parseInt(process.env.REVIEWS_PER_PAGE || '6', 10),
  // Single source of truth for Louka Engineering (+91 86675 56619 -> 918667556619)
  whatsappNumber: (process.env.WHATSAPP_NUMBER || '918667556619').replace(/\D/g, ''),
  maxPhotoBytes: parseInt(process.env.MAX_PHOTO_BYTES || '2097152', 10), // 2 MB
  allowedPhotoTypes: ['image/jpeg', 'image/png', 'image/webp'],
  publishImmediately: process.env.PUBLISH_IMMEDIATELY !== 'false',
  rateLimitHours: parseInt(process.env.RATE_LIMIT_HOURS || '24', 10),

  // Storage Paths (Anchored to appRootDir for reliability under Phusion Passenger)
  dataDir: path.resolve(appRootDir, 'data'),
  reviewsFile: path.resolve(appRootDir, 'data', 'reviews.json'),
  rateLimitsFile: path.resolve(appRootDir, 'data', 'rate-limits.json'),
  inquiriesFile: path.resolve(appRootDir, 'data', 'inquiries.json'),
  sessionsFile: path.resolve(appRootDir, 'data', 'sessions.json'),
  uploadsDir: path.resolve(appRootDir, 'data', 'uploads'),
  backupsDir: path.resolve(appRootDir, 'data', 'backups'),

  // Email SMTP Settings
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpSecure: process.env.SMTP_SECURE === 'true',
  fromEmail: process.env.FROM_EMAIL || 'noreply@loukaengg.com',

  // SMS Gateway Settings
  smsProvider: process.env.SMS_PROVIDER || 'console', // 'twilio' | 'fast2sms' | 'console'
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
  twilioFromNumber: process.env.TWILIO_FROM_NUMBER || '',
  fast2smsApiKey: process.env.FAST2SMS_API_KEY || '',
};
