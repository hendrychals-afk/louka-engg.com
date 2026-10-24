# Environment Variables Checklist
## Louka Engineering Website & Review System

This document outlines every environment variable supported by the Louka Review System backend, detailing its requirement level in production, security impact, defaults, and configuration advice for **GoDaddy cPanel**.

---

## 🔐 Core Security & Authentication Variables

| Variable Name | Required in Prod? | Default (Dev) | Description & Security Best Practices |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | **YES** | `development` | Set to `production`. Disables verbose error stacks sent to clients, activates strict credential verification, and enforces production rate limits. |
| `ADMIN_PASSWORD` | **YES** *(or hash)* | None | Plaintext password for admin authentication (`/admin`). The server will fail fast at startup in production if neither `ADMIN_PASSWORD` nor `ADMIN_PASSWORD_HASH` is defined. Must be at least 16 characters. |
| `ADMIN_PASSWORD_HASH` | Optional | None | Salted bcrypt hash (`$2a$` or `$2b$`) for the admin password. Recommended over plaintext `ADMIN_PASSWORD`. Can be generated via: `node -e "console.log(require('bcryptjs').hashSync('YourSecurePass', 12))"` |
| `SESSION_SECRET` | **YES** | Dev fallback | Cryptographic secret used to sign admin session cookies with HMAC-SHA256. Minimum 64 characters. Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `IP_HASH_SALT` | **YES** | Dev fallback | Salt used to HMAC-anonymize client IP addresses before storing them in `reviews.json`, `inquiries.json`, and `rate-limits.json`. Prevents exposure of visitor IP addresses. Minimum 32 characters. |
| `ADMIN_SESSION_LIFETIME` | Optional | `1500` (25 min) | Session lifetime in seconds before automatic logout. Expired sessions are scrubbed automatically by a background timer every 10 minutes. |

---

## 🌐 Server & Domain Configuration

| Variable Name | Required in Prod? | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | Auto (cPanel) | `3000` | Port for Express server. When deployed via Phusion Passenger on cPanel, Passenger dynamically assigns this variable. |
| `SITE_URL` | **YES** | `https://www.loukaengg.com` | Primary HTTPS origin of your website. Used to configure strict CORS headers and absolute links in notifications. |
| `WHATSAPP_NUMBER` | Optional | `918667556619` | Canonical Louka Engineering WhatsApp number (+91 86675 56619). Standardized across the entire backend, frontend floating button, footer, and Schema.org metadata. |
| `REVIEWS_PER_PAGE` | Optional | `6` | Number of reviews displayed per pagination chunk on the frontend. |
| `PUBLISH_IMMEDIATELY`| Optional | `true` | If `true`, approved reviews appear publicly immediately. If `false`, submissions require admin moderation before appearing. |
| `RATE_LIMIT_HOURS` | Optional | `24` | Cooldown period in hours before a single IP can submit another review. Validated submissions only trigger this limit. |
| `MAX_PHOTO_BYTES` | Optional | `2097152` (2 MB) | Maximum permitted size for uploaded review photos in bytes. Memory buffered and validated via binary magic bytes before storage. |

---

## 📧 Email Notification Settings (Nodemailer)

### Option 1: GoDaddy Shared Hosting Internal Relay (Recommended on cPanel)
GoDaddy shared hosting blocks outbound ports 25, 465, and 587 to external hosts. Use GoDaddy's unblocked internal relay:

```env
SMTP_HOST=relay-hosting.secureserver.net
SMTP_PORT=25
SMTP_USER=
SMTP_PASS=
SMTP_SECURE=false
FROM_EMAIL=noreply@loukaengg.com
NOTIFY_EMAIL=edward@loukaengg.com
```

### Option 2: External Authenticated SMTP (Non-GoDaddy or VPS Hosting)
If your host permits external SMTP traffic (e.g. Brevo, Google Workspace, AWS SES):

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_brevo_account@domain.com
SMTP_PASS=your_smtp_key
SMTP_SECURE=false
FROM_EMAIL=noreply@loukaengg.com
NOTIFY_EMAIL=edward@loukaengg.com
```

---

## 📱 SMS Gateway Settings

| Variable Name | Required in Prod? | Default | Description |
| :--- | :---: | :--- | :--- |
| `SMS_PROVIDER` | Optional | `console` | Choices: `console` (dev logging only), `twilio`, or `fast2sms`. |
| `TWILIO_ACCOUNT_SID` | If Twilio | Empty | Your Twilio Account SID. |
| `TWILIO_AUTH_TOKEN` | If Twilio | Empty | Your Twilio Auth Token. |
| `TWILIO_FROM_NUMBER` | If Twilio | Empty | Twilio phone number with country code. |
| `FAST2SMS_API_KEY` | If Fast2SMS | Empty | Fast2SMS authorization API key (popular in India). |

---

## 📁 Storage Paths (Defaults are Automatic)

The application automatically resolves all storage directories relative to the working directory:

- `data/reviews.json`: Main review storage
- `data/inquiries.json`: Contact form submissions
- `data/sessions.json`: Persisted admin login sessions
- `data/rate-limits.json`: IP submission timestamps
- `data/backups/`: Rolling daily backups with 30-day retention
- `data/uploads/`: Validated review photos

No manual configuration needed unless placing data on an external volume.

---

## ✅ Production Pre-Flight Checklist

Before launching on GoDaddy cPanel, confirm the following:

- [ ] `NODE_ENV=production` is set in cPanel environment variables.
- [ ] `ADMIN_PASSWORD` or `ADMIN_PASSWORD_HASH` is set and contains a strong, unguessable string.
- [ ] `SESSION_SECRET` is set to a unique 64-character random string.
- [ ] `IP_HASH_SALT` is set to a unique 32-character random string.
- [ ] `SITE_URL` matches your exact custom domain (including `https://`).
- [ ] `SMTP_HOST=relay-hosting.secureserver.net` and `SMTP_PORT=25` are set for GoDaddy internal email dispatch.
- [ ] `NOTIFY_EMAIL` points to the authorized company inbox (`edward@loukaengg.com`).
- [ ] `.env` permissions are set to `600` (read/write only by owner) in cPanel File Manager.
